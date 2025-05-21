from flask import Flask, render_template, send_from_directory, make_response, request, flash, redirect, url_for, session, jsonify
from flask_compress import Compress
from functools import wraps
import os
from email_handler import init_mail_app, validate_contact_form, send_contact_email
from upload_handlers import init_upload_handler, save_profile_image, delete_old_profile_image
from auth import (
    get_google_auth_url, handle_google_callback, generate_verification_code,
    send_verification_email, store_verification_code, verify_code,
    create_user, authenticate_user, recover_account, validate_password,
    generate_api_key, get_user_api_keys, check_email_exists, check_username_exists
)
from flask_wtf.csrf import CSRFProtect, generate_csrf
from dotenv import load_dotenv
import secrets

# Load environment variables
load_dotenv()

app = Flask(__name__)
Compress(app)

# Secret key for flash messages and CSRF protection
app.secret_key = os.environ.get('SECRET_KEY')

# Initialize CSRF protection
csrf = CSRFProtect(app)
# Debug CSRF setup
print(f"CSRF protection initialized with secret key: {'[SET]' if app.secret_key else '[NOT SET]'}")

# Configure CSRF settings
app.config['WTF_CSRF_TIME_LIMIT'] = None  # Disable CSRF token expiration
app.config['WTF_CSRF_SSL_STRICT'] = False  # Allow CSRF over HTTP

# Initialize mail
init_mail_app(app)

# Initialize file upload handler
init_upload_handler(app)

# Enable template caching
app.config['TEMPLATES_AUTO_RELOAD'] = True  # Enable for development
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000  # 1 year in seconds

# Session configuration
app.config['SESSION_COOKIE_SECURE'] = True  # Allow cookies over HTTP
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
app.config['SESSION_PROTECTION'] = 'strong'

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

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

# Authentication Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    # If user is already logged in, redirect to dashboard
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            flash('Please enter both username and password', 'error')
            return render_template('auth/login.html', csrf_token=generate_csrf())

        # Try to authenticate the user
        success, result = authenticate_user(username, password)

        if success:
            # Get user data first
            user_id = result['id']
            username = result['username']
            email = result['email']
            profile_image = result.get('profile_image', '/static/images/default_profile.png')

            # Clear existing session completely
            session.clear()

            # Create a fresh session with user data
            session['user_id'] = user_id
            session['username'] = username
            session['email'] = email
            session['profile_image'] = profile_image

            # Log successful login
            print(f"User logged in: {username}")

            # Redirect to the dashboard or a requested page
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            return redirect(url_for('dashboard'))
        else:
            # Log failed login attempt with remote IP (for security monitoring)
            remote_ip = request.remote_addr
            print(f"Failed login attempt for user '{username}' from IP {remote_ip}: {result}")

            # Don't reveal specific error to prevent user enumeration
            flash('Invalid username or password', 'error')
            return render_template('auth/login.html', csrf_token=generate_csrf())

    # GET request, show login form
    return render_template('auth/login.html', csrf_token=generate_csrf())

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    try:
        if request.method == 'POST':
            # Print all form data for debugging (excluding password)
            form_data = {k: v for k, v in request.form.items() if k != 'password'}
            print(f"Signup form data received: {form_data}")

            email = request.form.get('email')
            username = request.form.get('username')
            password = request.form.get('password')
            verification_code = request.form.get('verification_code')

            # Validate that we have the required fields
            if verification_code:
                # This is the verification step

                # Get pending signup data
                pending_data = session.get('pending_signup', {})
                if not pending_data:
                    flash('Session expired. Please try signing up again.', 'error')
                    return redirect(url_for('signup'))

                email = pending_data.get('email')

                # Verify the code
                if verify_code(email, verification_code):
                    success, message = create_user(
                        pending_data.get('email'),
                        pending_data.get('username'),
                        pending_data.get('password')
                    )

                    if success:
                        # Clear the pending signup data
                        session.pop('pending_signup', None)

                        flash('Account created successfully! Please log in.', 'success')
                        return redirect(url_for('login'))
                    else:
                        flash(f'Error creating account: {message}', 'error')
                        return render_template('auth/verify_email.html', email=email, csrf_token=generate_csrf())
                else:
                    flash('Invalid or expired verification code. Please try again.', 'error')
                    return render_template('auth/verify_email.html', email=email, csrf_token=generate_csrf())
            else:
                # This is the initial signup step

                # Validate required fields
                if not email or not username or not password:
                    flash('Please fill in all required fields.', 'error')
                    return render_template('auth/signup.html',
                                          email=email,
                                          username=username,
                                          csrf_token=generate_csrf())

                # Check if email already exists
                if check_email_exists(email):
                    flash('An account with this email already exists.', 'error')
                    return render_template('auth/signup.html',
                                          username=username,
                                          csrf_token=generate_csrf())

                # Check if username already exists
                if check_username_exists(username):
                    flash('This username is already taken.', 'error')
                    return render_template('auth/signup.html',
                                          email=email,
                                          csrf_token=generate_csrf())

                # Validate password
                is_valid, message = validate_password(password)
                if not is_valid:
                    flash(message, 'error')
                    return render_template('auth/signup.html',
                                          email=email,
                                          username=username,
                                          csrf_token=generate_csrf())

                # Generate verification code
                code = generate_verification_code()
                store_verification_code(email, code)

                # Send verification email
                if send_verification_email(email, code):
                    # Store signup data in session
                    session['pending_signup'] = {
                        'email': email,
                        'username': username,
                        'password': password
                    }

                    return render_template('auth/verify_email.html', email=email, csrf_token=generate_csrf())
                else:
                    flash('Failed to send verification email. Please try again.', 'error')
                    return render_template('auth/signup.html',
                                          email=email,
                                          username=username,
                                          csrf_token=generate_csrf())

        # GET request - show signup form
        return render_template('auth/signup.html', csrf_token=generate_csrf())

    except Exception as e:
        print(f"Error in signup route: {str(e)}")
        flash('An unexpected error occurred. Please try again.', 'error')
        return render_template('auth/signup.html', csrf_token=generate_csrf())

