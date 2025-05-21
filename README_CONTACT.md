# Infranaut.ai Contact Form Setup

This document explains how to set up and configure the contact form email functionality for the Infranaut.ai website.

## Overview

The contact form on the `/contact` page sends emails to your company email address when visitors submit the form. The implementation uses Flask-Mail to handle the email sending functionality.

## Requirements

- Python 3.6+
- Flask
- Flask-Mail
- Flask-Compress

All dependencies are listed in `requirements.txt` and can be installed with `pip install -r requirements.txt`.

## Configuration

### Environment Variables

The email functionality is configured using environment variables. You should set these up in your production environment:

- `MAIL_SERVER`: SMTP server address (default: 'smtp.gmail.com')
- `MAIL_PORT`: SMTP server port (default: 587)
- `MAIL_USE_TLS`: Whether to use TLS (default: True)
- `MAIL_USERNAME`: Your SMTP username/email
- `MAIL_PASSWORD`: Your SMTP password or app password
- `MAIL_DEFAULT_SENDER`: Default email sender (default: 'info@infranaut.ai')
- `MAIL_RECIPIENT`: Email address where form submissions are sent (default: 'info@infranaut.ai')
- `SECRET_KEY`: Secret key for Flask session security (default: a development key that should be changed)

### Gmail Setup

If you're using Gmail as your SMTP provider:

1. You'll need to create an "App Password" in your Google account:
   - Go to your Google Account settings
   - Select "Security"
   - Under "Signing in to Google," select "App passwords"
   - Generate a new app password for "Mail" and your application
   - Use this password in your `MAIL_PASSWORD` environment variable

2. Example Gmail configuration:
   ```
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=your.email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_DEFAULT_SENDER=your.email@gmail.com
   MAIL_RECIPIENT=your.email@gmail.com
   SECRET_KEY=your-secure-random-key
   ```

## Local Testing

For testing locally, you can set environment variables before running the application:

```bash
export MAIL_USERNAME=your.email@gmail.com
export MAIL_PASSWORD=your-app-password
export MAIL_RECIPIENT=your.email@gmail.com
export SECRET_KEY=development-secret-key
python app.py
```

## Troubleshooting

- If emails aren't being sent, check your SMTP settings and credentials
- Verify that your mail server allows sending from your application
- Check the application logs for specific error messages
- For Gmail, ensure you're using an App Password if you have 2FA enabled

## Security Considerations

- Always use environment variables for sensitive information (never hardcode credentials)
- Use a strong, random SECRET_KEY in production
- Consider using a dedicated email sending service like SendGrid or Mailgun for production 