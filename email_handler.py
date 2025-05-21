from flask import flash
from flask_mail import Mail, Message
import os
from dotenv import load_dotenv

load_dotenv()

mail = Mail()

def init_mail_app(app):
    """Initialize the mail app with Flask application"""
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT'))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True').lower() in ['true', 'yes', '1']
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')
    app.config['MAIL_RECIPIENT'] = os.environ.get('MAIL_RECIPIENT')
    
    # Debug mail configuration
    print("Mail Configuration:")
    print(f"MAIL_SERVER: {app.config['MAIL_SERVER']}")
    print(f"MAIL_PORT: {app.config['MAIL_PORT']}")
    print(f"MAIL_USE_TLS: {app.config['MAIL_USE_TLS']}")
    print(f"MAIL_USERNAME: {app.config['MAIL_USERNAME']}")
    print(f"MAIL_DEFAULT_SENDER: {app.config['MAIL_DEFAULT_SENDER']}")
    print(f"MAIL_RECIPIENT: {app.config['MAIL_RECIPIENT']}")
    
    mail.init_app(app)
    return mail

def validate_contact_form(name, email, subject, message):
    """Validate contact form fields"""
    errors = []
    if not name or len(name.strip()) < 2:
        errors.append("Name is required and must be at least 2 characters")
    
    if not email or '@' not in email:
        errors.append("A valid email address is required")
    
    if not message or len(message.strip()) < 10:
        errors.append("Message is required and must be at least 10 characters")
    
    return errors

def send_contact_email(name, email, subject, message):
    """Send contact form details to company email"""
    if not subject:
        subject = f"Contact Form Submission from {name}"
    
    recipient = os.environ.get('MAIL_RECIPIENT', 'info@infranaut.ai')
    
    msg = Message(
        subject=f"Infranaut Contact: {subject}",
        recipients=[recipient]
    )
    
    msg.body = f"""
    Contact Form Submission:
    
    Name: {name}
    Email: {email}
    Subject: {subject}
    
    Message:
    {message}
    """
    
    # HTML version of email
    msg.html = f"""
    <h2>Contact Form Submission</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Subject:</strong> {subject}</p>
    <h3>Message:</h3>
    <p>{message}</p>
    """
    
    try:
        mail.send(msg)
        return True, "Your message has been sent. Thank you!"
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        print(f"Mail configuration during error:")
        print(f"MAIL_SERVER: {mail.state.server}")
        print(f"MAIL_PORT: {mail.state.port}")
        print(f"MAIL_USE_TLS: {mail.state.use_tls}")
        print(f"MAIL_USERNAME: {mail.state.username}")
        return False, "There was an error sending your message. Please try again later." 