@app.route('/login/google')
def google_login():
    """Redirect user to Google login via direct OAuth"""
    # Use direct OAuth instead of Supabase's
    from auth import direct_google_oauth_url

    auth_url = direct_google_oauth_url()
    if not auth_url:
        flash('Error connecting to authentication service', 'error')
        return redirect(url_for('login'))

    return redirect(auth_url)

@app.route('/callback/google')
def google_callback():
    """Handle callback from Google OAuth directly"""
    try:
        # First check if we have an error
        error = request.args.get('error')
        if error:
            flash(f'Authentication error: {error}', 'error')
            return redirect(url_for('login'))

        # Verify the state parameter to prevent CSRF attacks
        state = request.args.get('state')
        session_state = session.pop('oauth_state', None)

        print(f"Callback received - State: {state}, Session state: {session_state}")

        if not state or state != session_state:
            flash('Authentication failed: Invalid state token. Please try again.', 'error')
            return redirect(url_for('login'))

        # Get authorization code from query parameters
        code = request.args.get('code')
        if not code:
            flash('Authentication failed: No authorization code received', 'error')
            return redirect(url_for('login'))

        # Process the code and get user information
        from auth import handle_direct_google_callback

        success, result = handle_direct_google_callback(code)

        if not success:
            flash(f'Authentication failed: {result}', 'error')
            return redirect(url_for('login'))

        # If authentication was successful but no user record
        if not result:
            flash('Authentication succeeded but user data not found', 'error')
            return redirect(url_for('login'))

        # Create new session to prevent session fixation
        # First store necessary data
        user_id = result.get('id')
        username = result.get('username')
        email = result.get('email')
        profile_image = result.get('profile_image', '/static/images/default_profile.png')

        # Clear the session completely
        session.clear()

        # Create a fresh session with user data
        session['user_id'] = user_id
        session['username'] = username
        session['email'] = email
        session['profile_image'] = profile_image

        # Redirect to dashboard
        return redirect(url_for('dashboard'))
    except Exception as e:
        # Log the exception for debugging
        print(f"Error in Google callback: {str(e)}")
        flash('An unexpected error occurred during authentication. Please try again.', 'error')
        return redirect(url_for('login'))

