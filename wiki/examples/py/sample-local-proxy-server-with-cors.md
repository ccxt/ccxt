- [Sample Local Proxy Server With Cors](./examples/py/)


 ```python
 '''
Sampled from:
    https://gist.github.com/mkows/cd2122f427ea722bf41aa169ef762001

Usage:
    python server-cors
'''
import http.server as httpserver

class CORSHTTPRequestHandler(httpserver.SimpleHTTPRequestHandler):
    def send_head(self):
        """Common code for GET and HEAD commands.
        This sends the response code and MIME headers.
        Return value is either a file object (which has to be copied
        to the outputfile by the caller unless the command was HEAD,
        and must be closed by the caller under all circumstances), or
        None, in which case the caller has nothing further to do.
        """
        path = self.translate_path(self.path)
        f = None
        if os.path.isdir(path):
            if not self.path.endswith('/'):
                # redirect browser - doing basically what apache does
                self.send_response(301)
                self.send_header("Location", self.path + "/")
                self.end_headers()
                return None
            for index in "index.html", "index.htm":
                index = os.path.join(path, index)
                if os.path.exists(index):
                    path = index
                    break
            else:
                return self.list_directory(path)
        ctype = self.guess_type(path)
        try:
            # Always read in binary mode. Opening files in text mode may cause
            # newline translations, making the actual size of the content
            # transmitted *less* than the content-length!
            f = open(path, 'rb')
        except IOError:
            self.send_error(404, "File not found")
            return None
        self.send_response(200)
        self.send_header("Content-type", ctype)
        fs = os.fstat(f.fileno())
        self.send_header("Content-Length", str(fs[6]))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        return f


if __name__ == "__main__":
    import os
    import socketserver
    
    import sys
    PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

    handler = CORSHTTPRequestHandler

    httpd = socketserver.TCPServer(("", PORT), handler)

    print(f"serving at port {PORT}")
    httpd.serve_forever() 
```