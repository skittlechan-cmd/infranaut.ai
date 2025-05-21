import os
import secrets
import string
from datetime import datetime, timedelta
import json
from flask import request, redirect, url_for, session, flash
from flask_mail import Message
from dotenv import load_dotenv
from supabase import create_client, Client
from email_handler import mail
import bcrypt
import requests
import re

# Load environment variables
load_dotenv()

# Initialize Supabase client with service role key
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")  # Use service role key for admin operations
supabase: Client = create_client(supabase_url, supabase_key)

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://infranaut-ai.onrender.com/callback/google")

# Security Settings
MAX_LOGIN_ATTEMPTS = 5
LOGIN_COOLDOWN_MINUTES = 15
PASSWORD_MIN_LENGTH = 8

# Verification codes dictionary (In production, use a more persistent storage like Redis)
verification_codes = {}
# Login attempts tracking (In production, use a more persistent storage like Redis)
login_attempts = {}

def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def send_verification_email(email, code, is_recovery=False):
    """Send verification email with code"""
    try:
        # Print debug info
        print("\n=== Email Debug Info ===")
        print(f"Operation: {'Password Recovery' if is_recovery else 'Email Verification'}")
        print(f"Recipient: {email}")
        print(f"Verification Code: {code}")
        print(f"Using SMTP: {os.environ.get('MAIL_SERVER')}:{os.environ.get('MAIL_PORT')}")
        print(f"From: {os.environ.get('MAIL_DEFAULT_SENDER')}")

        subject = "Account Recovery Code" if is_recovery else "Email Verification Code"
        body = f"""
        Your {'recovery' if is_recovery else 'verification'} code for Infranaut is: {code}

        This code will expire in 10 minutes.

        If you didn't request this code, you can safely ignore this email.
        """

        msg = Message(
            subject=subject,
            recipients=[email],
            body=body
        )

        # Actually send the email
        mail.send(msg)

        print(f"Email sent successfully to {email}")
        return True
    except Exception as e:
        print(f"ERROR sending email to {email}: {str(e)}")
        # Check if mail is properly configured
        if not mail:
            print("ERROR: Flask-Mail is not properly initialized!")
        return False

def store_verification_code(email, code, expires_in_minutes=10):
    """Store verification code with expiration time"""
    expiration = datetime.now() + timedelta(minutes=expires_in_minutes)
    verification_codes[email] = {
        "code": code,
        "expires_at": expiration
    }

def verify_code(email, code):
    """Verify if the code is valid and not expired"""
    print(f"Verifying code for email: {email}")
    print(f"Code submitted: {code}")
    print(f"Current active verification codes: {list(verification_codes.keys())}")

    if not email or not code:
        print(f"Missing email or code: email={email}, code={code}")
        return False

    if email not in verification_codes:
        print(f"No verification code found for email: {email}")
        return False

    stored_data = verification_codes[email]
    stored_code = stored_data.get("code")
    expires_at = stored_data.get("expires_at")

    print(f"Stored code: {stored_code}")
    print(f"Expires at: {expires_at}")
    print(f"Current time: {datetime.now()}")

    # Check expiration
    if datetime.now() > expires_at:
        print(f"Code expired for {email}")
        # Code expired, remove it
        del verification_codes[email]
        return False

    # Verify code - make this case-insensitive and no spaces
    submitted_code = code.strip()
    stored_code = stored_code.strip()

    # For recovery codes, do a more lenient check
    if submitted_code == stored_code:
        print(f"Code verified successfully for {email}")
        # Code is valid, remove it to prevent reuse
        del verification_codes[email]
        return True

    print(f"Code verification failed for {email}")
    return False

def validate_password(password):
    """
    Validate password strength
    Returns (is_valid, message)
    """
    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters long"

    # Check for at least one uppercase, one lowercase, one digit, and one special character
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"

    return True, "Password is valid"

