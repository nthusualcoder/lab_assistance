import http.server
import socketserver
import socket
import webbrowser
import os

PORT = 8000

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Dummy connection to determine the preferred local IP
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable caching during development to make testing easier
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    local_ip = get_local_ip()
    pc_url = f"http://localhost:{PORT}"
    mobile_url = f"http://{local_ip}:{PORT}"
    
    print("=" * 60)
    print("        실험 보조 계산기 모바일 웹 앱 로컬 서버")
    print("=" * 60)
    print(f"\n1. PC에서 테스트하기:")
    print(f"   -> URL: {pc_url}")
    print(f"   * Chrome/Edge 등 브라우저에서 F12를 누른 뒤")
    print(f"     '디바이스 에뮬레이터' 아이콘을 클릭하여 모바일(갤럭시) 화면으로 테스트하세요.\n")
    print(f"2. 실제 갤럭시 안드로이드 폰에서 테스트하기:")
    print(f"   -> URL: {mobile_url}")
    print(f"   * 조건: PC와 스마트폰이 같은 와이파이(Wi-Fi)에 연결되어 있어야 합니다.")
    print(f"   * 폰 브라우저(크롬, 삼성인터넷)에서 위 주소로 접속하면 로컬 구동 가능!")
    print(f"   * 주소창 옆 메뉴에서 '홈 화면에 추가'를 누르면 진짜 앱처럼 설치됩니다.\n")
    print("=" * 60)
    print(" 서버가 가동 중입니다... (종료하려면 Ctrl+C 입력)")
    print("=" * 60)

    # Change directory to the script's directory to serve files correctly
    script_dir = os.path.dirname(os.path.realpath(__file__))
    os.chdir(script_dir)

    # Automatically open local browser for PC testing
    try:
        webbrowser.open(pc_url)
    except Exception:
        pass

    # Start the server
    handler = MyHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[알림] 서버를 종료합니다.")

if __name__ == "__main__":
    run_server()
