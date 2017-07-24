FROM python

EXPOSE 8080

WORKDIR /usr/src/app

RUN apt-get install --no-install-recommends git

COPY requirements.txt /usr/src/app/requirements.txt
COPY main.py /usr/src/app/main.py

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "./main.py"]