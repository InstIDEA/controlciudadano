# https://github.com/tiangolo/uvicorn-gunicorn-fastapi-docker
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8

RUN wget https://golang.org/dl/go1.15.8.linux-amd64.tar.gz && tar -C /usr/local -xzf go1.15.8.linux-amd64.tar.gz && rm -f go1.15.8.linux-amd64.tar.gz
ENV PATH=/usr/local/go/bin:$PATH
RUN git clone https://www.github.com/InstIDEA/ddjj /opt/ddjj &&\
    (cd /opt/ddjj/parser && git checkout 1.0.2 && go install)
   
ENV PARSERENGINE_GO_BIN=/root/go/bin/parser

RUN apt-get update
RUN apt install -y build-essential libpoppler-cpp-dev pkg-config python3-dev poppler-utils > /dev/null 2>/dev/null
RUN apt-get clean

WORKDIR /opt/app
COPY ./requirements.txt /opt/app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY ./app/ /opt/app/
COPY ./.env /opt/app/

RUN mkdir in
RUN mkdir out

WORKDIR /opt/app
