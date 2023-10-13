FROM continuumio/miniconda3:23.5.2-0

ENV CONDA_AUTO_UPDATE_CONDA=false

RUN mkdir /app
WORKDIR /app

COPY docker/env.yml /app/env.yml

RUN conda env update -n base -f /app/env.yml \
    && rm /app/env.yml \
    && conda clean -ya

COPY ./ /app
RUN rm -rf /app/docker

COPY libs/ /app/libs

COPY ./docker/entrypoint.sh /app
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["bash", "/app/entrypoint.sh"]