from logging import root
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/placeholder')
def placeholder():
    return render_template('pages/placeholder.html')
    
@app.route('/infrastructure')
def infrastructure():
    return render_template('pages/infrastructure.html')

@app.route('/code')
def code():
    return render_template('pages/code.html')

@app.route('/devops')
def devops():
    return render_template('pages/devops.html')

@app.route('/workflow')
def workflow():
    return render_template('pages/workflow.html')
    
@app.route('/cloud-migration')
def cloud_migration():
    return render_template('pages/cloud_migration.html')

@app.route('/onboarding')
def onboarding():
    return render_template('pages/onboarding.html')

@app.route('/cloud-management')
def cloud_management():
    return render_template('pages/cloud_management.html')


@app.route('/add-on')
def add_on():
    return render_template('pages/add-on.html')

@app.route('/about-us')
def about_us():
    return render_template('pages/about-us.html')
    
@app.route('/careers')
def careers():
    return render_template('pages/careers.html')

@app.route('/contact')
def contact():
    return render_template('pages/contact.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)