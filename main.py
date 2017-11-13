from multiprocessing.dummy import Pool as ThreadPool
from http.server import BaseHTTPRequestHandler, HTTPServer

import fastdotcom
import time
import os


sleep_min = os.getenv("SLEEP_MIN", 10)
date_format = os.getenv("DATE_FORMAT", "%a %b %d %X %Z %Y")
log_format = os.getenv("LOG_FORMAT", "{} - {} Mbps")
output_file = os.getenv("OUTPUT_FILE", "/speed-log.txt")
listen_port = os.getenv("LISTEN_PORT", 8080)


class LogHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        with open(output_file) as out:
            self.wfile.write(bytes(out.read(), "utf8"))

    def log_message(self, format, *args):
        return


def run_webserver(port):
    server_address = ('', port)
    httpd = HTTPServer(server_address, LogHandler)
    httpd.serve_forever()


if __name__ == '__main__':
    open(output_file, "a+").close()

    pool = ThreadPool(1)
    results = pool.map_async(run_webserver, [listen_port])
    pool.close()

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

    pool.join()