@app.route('/complete-google-signup', methods=['GET', 'POST'])
def complete_google_signup():
    try:
        google_data = session.get('google_signup')
        if not google_data:
            return redirect(url_for('login'))

        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')

            if not username or not password:
                flash('Please provide both username and password', 'error')
                return render_template('auth/complete_google_signup.html', email=google_data['email'], csrf_token=generate_csrf())

            # Check if username is already taken
            if check_username_exists(username):
                flash('This username is already taken', 'error')
                return render_template('auth/complete_google_signup.html', email=google_data['email'], csrf_token=generate_csrf())

            # Validate password
            is_valid, message = validate_password(password)
            if not is_valid:
                flash(message, 'error')
                return render_template('auth/complete_google_signup.html', email=google_data['email'], csrf_token=generate_csrf())

            # Check if user already exists by email (Google might have created an auth user)
            from auth import supabase
            existing_user = supabase.table("users").select("*").eq("email", google_data['email']).execute()
            if existing_user.data:
                flash('An account with this email already exists', 'error')
                return render_template('auth/complete_google_signup.html', email=google_data['email'], csrf_token=generate_csrf())

            # Create the user with error handling
            success, message = create_user(google_data['email'], username, password)

            if success:
                # Fetch the newly created user
                user_response = supabase.table("users").select("*").eq("email", google_data['email']).execute()

                if user_response.data:
                    user = user_response.data[0]
                    # Get user data
                    user_id = user.get('id')
                    user_username = user.get('username')
                    user_email = user.get('email')
                    user_profile_image = user.get('profile_image')

                    # Clear the session completely
                    session.clear()

                    # Create fresh session with user data
                    session['user_id'] = user_id
                    session['username'] = user_username
                    session['email'] = user_email
                    session['profile_image'] = user_profile_image

                    flash('Account created successfully!', 'success')
                    return redirect(url_for('dashboard'))
                else:
                    # Clear the session completely
                    session.clear()
                    flash('Account created. Please log in.', 'success')
                    return redirect(url_for('login'))
            else:
                # Log detailed error for debugging
                print(f"Error in complete_google_signup: {message}")
                flash(f'Error creating account: {message}', 'error')
                return render_template('auth/complete_google_signup.html', email=google_data['email'], csrf_token=generate_csrf())

        return render_template('auth/complete_google_signup.html', email=google_data['email'], csrf_token=generate_csrf())
    except Exception as e:
        # Log the exception for debugging
        print(f"Error in complete Google signup: {str(e)}")
        flash('An unexpected error occurred during signup. Please try again.', 'error')
        return redirect(url_for('login'))

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    try:
        print(f"CSRF Token in session: {session.get('csrf_token')}")
        print(f"Request method: {request.method}")
        print(f"Request form data: {request.form}")
        if request.method == 'POST':
            print("Forgot password POST request received")
            email = request.form.get('email')
            verification_code = request.form.get('verification_code')
            new_password = request.form.get('new_password')

            # Print form data and CSRF info (excluding passwords)
            print(f"Form data: email={email}, has_code={bool(verification_code)}, has_new_password={bool(new_password)}")
            print(f"CSRF token in form: {request.form.get('csrf_token')}")
            print(f"Generated CSRF token: {generate_csrf()}")

            # Step 1: User entered email, send verification code
            if not verification_code and not new_password:
                if not email:
                    flash('Please enter your email', 'error')
                    return render_template('auth/forgot_password.html', csrf_token=generate_csrf())

                # Check if user exists
                from auth import supabase, check_email_exists

                try:
                    exists = check_email_exists(email)
                    if not exists:
                        print(f"User with email {email} not found")
                        # Still show success message for security
                        flash('If an account with this email exists, a verification code has been sent', 'info')
                        return render_template('auth/forgot_password.html', csrf_token=generate_csrf())
                except Exception as e:
                    print(f"Error checking email existence: {str(e)}")
                    flash('An error occurred. Please try again.', 'error')
                    return render_template('auth/forgot_password.html', csrf_token=generate_csrf())

                # Generate and send verification code
                from auth import generate_verification_code, store_verification_code, send_verification_email

                try:
                    code = generate_verification_code()
                    print(f"Generated verification code for {email}")

                    store_verification_code(email, code)
                    print(f"Stored verification code for {email}")

                    if send_verification_email(email, code, is_recovery=True):
                        print(f"Recovery code sent to {email}: {code}")
                        session['recovery_email'] = email
                        return render_template('auth/verify_recovery.html', email=email, csrf_token=generate_csrf())
                    else:
                        print(f"Failed to send recovery code to {email}")
                        flash('Failed to send verification email. Please try again.', 'error')
                        return render_template('auth/forgot_password.html', csrf_token=generate_csrf())
                except Exception as e:
                    print(f"Error in password recovery process: {str(e)}")
                    flash('An error occurred during the recovery process. Please try again.', 'error')
                    return render_template('auth/forgot_password.html', csrf_token=generate_csrf())

            # Step 2: User entered verification code, let them set a new password
            elif verification_code and not new_password:
                recovery_email = session.get('recovery_email')
                print(f"Step 2 - Recovery email from session: {recovery_email}")
                print(f"Verification code received: {verification_code}")

                if not recovery_email:
                    print("No recovery email in session")
                    flash('Session expired. Please try again.', 'error')
                    return redirect(url_for('forgot_password'))

                from auth import verify_code

                if verify_code(recovery_email, verification_code):
                    print(f"Recovery code verified for {recovery_email}")
                    session['recovery_verified'] = True
                    return render_template('auth/recovery_success.html', email=recovery_email, csrf_token=generate_csrf())
                else:
                    print(f"Invalid recovery code for {recovery_email}")
                    flash('Invalid or expired verification code', 'error')
                    return render_template('auth/verify_recovery.html', email=recovery_email, csrf_token=generate_csrf())

            # Step 3: User entered new password, update it
            elif new_password and session.get('recovery_verified'):
                recovery_email = session.get('recovery_email')

                if not recovery_email:
                    flash('Session expired. Please try again.', 'error')
                    return redirect(url_for('forgot_password'))

                # Validate password
                from auth import validate_password, recover_account

                is_valid, message = validate_password(new_password)
                if not is_valid:
                    flash(message, 'error')
                    return render_template('auth/recovery_success.html', email=recovery_email, csrf_token=generate_csrf())

                success, message = recover_account(recovery_email, new_password)

                if success:
                    # Clear recovery session data
                    session.pop('recovery_email', None)
                    session.pop('recovery_verified', None)

                    print(f"Password successfully reset for {recovery_email}")
                    flash('Password updated successfully! Please log in with your new password.', 'success')
                    return redirect(url_for('login'))
                else:
                    print(f"Error resetting password for {recovery_email}: {message}")
                    flash(f'Error updating password: {message}', 'error')
                    return render_template('auth/recovery_success.html', email=recovery_email, csrf_token=generate_csrf())

            else:
                flash('Invalid request', 'error')
                return redirect(url_for('forgot_password'))

        # GET request
        return render_template('auth/forgot_password.html', csrf_token=generate_csrf())

    except Exception as e:
        print(f"Error in forgot_password route: {str(e)}")
        print(f"Full error details: {repr(e)}")
        print(f"Request form data: {request.form}")
        print(f"Session data: {session}")
        flash('An unexpected error occurred. Please try again.', 'error')
        return render_template('auth/forgot_password.html', csrf_token=generate_csrf())

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    user_id = session.get('user_id')
    # Fetch API keys for the user
    success, api_keys = get_user_api_keys(user_id)
    return render_template('auth/dashboard.html', api_keys=api_keys if success else [])

