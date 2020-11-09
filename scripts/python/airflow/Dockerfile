FROM puckel/docker-airflow:1.10.9
MAINTAINER Arturo Volpe <arturovolpe@gmail.com>

COPY ./dags/ /usr/local/airflow/dags
COPY ./requirements.txt /requirements.txt

CMD ["webserver"]
