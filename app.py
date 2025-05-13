from flask import Flask, render_template, send_from_directory, make_response
from flask_compress import Compress
from functools import wraps
import os

app = Flask(__name__)
Compress(app)

# Enable template caching
app.config['TEMPLATES_AUTO_RELOAD'] = False
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000  # 1 year in seconds

# Cache control decorator
def cache_control(max_age=31536000):
    def decorator(view_function):
        @wraps(view_function)
        def wrapped_function(*args, **kwargs):
            result = view_function(*args, **kwargs)
            response = make_response(result)
            response.headers['Cache-Control'] = f'public, max-age={max_age}'
            return response
        return wrapped_function
    return decorator

# Static files handler with caching
@app.route('/static/<path:filename>')
@cache_control()
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/')
@cache_control()
def index():
    return render_template('index.html')

@app.route('/infrastructure')
@cache_control()
def infrastructure():
    return render_template('pages/infrastructure.html')

@app.route('/devops')
@cache_control()
def devops():
    return render_template('pages/devops.html')

@app.route('/cloud-migration')
@cache_control()
def cloud_migration():
    return render_template('pages/cloud_migration.html')

@app.route('/cloud-management')
@cache_control()
def cloud_management():
    return render_template('pages/cloud_management.html')

@app.route('/code')
@cache_control()
def code():
    return render_template('pages/code.html')

@app.route('/onboarding')
@cache_control()
def onboarding():
    return render_template('pages/onboarding.html')

@app.route('/about-us')
@cache_control()
def about():
    return render_template('pages/about-us.html')

@app.route('/careers')
@cache_control()
def careers():
    return render_template('pages/careers.html')

@app.route('/contact')
@cache_control()
def contact():
    return render_template('pages/contact.html')

@app.route('/workflow')
@cache_control()
def workflow():
    return render_template('pages/workflow.html')

@app.route('/addon')
@cache_control()
def addon():
    return render_template('pages/add-on.html')

if __name__ == '__main__':
    # Production configurations
    app.config['TEMPLATES_AUTO_RELOAD'] = True # Make false in production
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 # Disable caching in production
    #app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000
    app.run(debug=False, host='0.0.0.0', port=5001)
