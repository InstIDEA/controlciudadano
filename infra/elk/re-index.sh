#!/bin/bash


set -e
set -x

INDEX_NAME=$1
FILE_NAME=$2


docker-compose stop logstash

rm -rvf "logstash_data/$FILE_NAME"

docker-compose exec elasticsearch curl -XDELETE localhost:9200/$INDEX_NAME

echo "Index removed, restarting"


docker-compose up -d --build logstash

echo "The index should start updating very soon, check logs"


