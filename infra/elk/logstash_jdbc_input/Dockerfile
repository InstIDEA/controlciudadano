FROM docker.elastic.co/logstash/logstash:7.9.3


ENV LOGSTASH_JDBC_DRIVER_JAR_LOCATION=/usr/share/logstash/logstash-core/lib/jars/postgresql.jar
# install dependency
RUN /usr/share/logstash/bin/logstash-plugin install logstash-filter-aggregate && \
    /usr/share/logstash/bin/logstash-plugin install logstash-filter-mutate

RUN curl https://jdbc.postgresql.org/download/postgresql-42.2.18.jar -o $LOGSTASH_JDBC_DRIVER_JAR_LOCATION

ADD ./logstash.conf /usr/share/logstash/pipeline/logstash.conf

