FROM python:3.12.3

RUN apt-get update && apt-get install --yes \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    binutils \
    gcc \
    gdal-bin \
    wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app

RUN pip install -r requirements.txt

ENTRYPOINT ["python"]

EXPOSE 5001

CMD ["app.py"]
