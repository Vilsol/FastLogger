FROM python:3.3.6-alpine3.4

EXPOSE 8080

WORKDIR /usr/src/app

RUN apk add --no-cache git

COPY requirements.txt /usr/src/app/requirements.txt
COPY main.py /usr/src/app/main.py

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "./main.py"]
