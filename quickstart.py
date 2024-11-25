import os
import subprocess


os.chdir('server')
subprocess.Popen(['start', 'cmd', '/K', 'uvicorn app:app --port 5000'], shell=True)

os.chdir('../client')
subprocess.Popen(['start', 'cmd', '/K', 'npm start'], shell=True)