def hash_password(password):
    """Hash a password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')  # Store as string

def verify_password(password, hashed_password):
    """Verify a password against its hash"""
    password_bytes = password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def check_email_exists(email):
    """Check if an email already exists in the database"""
    try:
        print("\n=== Supabase Query Debug ===")
        print(f"Operation: Check Email Existence")
        print(f"Email: {email}")
        print(f"Supabase URL: {supabase_url}")
        print(f"Using key type: {'service_role' if 'service_role' in supabase_key else 'anon'}")

        # Debug query construction
        query = supabase.table("users").select("id, email").eq("email", email)
        print(f"SQL Equivalent: SELECT id, email FROM users WHERE email = '{email}'")

        # Execute and debug response
        response = query.execute()
        print("\n=== Query Response ===")
        print(f"Data received: {json.dumps(response.data, indent=2)}")
        print(f"Number of records: {len(response.data)}")
        print(f"Success: {bool(response)}")

        exists = len(response.data) > 0
        print(f"Email exists: {exists}")
        return exists
    except Exception as e:
        print(f"Error checking email existence: {e}")
        print(f"Full error details: {repr(e)}")
        print(f"Error type: {type(e).__name__}")
        return False

def check_username_exists(username):
    """Check if a username already exists in the database"""
    try:
        response = supabase.table("users").select("id").eq("username", username).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Error checking username existence: {e}")
        return False

def create_user(email, username, password):
    """Create a new user in Supabase with hashed password"""
    try:
        # Use service role key for admin operations
        admin_supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

        # Debug: Print key information (with partial redaction for security)
        if admin_supabase_key:
            print(f"Using admin key for user creation: {admin_supabase_key[:5]}...{admin_supabase_key[-5:]} (length: {len(admin_supabase_key)})")
        else:
            print("WARNING: SUPABASE_SERVICE_KEY is not set!")
            # Fall back to anon key
            admin_supabase_key = supabase_key
            print(f"Falling back to anon key: {admin_supabase_key[:5]}...{admin_supabase_key[-5:]}")

        # Create admin client
        admin_client = create_client(supabase_url, admin_supabase_key)

        # Double-check if user already exists - use admin client for all operations
        response = admin_client.table("users").select("id").eq("email", email).execute()
        if len(response.data) > 0:
            return False, "User with this email already exists"

        # Check if username is taken
        response = admin_client.table("users").select("id").eq("username", username).execute()
        if len(response.data) > 0:
            return False, "Username is already taken"

        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return False, message

        # Hash the password
        hashed_password = hash_password(password)

        # Create user with admin privileges to bypass RLS
        user_data = {
            "email": email,
            "username": username,
            "password": hashed_password,
            "profile_image": "/static/images/default_profile.png",
            "created_at": datetime.now().isoformat()
        }

        print(f"Attempting to create user with admin client: {username} / {email}")

        # Explicitly use RLS bypass with auth admin option
        print("Inserting user record with admin client")
        try:
            response = admin_client.table("users").insert(user_data).execute()

            if not response.data:
                print("No data returned from user creation")
                return False, "Failed to create user record - no data returned"

            print(f"User creation response: {response.data}")

            # Verify the user was created by fetching it back
            print("Verifying user creation by fetching data")
            verify_response = admin_client.table("users").select("*").eq("username", username).execute()

            if not verify_response.data:
                print("User verification failed - could not find created user")
                return False, "User was not properly created in database"

            print(f"User created and verified successfully: {username}")
            return True, "User created successfully"

        except Exception as insert_error:
            print(f"Error inserting user record: {insert_error}")
            return False, f"Database error: {str(insert_error)}"
    except Exception as e:
        print(f"Error creating user: {e}")
        return False, str(e)

def check_rate_limit(username):
    """Check if a user is rate limited due to too many failed login attempts"""
    if username not in login_attempts:
        return False

    attempts_data = login_attempts[username]

    # Check if user is in cooldown period
    if "cooldown_until" in attempts_data:
        if datetime.now() < attempts_data["cooldown_until"]:
            return True
        else:
            # Cooldown period ended, reset attempts
            login_attempts[username] = {"count": 0}

    return False

def record_login_attempt(username, success):
    """Record a login attempt and manage rate limiting"""
    if username not in login_attempts:
        login_attempts[username] = {"count": 0}

    if success:
        # Successful login resets the counter
        login_attempts[username] = {"count": 0}
    else:
        # Failed login increments the counter
        login_attempts[username]["count"] += 1

        # Check if we need to implement a cooldown
        if login_attempts[username]["count"] >= MAX_LOGIN_ATTEMPTS:
            cooldown_until = datetime.now() + timedelta(minutes=LOGIN_COOLDOWN_MINUTES)
            login_attempts[username]["cooldown_until"] = cooldown_until

def authenticate_user(username, password):
    """Authenticate user with username and password"""
    try:
        # Check rate limiting
        if check_rate_limit(username):
            return False, f"Too many failed login attempts. Please try again after {LOGIN_COOLDOWN_MINUTES} minutes."

        # Use admin client to bypass RLS for authentication
        admin_supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not admin_supabase_key:
            print("WARNING: SUPABASE_SERVICE_KEY is not set for authentication!")
            admin_supabase_key = supabase_key

        admin_client = create_client(supabase_url, admin_supabase_key)

        # Query user data
        print(f"Authenticating user: {username}")

        try:
            # First try querying by username
            response = admin_client.table("users").select("*").eq("username", username).execute()

            if not response.data:
                print(f"No user found with username: {username}")
                # Try with email in case they entered email instead of username
                response = admin_client.table("users").select("*").eq("email", username).execute()

                if not response.data:
                    print(f"No user found with email: {username}")
                    record_login_attempt(username, False)
                    return False, "Invalid username or password"

                print(f"Found user with email: {username}")
            else:
                print(f"Found user with username: {username}")

            user = response.data[0]

            # Verify password
            print(f"Verifying password for user ID: {user.get('id')}")

            stored_password = user.get("password")
            if not stored_password:
                print("User record has no password field")
                record_login_attempt(username, False)
                return False, "Invalid account configuration"

            if not verify_password(password, stored_password):
                print(f"Password verification failed for user: {username}")
                record_login_attempt(username, False)
                return False, "Invalid username or password"

            # Update last_login timestamp
            admin_client.table("users").update({"last_login": datetime.now().isoformat()}).eq("id", user["id"]).execute()

            # Record successful login
            print(f"Authentication successful for user: {username}")
            record_login_attempt(username, True)

            return True, user

        except Exception as query_error:
            print(f"Database error during authentication: {query_error}")
            record_login_attempt(username, False)
            return False, f"Database error: {str(query_error)}"

    except Exception as e:
        print(f"Error authenticating user: {e}")
        record_login_attempt(username, False)
        return False, str(e)

def get_google_auth_url():
    """Get Google OAuth authorization URL"""
    return f"https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=email%20profile&access_type=offline"

def handle_google_callback(auth_code):
    """Handle Google OAuth callback and retrieve user info"""
    try:
        # Exchange auth code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": auth_code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }

        token_response = requests.post(token_url, data=token_data).json()

        if 'access_token' not in token_response:
            return False, "Failed to obtain access token"

        # Get user info using access token
        user_info_response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_response['access_token']}"}
        )

        if user_info_response.status_code != 200:
            return False, "Failed to fetch user information"

        user_info = user_info_response.json()

        if 'email' not in user_info or 'name' not in user_info:
            return False, "Incomplete user information received"

        return True, user_info
    except Exception as e:
        print(f"Error in Google callback: {e}")
        return False, str(e)

def recover_account(email, new_password=None):
    """
    Recover account using verification code
    If new_password is provided, update the password
    """
    try:
        print(f"Attempting to recover account for email: {email}")

        # First get the user
        response = supabase.table("users").select("*").eq("email", email).execute()
        print(f"Recovery response data: {response.data}")

        if not response.data:
            print(f"No account found for email: {email}")
            return False, "No account found with this email"

        if new_password:
            # Validate password strength
            is_valid, message = validate_password(new_password)
            if not is_valid:
                return False, message

            # Hash the new password
            hashed_password = hash_password(new_password)

            try:
                # Update password
                update_response = supabase.table("users").update({"password": hashed_password}).eq("email", email).execute()
                print(f"Password update response: {update_response.data}")
                if not update_response.data:
                    return False, "Failed to update password"
                return True, "Password updated successfully"
            except Exception as e:
                print(f"Error updating password: {str(e)}")
                return False, f"Error updating password: {str(e)}"

        return True, "Account verified"
    except Exception as e:
        print(f"Error in recover_account: {str(e)}")
        return False, f"Account recovery failed: {str(e)}"

def generate_api_key(user_id, name):
    """Generate an API key for a user"""
    try:
        # Generate a random API key
        api_key = secrets.token_urlsafe(32)

        # Store in database
        key_data = {
            "user_id": user_id,
            "api_key": api_key,
            "name": name,
            "created_at": datetime.now().isoformat()
        }

        response = supabase.table("api_keys").insert(key_data).execute()

        if not response.data:
            return False, "Failed to create API key"

        return True, api_key
    except Exception as e:
        print(f"Error generating API key: {e}")
        return False, str(e)

def get_user_api_keys(user_id):
    """Get all API keys for a user"""
    try:
        response = supabase.table("api_keys").select("*").eq("user_id", user_id).execute()
        return True, response.data
    except Exception as e:
        print(f"Error fetching API keys: {e}")
        return False, str(e)

def get_google_oauth_url():
    """Get the Supabase native Google OAuth URL"""
    try:
        # Generate a state token to prevent CSRF
        state = secrets.token_urlsafe(32)
        session['oauth_state'] = state

        # Get configured redirect URI
        redirect_uri = os.getenv("REDIRECT_URL", "http://localhost:5001/callback/google")
        provider = "google"

        # Use Supabase's built-in OAuth handling with state parameter
        auth_url = f"{supabase_url}/auth/v1/authorize?provider={provider}&redirect_to={redirect_uri}&state={state}"
        print(f"Generated OAuth URL with state: {state}")
        return auth_url
    except Exception as e:
        print(f"Error generating Google OAuth URL: {e}")
        return None

def handle_supabase_callback(query_params):
    """Handle callback from Supabase OAuth flow"""
    try:
        # Get the tokens from the query params - in some Supabase setups, these might be:
        # - directly in the URL
        # - or in a 'code' parameter that needs to be exchanged
        access_token = query_params.get('access_token')
        code = query_params.get('code')

        # Create admin client to use service role key
        admin_supabase_key = os.getenv("SUPABASE_SERVICE_KEY", supabase_key)
        admin_client = create_client(supabase_url, admin_supabase_key)

        # If we have a code but no access token, exchange the code
        if code and not access_token:
            try:
                # This step depends on how your Supabase setup works - you might need
                # to implement code exchange if using the pkce flow
                print(f"Attempting to exchange code for token: {code[:10]}...")
                # For now, let's try to directly get the user session
                session_response = admin_client.auth.exchange_code_for_session(code)
                if session_response:
                    access_token = session_response.access_token
                    print("Successfully exchanged code for token")
            except Exception as code_ex:
                print(f"Error exchanging code: {code_ex}")
                # Continue with other strategies

        # If we still don't have an access token, try to get user data from Supabase
        # based on the email in the query params
        if not access_token:
            email = query_params.get('email')
            if email:
                print(f"No access token found, trying to find user by email: {email}")
                user_data = admin_client.table("users").select("*").eq("email", email).execute()
                if user_data.data:
                    return True, user_data.data[0]
                else:
                    return False, "No user found with this email"
            else:
                return False, "No access token or email found in callback"

        # If we have an access token, get the user data
        print(f"Getting user with access token: {access_token[:10]}...")
        user_response = admin_client.auth.get_user(access_token)

        if not user_response or not user_response.user:
            return False, "Could not retrieve user data"

        user = user_response.user
        print(f"Retrieved user data for: {user.email}")

        # Check if user already exists in our database
        user_data = admin_client.table("users").select("*").eq("email", user.email).execute()

        if not user_data.data:
            # Create entry in our users table if it doesn't exist
            print(f"Creating new user record for {user.email}")
            new_user = {
                "email": user.email,
                "username": user.email.split('@')[0],  # Generate username from email
                "created_at": datetime.now().isoformat(),
                "auth_id": user.id,
                "provider": "google",
                "profile_image": user.user_metadata.get('avatar_url', '/static/images/default_profile.png') if user.user_metadata else '/static/images/default_profile.png',
                # Generate a random password hash since we won't use password login for this user
                "password": hash_password(secrets.token_urlsafe(16))
            }

            admin_client.table("users").insert(new_user).execute()

            # Fetch the newly created user
            user_data = admin_client.table("users").select("*").eq("email", user.email).execute()

        return True, user_data.data[0] if user_data.data else None

    except Exception as e:
        print(f"Error handling Supabase callback: {e}")
        return False, str(e)

def direct_google_oauth_url():
    """Get direct Google OAuth URL (bypassing Supabase)"""
    try:
        from flask import session
        # Generate a state token to prevent CSRF
        state = secrets.token_urlsafe(32)
        session['oauth_state'] = state

        # Direct call to Google OAuth
        auth_url = f"https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=email%20profile&access_type=offline&state={state}"
        print(f"Generated direct Google OAuth URL with state: {state}")
        return auth_url
    except Exception as e:
        print(f"Error generating direct Google OAuth URL: {e}")
        return None

def handle_direct_google_callback(auth_code):
    """Handle direct Google OAuth callback without Supabase"""
    try:
        # Exchange auth code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": auth_code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }

        token_response = requests.post(token_url, data=token_data).json()

        if 'access_token' not in token_response:
            return False, "Failed to obtain access token"

        # Get user info using access token
        user_info_response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_response['access_token']}"}
        )

        if user_info_response.status_code != 200:
            return False, "Failed to fetch user information"

        user_info = user_info_response.json()

        if 'email' not in user_info or 'name' not in user_info:
            return False, "Incomplete user information received"

        # Create admin client to use service role key
        admin_supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not admin_supabase_key:
            print("WARNING: SUPABASE_SERVICE_KEY not set for Google OAuth!")
            admin_supabase_key = supabase_key

        print(f"Using admin key in Google OAuth: {admin_supabase_key[:5]}...{admin_supabase_key[-5:]}")
        admin_client = create_client(supabase_url, admin_supabase_key)

        # Check if user already exists in our database
        user_data = admin_client.table("users").select("*").eq("email", user_info['email']).execute()

        if not user_data.data:
            # Create entry in our users table if it doesn't exist
            print(f"Creating new Google user: {user_info['email']}")

            # Generate a username from email
            base_username = user_info['email'].split('@')[0]
            username = base_username

            # Check if username exists and generate alternatives if needed
            count = 1
            while True:
                # Check using admin client
                check_response = admin_client.table("users").select("id").eq("username", username).execute()
                if not check_response.data:
                    break
                username = f"{base_username}{count}"
                count += 1
                if count > 10:  # Prevent infinite loop
                    return False, "Could not generate a unique username"

            new_user = {
                "email": user_info['email'],
                "username": username,
                "created_at": datetime.now().isoformat(),
                "provider": "google",
                "profile_image": user_info.get('picture', '/static/images/default_profile.png'),
                # Generate a random password hash since we won't use password login for this user
                "password": hash_password(secrets.token_urlsafe(16))
            }

            print(f"Inserting new Google user with admin client: {username}")
            # Use admin client to insert
            insert_response = admin_client.table("users").insert(new_user).execute()

            if not insert_response.data:
                print("Failed to insert Google user!")
                return False, "Failed to create user record"

            # Fetch the newly created user
            user_data = admin_client.table("users").select("*").eq("email", user_info['email']).execute()

        print(f"Google authentication successful for: {user_info['email']}")
        return True, user_data.data[0] if user_data.data else None

    except Exception as e:
        print(f"Error handling direct Google callback: {e}")
        return False, str(e)

def test_admin_client():
    """Test function to verify admin client works"""
    try:
        print("\n--- TESTING ADMIN CLIENT ---")

        # Get service role key
        admin_supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not admin_supabase_key:
            print("ERROR: SUPABASE_SERVICE_KEY environment variable is not set!")
            print("Please set this variable with your service role key from Supabase.")
            print("You can find it in Project Settings > API > service_role key")
            return False, "SUPABASE_SERVICE_KEY not set"

        print(f"Admin key: {admin_supabase_key[:5]}...{admin_supabase_key[-5:]} (length: {len(admin_supabase_key)})")

        # Create admin client
        admin_client = create_client(supabase_url, admin_supabase_key)

        # Try to query users table
        try:
            print("Testing users table query...")
            response = admin_client.table("users").select("count").execute()
            print(f"Users table query successful! Found data: {response.data}")
        except Exception as e:
            print(f"Error querying users table: {e}")
            return False, f"Error querying users table: {e}"

        # Try to insert a test row (without actually committing it)
        try:
            print("Testing insert capability...")
            # This uses a single SQL query transaction that will be rolled back
            # It tests if we have insert permissions without actually changing data
            query = """
            DO $$
            BEGIN
                -- Start a transaction
                BEGIN;

                -- Try to insert a row
                INSERT INTO users (email, username, password)
                VALUES ('test@example.com', 'testuser', 'testpassword');

                -- Roll back the transaction so no changes are actually made
                ROLLBACK;
            END;
            $$;
            """
            admin_client.postgrest.rpc("get", {"args": {"query": query}}).execute()
            print("Insert capability test successful!")
        except Exception as e:
            print(f"Error testing insert capability: {e}")
            print("This might indicate the service role key doesn't have proper permissions.")
            return False, f"Error testing insert capability: {e}"

        print("Admin client test completed successfully!")
        return True, "Admin client test passed"

    except Exception as e:
        print(f"Error testing admin client: {e}")
        return False, str(e)

def test_database_access():
    """Test basic database access with both regular and admin clients"""
    results = []

    # Test 1: Check regular client
    try:
        print("\n--- TESTING REGULAR CLIENT ---")
        result = supabase.table("users").select("count").execute()
        count = result.data[0]['count'] if result.data else 0
        print(f"Regular client: Found {count} users")
        results.append(("Regular client test", True, f"Found {count} users"))
    except Exception as e:
        print(f"Regular client error: {e}")
        results.append(("Regular client test", False, str(e)))

    # Test 2: Check admin client
    try:
        print("\n--- TESTING ADMIN CLIENT ---")
        admin_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not admin_key:
            raise ValueError("SUPABASE_SERVICE_KEY not set")

        admin_client = create_client(supabase_url, admin_key)
        result = admin_client.table("users").select("count").execute()
        count = result.data[0]['count'] if result.data else 0
        print(f"Admin client: Found {count} users")
        results.append(("Admin client test", True, f"Found {count} users"))
    except Exception as e:
        print(f"Admin client error: {e}")
        results.append(("Admin client test", False, str(e)))

    # Test 3: Try to fetch a real user
    try:
        print("\n--- TESTING USER FETCH ---")
        admin_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not admin_key:
            raise ValueError("SUPABASE_SERVICE_KEY not set")

        admin_client = create_client(supabase_url, admin_key)
        result = admin_client.table("users").select("*").limit(1).execute()

        if result.data:
            user = result.data[0]
            # Sanitize output by removing sensitive fields
            if "password" in user:
                user["password"] = "***REDACTED***"
            print(f"Successfully fetched sample user: {user}")
            results.append(("User fetch test", True, "Successfully fetched a user"))
        else:
            print("No users found in database")
            results.append(("User fetch test", False, "No users found in database"))
    except Exception as e:
        print(f"User fetch error: {e}")
        results.append(("User fetch test", False, str(e)))

    return results
