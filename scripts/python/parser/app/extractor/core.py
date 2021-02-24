from pdftotext import PDF
from json import loads as json_loads
from requests import get as requests_get
from subprocess import Popen
from subprocess import PIPE
from logging import basicConfig as log_config
from logging import error as log
from os import path
from re import search as re_search
from re import UNICODE as re_unicode
from settings import PARSERENGINE_GO_BIN
from settings import PARSERENGINE_IN
from settings import PARSERENGINE_OUT
from extractor.models import Session
from extractor.models.djbr_extracted_data import DJBRExtractedData
from hashlib import md5
from sqlalchemy.sql.expression import literal

log_config(
	# filename="log.txt",
	format='%(levelname)s: %(asctime)s: %(module)s: %(message)s'
)

class DJBRParser:
	djbr_cid = 0
	djbr_fullname = ''
	djbr_remote = True
	djbr_type = ''
	djbr_path = ''
	djbr_version = ''

	pdf = None
	stdout = { }
	filepath = None

	def __init__(self, ppath, pcid='', pfullname='', ptype='autodetect', premote=True, pversion=''):
		self.djbr_path = ppath.strip()
		self.djbr_cid = pcid
		self.djbr_fullname = pfullname
		self.djbr_type = ptype
		self.djbr_remote = premote
		self.djbr_version = pversion

		self.set_djbr_filepath()

	def extract(self):
		self.request_download()
		try:
			proc = Popen([f'{PARSERENGINE_GO_BIN}', self.filepath],
				stdout=PIPE,
				stderr=PIPE)
		except Exception as e:
			log(str(e), exc_info=True)
		else:
			outs, errs = proc.communicate()
			if errs:
				log('{0}: {1}'.format(self.filepath, errs.decode('utf-8')))
				return

			if not outs:
				log(f'{self.filepath}: failed when get stdout from parser')
				return

			self.stdout = json_loads(outs.decode('utf-8'))
			if self.get_messages():
				for item in self.get_messages():
					log(f'{self.filepath}: {item}')

	def request_download(self):
		file = self.get_djbr_filepath()
		if path.isfile(file):
			return
		try:
			response = requests_get(self.djbr_path)
			response.raise_for_status()
		except Exception as e:
			log(str(e), exc_info=True)
		else:
			with open(file, 'wb') as f:
				f.write(response.content)

	def get_messages(self):
		if not self.stdout:
			return None
		return self.stdout['message']

	def get_status(self):
		if not self.stdout:
			return None
		return self.stdout['status']

	def get_data(self):
		if not self.stdout:
			return None
		return self.stdout['data']

	def get_raw_data(self):
		if not self.stdout:
			return None
		return ''.join(self.stdout['raw'])

	def get_stdout(self):
		return self.stdout

	def print(self):
		print(self.stdout)

	def analyze_pdf(self):
		if self.pdf:
			return

		file = self.get_djbr_filepath()
		with open(file, "rb") as f:
			self.pdf = PDF(f)
		self.pdf = "".join(self.pdf)

		# djbr:version
		pattern = '(versi.n).*'
		result = re_search(pattern, self.pdf, re_unicode)
		result = str(result.group()).split()
		for value in result:
			if value.replace('.', '').isdigit():
				self.djbr_version = value
				break

	def get_djbr_version(self):
		return self.djbr_version

	def get_djbr_filepath(self):
		return self.filepath

	def set_djbr_filepath(self):
		if self.filepath:
			return

		if not self.djbr_remote:
			self.filepath = self.djbr_path
			return

		dfname = self.djbr_path.split('/')
		self.filepath = f'{PARSERENGINE_IN}/{dfname[len(dfname)-1]}'

	def is_parsable(self):
		if not self.djbr_version:
			return False
		return True

	def raw_data_to_file(self):
		raw = self.get_raw_data()
		if not raw:
			return

		dfname = self.filepath.split('/')
		file = f'{PARSERENGINE_OUT}/{dfname[len(dfname)-1].replace(".pdf", ".txt")}'
		with open(file, 'w') as f:
			f.write(raw)

	def save(self):
		data = self.get_data()
		if not data:
			return

		raw = self.get_raw_data()
		if not raw:
			return

		session = Session()
		key = md5(raw.encode()).hexdigest()

		query = session.query(literal(True)).\
			filter(DJBRExtractedData.hash == key).first()

		if query:
			return

		fullname = ' '.join([data['nombre'], data['apellido']])
		djbr = DJBRExtractedData(fullname, data, key)
		session.add(djbr)
		session.commit()
