# Supabase Authentication Setup Guide

This guide explains how to set up and configure the Supabase authentication system for both regular email/password login and Google OAuth integration.

## Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5001/callback/google

# Application Settings
FLASK_SECRET_KEY=generate-a-secure-random-key
FLASK_ENV=development
DEBUG=True
PORT=5001

# Email Configuration
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_DEFAULT_SENDER=your-email@example.com
```

## Supabase Configuration Steps

1. **Create a Supabase Project**:
   - Sign up at https://supabase.com/ and create a new project
   - Note down your project URL and API keys (both anon key and service role key)

2. **Configure Row-Level Security (RLS)**:
   - Go to your Supabase dashboard's SQL Editor
   - Run the SQL scripts from `supabase_rls_setup.sql` to set up proper security policies

3. **Set Up Google OAuth in Supabase**:
   - In your Supabase dashboard, go to Authentication → Providers
   - Enable Google provider
   - Configure your Google OAuth credentials:
     - Client ID: From Google Cloud Console
     - Secret: From Google Cloud Console
     - Authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`

4. **Set Up Google OAuth in Google Cloud Console**:
   - Go to https://console.cloud.google.com/
   - Create a new project or use an existing one
   - Go to APIs & Services → Credentials
   - Create OAuth Client ID credentials
   - Add these authorized redirect URIs:
     - `http://localhost:5001/callback/google` (for local development)
     - `https://your-production-domain.com/callback/google` (for production)
     - `https://your-project-id.supabase.co/auth/v1/callback` (for Supabase)

## Fixing the Row-Level Security (RLS) Error

The error `new row violates row-level security policy for table "users"` occurs because the default Supabase RLS policies are too restrictive. Follow these steps to resolve it:

1. **Ensure Service Role Key is Being Used**:
   - Make sure the `SUPABASE_SERVICE_KEY` is properly set in your environment
   - This key has admin privileges and can bypass RLS policies

2. **Run the RLS Policy Setup Script**:
   - Execute the SQL in `supabase_rls_setup.sql` in your Supabase SQL Editor
   - This script creates proper policies for both service roles and authenticated users

3. **Update Your Database Schema**:
   - Ensure the `users` table has the necessary columns, especially `auth_id` and `provider`
   - These columns link your application users to Supabase Auth users

## Testing Authentication

1. **Email/Password Signup**:
   - Visit `/signup` endpoint
   - Complete the form with email, username, and password
   - Verify your email with the sent code
   - Attempt to log in with your credentials

2. **Google OAuth Login**:
   - Visit `/login` and click "Sign in with Google"
   - Authorize the application
   - You should be redirected back and automatically logged in

## Troubleshooting

If you still encounter RLS errors:

1. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE "public"."users" DISABLE ROW LEVEL SECURITY;
   ```

2. Check Supabase logs for detailed error messages:
   - Go to Database → Logs in your Supabase dashboard

3. Verify your queries are using the service role key when needed:
   ```python
   admin_client = create_client(supabase_url, admin_supabase_key)
   response = admin_client.table("users").insert(user_data).execute()
   ```

4. Check the correct JWT is being used for authenticated requests. 