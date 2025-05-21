import os
import secrets
from PIL import Image
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'static/uploads/profiles'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def init_upload_handler(app):
    """Initialize upload handler with Flask app"""
    os.makedirs(os.path.join(app.root_path, UPLOAD_FOLDER), exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_profile_image(file, user_id):
    """
    Save and process profile image
    Returns: (success, result)
    - If success is True, result is the file path
    - If success is False, result is the error message
    """
    if not file:
        return False, "No file provided"
    
    if not allowed_file(file.filename):
        return False, "File type not allowed"
    
    try:
        # Generate secure filename with random component
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        random_hex = secrets.token_hex(8)
        new_filename = f"profile_{user_id}_{random_hex}{ext}"
        
        filepath = os.path.join(UPLOAD_FOLDER, new_filename)
        
        # Open and process image
        img = Image.open(file)
        
        # Convert to RGB if necessary (for PNG with transparency)
        if img.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', img.size, 'white')
            background.paste(img, mask=img.split()[-1])
            img = background
        
        # Resize to standard size (e.g., 400x400) maintaining aspect ratio
        target_size = (400, 400)
        img.thumbnail(target_size, Image.Resampling.LANCZOS)
        
        # Create white background for images smaller than target
        if img.size != target_size:
            background = Image.new('RGB', target_size, 'white')
            offset = ((target_size[0] - img.size[0]) // 2,
                     (target_size[1] - img.size[1]) // 2)
            background.paste(img, offset)
            img = background
        
        # Save processed image
        img.save(filepath, quality=85, optimize=True)
        
        return True, filepath.replace('\\', '/')  # Normalize path for URLs
        
    except Exception as e:
        return False, str(e)

def delete_old_profile_image(old_path):
    """Delete old profile image if it exists"""
    if old_path and os.path.exists(old_path):
        try:
            os.remove(old_path)
            return True
        except:
            return False
    return False