# API for checking username and email availability
@app.route('/api/check-username')
def api_check_username():
    username = request.args.get('username')
    if not username:
        return jsonify({"success": False, "message": "Username is required"}), 400

    exists = check_username_exists(username)
    return jsonify({"success": True, "exists": exists})

@app.route('/api/check-email')
def api_check_email():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400

    exists = check_email_exists(email)
    return jsonify({"success": True, "exists": exists})

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

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Get form data
        name = request.form.get('name', '')
        email = request.form.get('email', '')
        subject = request.form.get('subject', '')
        message = request.form.get('message', '')

        # Validate form data
        errors = validate_contact_form(name, email, subject, message)

        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('pages/contact.html')

        # Send email
        success, msg = send_contact_email(name, email, subject, message)

        if success:
            flash(msg, 'success')
            return redirect(url_for('contact'))
        else:
            flash(msg, 'error')
            return render_template('pages/contact.html')

    # GET request - display form
    return render_template('pages/contact.html')

@app.route('/workflow')
@cache_control()
def workflow():
    return render_template('pages/workflow.html')

@app.route('/add-on')
@cache_control()
def addon():
    return render_template('pages/add-on.html')



# dashboard
@app.route('/api/generate-key', methods=['POST'])
@login_required
def api_generate_key():
    user_id = session.get('user_id')
    key_name = request.form.get('key_name')

    if not key_name:
        flash('Please provide a name for your API key', 'error')
        return redirect(url_for('dashboard'))

    success, result = generate_api_key(user_id, key_name)

    if success:
        flash(f'API key generated successfully. Your new key is: {result}', 'success')
    else:
        flash(f'Error generating API key: {result}', 'error')
    return redirect(url_for('dashboard'))

