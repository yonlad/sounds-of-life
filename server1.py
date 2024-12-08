# server.py
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import cgi
import json
import socket

# Create a directory to store the text files
if not os.path.exists('yellow-texts'):
    os.makedirs('yellow-texts')


class AudioUploadHandler(SimpleHTTPRequestHandler):
    def handle_pipe_error(self, error):
        """Handle broken pipe errors gracefully"""
        try:
            self.send_response(500)
            self.send_cors_headers()
            self.end_headers()
        except:
            # If we can't even send headers, just pass
            pass
        return

    def send_cors_headers(self):
        """Helper method to send CORS headers and cache control"""
        try:
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Cache-Control')
            self.send_header('Access-Control-Max-Age', '3600')
            # Add these cache control headers
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        except:
            pass

    def send_response_only(self, code, message=None):
        super().send_response_only(code, message)
        if code == 200:
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')

    def do_GET(self):
        try:
            if self.path == '/script.js':
                self.send_response(200)
                self.send_header('Content-Type', 'application/javascript')
                # Add these no-cache headers
                self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                self.send_header('Pragma', 'no-cache')
                self.send_header('Expires', '0')
                self.send_cors_headers()
                self.end_headers()
                
                with open('script.js', 'rb') as f:
                    self.wfile.write(f.read())
                return
            
            # Add yellow-text handling
            if self.path.startswith('/yellow-text/'):
                try:
                    number = self.path.split('/')[-1]
                    file_path = os.path.join('yellow-texts', f'{number}.txt')
                    
                    if os.path.exists(file_path):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            text = f.read()
                    else:
                        text = ''
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_cors_headers()
                    self.end_headers()
                    
                    response = json.dumps({
                        'text': text
                    })
                    self.wfile.write(response.encode('utf-8'))
                    return
                    
                except Exception as e:
                    print(f"Error handling yellow text GET: {str(e)}")
                    self.send_error(500, str(e))
                    return
                
            if self.path.startswith('/new-sounds/'):
                file_path = os.path.join(os.getcwd(), self.path[1:])
                if os.path.exists(file_path):
                    try:
                        with open(file_path, 'rb') as f:
                            content = f.read()
                            
                        self.send_response(200)
                        self.send_header('Content-Type', 'audio/mp4')
                        self.send_header('Content-Length', str(len(content)))
                        self.send_cors_headers()
                        self.end_headers()
                        
                        try:
                            self.wfile.write(content)
                        except (BrokenPipeError, ConnectionResetError) as e:
                            # Client disconnected, just return
                            return
                            
                    except Exception as e:
                        print(f"Error reading file: {str(e)}")
                        self.send_error(500, f"Internal error: {str(e)}")
                    return
                else:
                    self.send_error(404, 'File not found')
                    return
                
            if self.path.startswith('/sounds/'):
                file_path = os.path.join(os.getcwd(), self.path[1:])
                if os.path.exists(file_path):
                    try:
                        # Get file size
                        file_size = os.path.getsize(file_path)
                        
                        self.send_response(200)
                        self.send_header('Content-Type', 'audio/mp4')
                        self.send_header('Content-Length', str(file_size))
                        self.send_header('Accept-Ranges', 'bytes')
                        self.send_header('Cache-Control', 'no-cache')
                        self.send_cors_headers()
                        self.end_headers()
                        
                        # Send file in chunks
                        with open(file_path, 'rb') as f:
                            self.wfile.write(f.read())
                            
                    except Exception as e:
                        print(f"Error reading audio file: {str(e)}")
                        self.send_error(500, f"Internal error: {str(e)}")
                    return
                else:
                    self.send_error(404, 'Audio file not found')
                    return
            
            return SimpleHTTPRequestHandler.do_GET(self)
            
        except (BrokenPipeError, ConnectionResetError) as e:
            # Handle broken pipe errors
            self.handle_pipe_error(e)
            return
        except Exception as e:
            print(f"Error in GET request: {str(e)}")
            try:
                self.send_error(500, str(e))
            except:
                pass
            return
        

    def do_HEAD(self):
        try:
            if self.path.startswith('/new-sounds/'):
                file_path = os.path.join(os.getcwd(), self.path[1:])
                if os.path.exists(file_path):
                    self.send_response(200)
                    self.send_header('Content-Type', 'audio/mp4')
                    self.send_cors_headers()
                    self.end_headers()
                else:
                    self.send_response(404)
                    self.send_cors_headers()
                    self.end_headers()
            else:
                self.send_response(404)
                self.send_cors_headers()
                self.end_headers()
                
        except (BrokenPipeError, ConnectionResetError) as e:
            self.handle_pipe_error(e)
        except Exception as e:
            print(f"Error in HEAD request: {str(e)}")
            try:
                self.send_error(500, str(e))
            except:
                pass

    def do_OPTIONS(self):
        try:
            self.send_response(200)
            self.send_cors_headers()
            self.end_headers()
        except (BrokenPipeError, ConnectionResetError) as e:
            self.handle_pipe_error(e)
        except Exception as e:
            print(f"Error in OPTIONS request: {str(e)}")
    
    def do_POST(self):
        if self.path == '/save-yellow-text':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                number = data['number']
                text = data['text']
                
                if not os.path.exists('yellow-texts'):
                    os.makedirs('yellow-texts')
                
                file_path = os.path.join('yellow-texts', f'{number}.txt')
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(text)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                
                response = json.dumps({
                    'status': 'success',
                    'message': 'Text saved successfully'
                })
                self.wfile.write(response.encode('utf-8'))
                return
                
            except Exception as e:
                print(f"Error saving yellow text: {str(e)}")
                try:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_cors_headers()
                    self.end_headers()
                    error_response = json.dumps({
                        'status': 'error',
                        'message': str(e)
                    })
                    self.wfile.write(error_response.encode('utf-8'))
                except:
                    pass
                return

        elif self.path == '/save-audio':
            try:
                content_length = int(self.headers['Content-Length'])
                
                form = cgi.FieldStorage(
                    fp=self.rfile,
                    headers=self.headers,
                    environ={
                        'REQUEST_METHOD': 'POST',
                        'CONTENT_TYPE': self.headers['Content-Type'],
                        'CONTENT_LENGTH': content_length
                    }
                )

                file_item = form['audio']
                filename = file_item.filename
                
                if not os.path.exists('new-sounds'):
                    os.makedirs('new-sounds')
                
                filepath = os.path.join('new-sounds', filename)
                
                with open(filepath, 'wb') as f:
                    f.write(file_item.file.read())

                print(f"File saved successfully: {filepath}")

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                
                response = json.dumps({
                    'status': 'success',
                    'message': 'File uploaded successfully',
                    'filepath': filepath
                })
                self.wfile.write(response.encode('utf-8'))
                
            except (BrokenPipeError, ConnectionResetError) as e:
                self.handle_pipe_error(e)
            except Exception as e:
                print(f"Error in POST request: {str(e)}")
                try:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_cors_headers()
                    self.end_headers()
                    error_response = json.dumps({
                        'status': 'error',
                        'message': str(e)
                    })
                    self.wfile.write(error_response.encode('utf-8'))
                except:
                    pass

def run_server():
    server_address = ('', 8001)
    httpd = HTTPServer(server_address, AudioUploadHandler)
    print('Server running on port 8001...')
    print('New sounds will be saved to:', os.path.abspath('new-sounds'))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        httpd.server_close()

if __name__ == '__main__':
    run_server()