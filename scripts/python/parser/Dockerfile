# https://github.com/tiangolo/uvicorn-gunicorn-fastapi-docker
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8

WORKDIR /app
COPY ./app/ /app/
COPY ./requirements.txt /app/
RUN pip install -r requirements.txt
