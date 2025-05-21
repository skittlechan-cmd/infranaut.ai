import base64
import os

def convert_base64_to_image(source_file, output_file):
    # Read the file content
    with open(source_file, 'r') as f:
        base64_data = f.read().strip()
    
    # If it has a data:image/png;base64, prefix, remove it
    if base64_data.startswith('data:image/png;base64,'):
        base64_data = base64_data.split('data:image/png;base64,')[1]
    
    # Decode the base64 data
    binary_data = base64.b64decode(base64_data)
    
    # Write to output file
    with open(output_file, 'wb') as f:
        f.write(binary_data)
    
    print(f"Converted {source_file} to {output_file}")

# Make sure the images directory exists
os.makedirs('static/images', exist_ok=True)

# Default profile image
convert_base64_to_image('static/css/default_profile.png.b64', 'static/images/default_profile.png')

# Google icon
convert_base64_to_image('static/css/google-icon.png.b64', 'static/images/google-icon.png')

print("Conversion complete!")