@app.route('/upload_profile_image', methods=['POST'])
@login_required
def upload_profile_image():
    if 'profile_image' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'})

    file = request.files['profile_image']
    user_id = session.get('user_id')

    success, result = save_profile_image(file, user_id)

    if success:
        # Update user's profile image in database
        from auth import supabase
        old_image = session.get('profile_image')

        # Update database
        supabase.table('users').update({
            'profile_image': '/' + result
        }).eq('id', user_id).execute()

        # Update session
        session['profile_image'] = '/' + result

        # Delete old image if it exists
        if old_image and '/default' not in old_image:
            old_path = old_image.lstrip('/')
            delete_old_profile_image(old_path)

        return jsonify({
            'success': True,
            'image_url': '/' + result
        })

    return jsonify({
        'success': False,
        'error': result
    })

@app.route('/revoke_api_key', methods=['POST'])
@login_required
def revoke_api_key():
    try:
        data = request.get_json()
        key_id = data.get('key_id')
        user_id = session.get('user_id')

        if not key_id:
            return jsonify({'success': False, 'error': 'No key ID provided'})

        # Update the API key status in database
        from auth import supabase
        result = supabase.table('api_keys').update({
            'is_active': False
        }).eq('id', key_id).eq('user_id', user_id).execute()

        if result.data:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Failed to revoke key'})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})



@app.context_processor
def inject_csrf_token():
    return dict(csrf_token=generate_csrf())





# Test cases
#
#
#
# # @app.route('/test-supabase')
# def test_supabase():
#     try:
#         from auth import supabase
#         # Try to query users table with more details
#         response = supabase.table("users").select("*").execute()

#         users_data = response.data

#         # Get table info
#         table_info = {
#             "total_users": len(users_data),
#             "fields": list(users_data[0].keys()) if users_data else [],
#             "sample_data": [
#                 {k: v for k, v in user.items() if k not in ['password']}
#                 for user in users_data[:2]
#             ] if users_data else []
#         }

#         return jsonify({
#             "success": True,
#             "message": "Successfully connected to Supabase",
#             "connection_info": {
#                 "url": supabase.rest_url
#             },
#             "table_info": table_info,
#             "total_users": len(users_data)
#         })
#     except Exception as e:
#         return jsonify({
#             "success": False,
#             "error": str(e),
#             "details": repr(e),
#             "type": type(e).__name__
#         })
#
# @app.route('/test-admin-client')
# def test_admin_client_route():
#     """Test route to verify admin client works - access restricted to local requests"""
#     # Only allow requests from localhost
#     if request.remote_addr not in ['127.0.0.1', 'localhost', '::1']:
#         return "This endpoint is restricted to localhost for security reasons.", 403

#     from auth import test_admin_client

#     success, message = test_admin_client()

#     if success:
#         return f"Admin client test successful! {message}", 200
#     else:
#         return f"Admin client test failed: {message}", 500

# @app.route('/test-db-access')
# def test_db_access_route():
#     """Test route to verify database access - access restricted to local requests"""
#     # Only allow requests from localhost
#     if request.remote_addr not in ['127.0.0.1', 'localhost', '::1']:
#         return "This endpoint is restricted to localhost for security reasons.", 403

#     from auth import test_database_access

#     results = test_database_access()

#     html_output = "<h1>Database Access Test Results</h1>"
#     for test_name, success, message in results:
#         status = "✅ SUCCESS" if success else "❌ FAILED"
#         html_output += f"<p><strong>{test_name}</strong>: {status}<br>{message}</p>"

#     html_output += "<h2>Environment Check</h2>"

#     # Check critical env vars (redacted for security)
#     env_vars = {
#         "SUPABASE_URL": os.getenv("SUPABASE_URL"),
#         "SUPABASE_KEY": os.getenv("SUPABASE_KEY"),
#         "SUPABASE_SERVICE_KEY": os.getenv("SUPABASE_SERVICE_KEY"),
#     }

#     html_output += "<ul>"
#     for var_name, value in env_vars.items():
#         if value:
#             # Redact for security
#             shown_value = f"{value[:5]}...{value[-5:]}" if len(value) > 10 else "***"
#             html_output += f"<li><strong>{var_name}</strong>: {shown_value} (length: {len(value)})</li>"
#         else:
#             html_output += f"<li><strong>{var_name}</strong>: <span style='color:red'>NOT SET</span></li>"
#     html_output += "</ul>"

#     return html_output

if __name__ == '__main__':
    # Production configurations
    app.config['TEMPLATES_AUTO_RELOAD'] = True # Make false in production
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 # Disable caching in production
    #app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000
    app.run(debug=False, host='0.0.0.0', port=5001)
