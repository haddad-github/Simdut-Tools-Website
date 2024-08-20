FROM python:3.12.2

RUN apt-get update && apt-get install --yes \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    binutils \
    gcc \
    gdal-bin \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app

RUN pip install -r requirements.txt

ENTRYPOINT ["python"]

EXPOSE 5000

CMD ["app.py"]
