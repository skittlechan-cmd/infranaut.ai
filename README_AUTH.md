# Authentication System for Infranaut.ai

This document provides instructions for setting up and using the authentication system with Google OAuth, email verification, and account recovery.

## Features

- User registration with email verification
- Login with username and password
- Google OAuth integration
- Password recovery system
- Dashboard with user profile
- API key management

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Flask Secret Key
SECRET_KEY=your-secret-key-here

# Supabase Configuration
SUPABASE_URL=https://your-supabase-project-url.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5001/callback/google

# Mail Server Configuration (for verification emails)
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_USE_TLS=True
MAIL_DEFAULT_SENDER=your-email@example.com
```

### 2. Supabase Setup

1. Sign up for a free Supabase account at https://supabase.com
2. Create a new project
3. Navigate to the SQL Editor in your Supabase dashboard
4. Run the SQL commands from `database_schema.sql` to create the necessary tables

### 3. Google OAuth Setup

1. Go to the Google Cloud Console: https://console.cloud.google.com/
2. Create a new project
3. Navigate to APIs & Services > Credentials
4. Create an OAuth 2.0 Client ID
5. Set up the authorized redirect URI as `http://localhost:5001/callback/google` (or your custom domain)
6. Copy the Client ID and Client Secret to your `.env` file

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the Application

```bash
python app.py
```

## Database Schema

The authentication system uses the following database tables:

1. **users** - Stores user account information
2. **api_keys** - Stores API keys for authenticated users
3. **api_usage** - Tracks API usage for analytics and rate limiting

## Security Notes

- Passwords should be properly hashed in production
- Add proper rate limiting for login attempts
- Use HTTPS in production
- Consider adding two-factor authentication for enhanced security
- Revoke the Supabase key if compromised

## Files Overview

- **auth.py** - Authentication module with Google OAuth and account management functions
- **app.py** - Main Flask application with authentication routes
- **templates/pages/login.html** - Login page template
- **templates/pages/signup.html** - Signup page template
- **templates/pages/dashboard.html** - User dashboard page
- **static/css/auth.css** - CSS styles for authentication pages
- **static/css/dashboard.css** - CSS styles for the dashboard 