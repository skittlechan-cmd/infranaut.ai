#!/usr/bin/env python3
"""
Email Configuration Checker for Infranaut.ai

This script checks if the email settings are properly configured
and sends a test email to verify functionality.
"""

import os
import sys
from dotenv import load_dotenv
from flask import Flask
from flask_mail import Mail, Message
from email_handler import init_mail_app

# Load environment variables
load_dotenv()

def check_email_config():
    """Check if all required email configuration variables are set"""
    required_vars = [
        'MAIL_SERVER',
        'MAIL_PORT',
        'MAIL_USERNAME',
        'MAIL_PASSWORD',
        'MAIL_DEFAULT_SENDER',
    ]
    
    missing = []
    for var in required_vars:
        if not os.environ.get(var):
            missing.append(var)
    
    if missing:
        print("⚠️  The following email configuration variables are missing:")
        for var in missing:
            print(f"   - {var}")
        return False
    
    print("✅ All required email configuration variables are set")
    
    # Print current config (with partial redaction for security)
    print("\nCurrent email configuration:")
    print(f"MAIL_SERVER: {os.environ.get('MAIL_SERVER')}")
    print(f"MAIL_PORT: {os.environ.get('MAIL_PORT')}")
    print(f"MAIL_USE_TLS: {os.environ.get('MAIL_USE_TLS', 'True')}")
    
    username = os.environ.get('MAIL_USERNAME', '')
    if username:
        # Redact middle part for security
        if len(username) > 6:
            username = f"{username[:3]}...{username[-3:]}"
    print(f"MAIL_USERNAME: {username}")
    
    password = os.environ.get('MAIL_PASSWORD', '')
    if password:
        # Show only length of password
        password = '*' * len(password)
    print(f"MAIL_PASSWORD: {password}")
    
    sender = os.environ.get('MAIL_DEFAULT_SENDER', '')
    print(f"MAIL_DEFAULT_SENDER: {sender}")
    
    return True

def send_test_email(recipient):
    """Send a test email to verify configuration"""
    # Create a minimal Flask app to initialize mail
    app = Flask(__name__)
    mail = init_mail_app(app)
    
    with app.app_context():
        try:
            msg = Message(
                subject="Infranaut Email Test",
                recipients=[recipient],
                body="This is a test email to verify the email configuration is working correctly.",
                sender=os.environ.get('MAIL_DEFAULT_SENDER')
            )
            mail.send(msg)
            print(f"✅ Test email sent successfully to {recipient}")
            return True
        except Exception as e:
            print(f"❌ Error sending test email: {str(e)}")
            return False

def main():
    """Main function"""
    print("Checking email configuration...\n")
    
    if not check_email_config():
        print("\n❌ Email configuration is incomplete.")
        print("Please set the missing environment variables in your .env file.")
        return
    
    send_test = input("\nWould you like to send a test email? (y/n): ").lower()
    if send_test == 'y':
        recipient = input("Enter recipient email address: ")
        if '@' not in recipient:
            print("Invalid email address")
            return
        
        send_test_email(recipient)

if __name__ == "__main__":
    main() 