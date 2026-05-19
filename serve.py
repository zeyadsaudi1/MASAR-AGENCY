"""
MASAR - Simple server with security API
"""
import http.server
import json
import os
import sys
from datetime import datetime

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 3000
REPORTS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'security-reports.json')

# Load existing reports
reports = []
if os.path.exists(REPORTS_FILE):
    try:
        with open(REPORTS_FILE, 'r', encoding='utf-8') as f:
            reports = json.load(f)
    except:
        reports = []


class MasarHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/security/report':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
            except:
                data = {}

            report = {**data, 'serverTimestamp': datetime.now().isoformat(), 'ip': self.client_address[0]}
            reports.append(report)

            try:
                with open(REPORTS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(reports, f, ensure_ascii=False, indent=2)
            except Exception as e:
                print(f'[ERROR] Save report failed: {e}')

            reason = data.get('reason', 'unknown')
            user = data.get('userId', 'unknown')
            print(f'[SECURITY] {reason} - User: {user}')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path == '/api/security/reports':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(reports, ensure_ascii=False).encode())
        elif self.path == '/':
            self.path = '/index.html'
            super().do_GET()
        else:
            super().do_GET()

    def log_message(self, format, *args):
        if '/favicon' not in str(args):
            print(f'>> {args[0]}')


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with http.server.HTTPServer(('', PORT), MasarHandler) as server:
        print(f'Server running: http://localhost:{PORT}')
        print(f'Watch page: http://localhost:{PORT}/watch.html')
        print('-' * 50)
        server.serve_forever()
