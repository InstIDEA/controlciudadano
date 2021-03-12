from json import loads
from json import dumps
from time import sleep
from requests import post
from random import randint
from string import Template
from datetime import timedelta
from airflow.hooks.postgres_hook import PostgresHook
from airflow.models import DAG
from airflow.models import Variable
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago

dag_timer = int(Variable.get("CGR_PARSER_TIMER", 0))
dag_services = str(Variable.get("CGR_PARSER_SERVICES", "http://localhost:8000/parser/send")).split(",")
dag_year_filter = int(Variable.get("CGR_PARSER_MIN_YEAR", 2015))
dag_sub_jobs_count = int(Variable.get("CGR_PARSER_SUB_JOBS_COUNT", 16))
dag_sub_jobs_batch_size = int(Variable.get("CGR_PARSER_PDF_SUB_JOBS_BATCH_SIZE", 10))

default_args = {
	"owner": "airflow",
	"depends_on_past": False,
	"email": ["arturovolpe@gmail.com"],
	"email_on_failure": False,
	"email_on_retry": False,
	"retry_delay": timedelta(hours=1)
}

# parser request template
parser_request = {
	"file": {
		"path": "$resource"
	}
}

dag = DAG(
	dag_id="contralory_declaration_data_extraction",
	default_args=default_args,
	description="CGR data extraction with concurrent calls to ms_djbr_parser API",
	start_date=days_ago(1),
	schedule_interval=timedelta(weeks=1),
)

def is_valid_data(data):
	if data is None:
		return False

	if not 'resumen' in data.keys():
		return False

	items = list(data['resumen'].values())

	if len(items) != 3:
		return False

	if sum(map(abs, items)) == 0:
		return False

	return True

# redirect the request traffic
def get_random_url():
	return dag_services[randint(0, len(dag_services) - 1)]

# arithmetic progression generator
def ap(pos, first_item, second_item):
	diff = second_item - first_item
	index = pos

	# generare index item
	def generate():
		nonlocal diff
		nonlocal index
		index += 1
		return first_item + ((index - 1) - 1) * diff

	return generate

def list_navigator(cursor, ap, year, batch_size):
	should_continue = True

	while should_continue:
		cursor.execute("""
		SELECT drd.id as raw_id, ddf.file_name from staging.djbr_downloaded_files ddf
		INNER JOIN staging.djbr_raw_data drd on ddf.raw_data_id = drd.id
		WHERE drd.periodo >= %s
		ORDER BY drd.id DESC -- begin with the latest declaration
		OFFSET %s
		LIMIT %s
		""", [year, ap(), batch_size])

		# fetchall to dictionary
		desc = cursor.description
		column_names = [col[0] for col in desc]
		to_yield = [dict(zip(column_names, row)) for row in cursor.fetchall()]
		yield to_yield

		should_continue = len(to_yield) != 0

def do_work(first_item, second_item, year, batch_size):
	db_hook = PostgresHook(postgres_conn_id="postgres_default", schema="db")
	db_conn = db_hook.get_conn()
	db_cursor = db_conn.cursor()

	page_size = ap(1, first_item, second_item)

	insert_query = """
	INSERT INTO analysis.ddjj_readable_data (
		raw_data_id,
		active,
		passive,
		net_worth,
		parser
	) VALUES (%s, %s, %s, %s, %s)
	ON CONFLICT DO NOTHING;
	"""

	delete_query = """DELETE FROM staging.djbr_downloaded_files WHERE raw_data_id = %s"""

	for rows in list_navigator(db_cursor, page_size, year, batch_size):
		to_insert = []
		to_delete = []

		for row in rows:
			t = Template(dumps(parser_request))
			payload = t.substitute(resource=row['file_name'])
			result = post(get_random_url(), data=payload)

			if result.text is not None:
				data = loads(result.text)
				if 'data' in data.keys():
					data = data['data']
					if is_valid_data(data):
						to_insert.append([row['raw_id'],data['resumen']['totalActivo'],
						data['resumen']['totalPasivo'], data['resumen']['patrimonioNeto'],
						"ms_djbr_parser"])
					else:
						to_delete.append([row['raw_id']])

			if dag_timer > 0:
				sleep(dag_timer)

		if len(to_delete) > 0:
			print(f"Sending {len(to_delete)}")
			db_cursor.executemany(delete_query, to_delete)
			db_conn.commit()

		if len(to_insert) > 0:
			print(f"Sending {len(to_insert)}")
			db_cursor.executemany(insert_query, to_insert)
			db_conn.commit()

with dag:
	launch = DummyOperator(task_id="start")
	done = DummyOperator(task_id="done")

	clean_db = PostgresOperator(task_id='clean_table',
								sql="""
									CREATE TABLE IF NOT EXISTS analysis.ddjj_readable_data (
										id bigserial primary key,
										raw_data_id bigint,
										active numeric(20,2),
										passive numeric(20,2),
										net_worth numeric(20,2),
										declaration_date timestamp,
										parser text NULL,
										UNIQUE(raw_data_id)
									);
									""")

	for digit in range(0, dag_sub_jobs_count):
		first_item = digit * dag_sub_jobs_batch_size
		second_item = first_item + (dag_sub_jobs_count * dag_sub_jobs_batch_size)

		parser_number = PythonOperator(
			task_id=f"""parser_number_{digit}""",
			python_callable=do_work,
			op_kwargs={
				"first_item": first_item,
				"second_item": second_item,
				"batch_size": dag_sub_jobs_batch_size,
				"year": dag_year_filter,
			},
		)

		clean_db >> parser_number >> done

	launch >> clean_db

if __name__ == "__main__":
	dag.clear(reset_dag_runs=True)
	dag.run()