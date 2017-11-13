FROM python:3-alpine

EXPOSE 8080

WORKDIR /usr/src/app

RUN apk add --no-cache git tzdata

COPY requirements.txt /usr/src/app/requirements.txt
COPY main.py /usr/src/app/main.py

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "./main.py"]
