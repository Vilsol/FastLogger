from multiprocessing.dummy import Process
from http.server import BaseHTTPRequestHandler
from aiohttp import web
from dateutil import parser

import fastdotcom
import time
import os
import asyncio
import re
import json


sleep_min = int(os.getenv("SLEEP_MIN", 10))
date_format = os.getenv("DATE_FORMAT", "%a %b %d %X %Z %Y")
log_format = os.getenv("LOG_FORMAT", "{} - {} Mbps")
output_file = os.getenv("OUTPUT_FILE", "/speed-log.txt")
listen_port = int(os.getenv("LISTEN_PORT", 8080))

line_regex = re.compile(log_format.format("(.+?)", "([0-9.]+)"))


async def get_data(request):
    data = []
    with open(output_file) as out:
        lines = out.read().split('\n')
        for i in lines:
            match = line_regex.match(i)
            if match is not None:
                data.append({
                    'time': int(time.mktime(time.strptime(match.group(1), date_format))),
                    'speed': float(match.group(2))
                })

    return web.Response(body=json.dumps(data).encode('utf-8'), content_type='application/json')


async def get_raw(request):
    with open(output_file) as out:
        return web.Response(body=out.read().encode('utf-8'), content_type='text/plain')


def run_webserver(port, loop):
    app = web.Application(loop=loop)
    app.router.add_static('/node_modules', './node_modules')
    app.router.add_get('/raw', get_raw)
    app.router.add_get('/data', get_data)
    app.router.add_static('/', './static')
    web.run_app(app, port=port, loop=loop)


if __name__ == '__main__':
    open(output_file, "a+").close()

    p = Process(target=run_webserver, args=(listen_port, asyncio.get_event_loop(),))
    p.start()

    try:
        while True:
            speed = fastdotcom.fast_com(maxtime=6)
            date = time.strftime(date_format)
            output = log_format.format(date, speed)

            with open(output_file, "a+") as f:
                f.write(output + "\n")

            time.sleep(60 * sleep_min)
    except Exception as e:
        print(e)
        pass
