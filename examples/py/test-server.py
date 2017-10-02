#!/usr/bin/env python

# Python HTTPServer server for response code testing (localhost:8080 by default)

try:

    # Python 3
    from http.server import HTTPServer, SimpleHTTPRequestHandler, test as test_orig
    import sys

    def test(*args):
        test_orig(*args, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8080)

except ImportError:  # Python 2
    from BaseHTTPServer import HTTPServer, test
    from SimpleHTTPServer import SimpleHTTPRequestHandler


class TestRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # self.send_error(100, 'Continue')
        # self.send_error(101, 'Switching Protocols')
        # self.send_error(200, 'OK')
        # self.send_error(201, 'Created')
        # self.send_error(202, 'Accepted')
        # self.send_error(203, 'Non-Authoritative Information')
        # self.send_error(204, 'No Content')
        # self.send_error(205, 'Reset Content')
        # self.send_error(206, 'Partial Content')
        # self.send_error(300, 'Multiple Choices')
        # self.send_error(301, 'Moved Permanently')
        # self.send_error(302, 'Found')
        # self.send_error(303, 'See Other')
        # self.send_error(304, 'Not Modified')
        # self.send_error(305, 'Use Proxy')
        # self.send_error(307, 'Temporary Redirect')
        # self.send_error(400, 'Bad Request')
        # self.send_error(401, 'Unauthorized')
        # self.send_error(402, 'Payment Required')
        # self.send_error(403, 'Forbidden')
        self.send_error(404, 'Not Found')
        # self.send_error(405, 'Method Not Allowed')
        # self.send_error(406, 'Not Acceptable')
        # self.send_error(407, 'Proxy Authentication Required')
        # self.send_error(408, 'Request Timeout')
        # self.send_error(409, 'Conflict')
        # self.send_error(410, 'Gone')
        # self.send_error(411, 'Length Required')
        # self.send_error(412, 'Precondition Failed')
        # self.send_error(413, 'Request Entity Too Large')
        # self.send_error(414, 'Request-URI Too Long')
        # self.send_error(415, 'Unsupported Media Type')
        # self.send_error(416, 'Requested Range Not Satisfiable')
        # self.send_error(417, 'Expectation Failed')
        # self.send_error(500, 'Internal Server Error')
        # self.send_error(501, 'Not Implemented')
        # self.send_error(502, 'Bad Gateway')
        # self.send_error(503, 'Service Unavailable')
        # self.send_error(504, 'Gateway Timeout')
        # self.send_error(505, 'HTTP Version Not Supported')


if __name__ == '__main__':
    test(TestRequestHandler, HTTPServer)
