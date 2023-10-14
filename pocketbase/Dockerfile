FROM debian:11

WORKDIR /pocketbase

RUN apt update -y
RUN apt install -y unzip wget

RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.18.10/pocketbase_0.18.10_linux_amd64.zip
RUN unzip pocketbase_0.18.10_linux_amd64.zip

COPY ./pb_migrations ./pb_migrations

WORKDIR /

