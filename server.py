#!/usr/bin/env python3
"""
Custom HTTP server with Clean URL support.
Maps /page-slug -> /page-slug.html automatically.
Run this instead of 'python -m http.server 8080'
"""

import http.server
import os
import sys
import urllib.parse

ROOT_DIR = r"d:\Code Web - Copy\ford_namdinh_clone"
PORT = 8080

# URL redirect map: old slug -> new slug (HTTP 302)
REDIRECTS = {
    '/ford-everest-nam-dinh': '/ford-everest-my-dinh',
    '/ford-ranger-nam-dinh': '/ford-ranger-my-dinh',
    '/ford-territory-nam-dinh': '/ford-territory-my-dinh',
    '/ford-transit-nam-dinh': '/ford-transit-my-dinh',
    '/ranger-raptor-nam-dinh': '/ranger-raptor-my-dinh',
    '/khuyenmai': '/gia-xe',
    '/gui-bao-gia-thanh-cong': '/',
}

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def do_GET(self):
        # Parse URL path (without query string)
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        # 1. Check if path needs redirect (old slugs)
        if path in REDIRECTS:
            new_path = REDIRECTS[path]
            if parsed.query:
                new_path += '?' + parsed.query
            self.send_response(302)
            self.send_header('Location', new_path)
            self.end_headers()
            return
        
        # 2. Check if path exactly maps to a file
        full_path = os.path.join(ROOT_DIR, path.lstrip('/'))
        if os.path.isfile(full_path):
            return super().do_GET()
        
        # 3. Try Clean URL: /page-slug -> /page-slug.html
        html_path = full_path + '.html'
        if os.path.isfile(html_path):
            # Rewrite path to serve the .html file
            self.path = path + '.html'
            if parsed.query:
                self.path += '?' + parsed.query
            return super().do_GET()
        
        # 4. Serve index.html for root
        if path == '/' or path == '':
            self.path = '/index.html'
            return super().do_GET()
        
        # 5. Check if it's a directory -> serve index.html in that directory
        if os.path.isdir(full_path):
            self.path = path.rstrip('/') + '/index.html'
            return super().do_GET()
        
        # 6. Fallback: let the parent handle it (will 404)
        return super().do_GET()

    def log_message(self, format, *args):
        # Print to stdout
        sys.stderr.write("[%s] %s\n" % (self.address_string(), format % args))

if __name__ == '__main__':
    os.chdir(ROOT_DIR)
    with http.server.HTTPServer(('', PORT), CleanURLHandler) as httpd:
        print(f"Serving Ford My Dinh website at http://localhost:{PORT}")
        print(f"Root: {ROOT_DIR}")
        print("Press Ctrl+C to stop.")
        httpd.serve_forever()
