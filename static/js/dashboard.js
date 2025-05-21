// Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeProfileUpload();
    initializeApiKeyHandling();
});

// Profile Image Upload Handling
function initializeProfileUpload() {
    const profileImageInput = document.querySelector('.profile-image input[type="file"]');
    const profileImage = document.querySelector('.profile-image img');
    
    if (profileImageInput) {
        profileImageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please select an image file.', 'error');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size should be less than 5MB.', 'error');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('profile_image', file);

                const response = await fetch('/upload_profile_image', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Upload failed');

                const data = await response.json();
                
                // Update profile image preview
                profileImage.src = URL.createObjectURL(file);
                showNotification('Profile image updated successfully!', 'success');
                
            } catch (error) {
                console.error('Upload error:', error);
                showNotification('Failed to upload image. Please try again.', 'error');
            }
        });
    }
}

// API Key Management
function initializeApiKeyHandling() {
    // Handle API key reveal buttons
    document.querySelectorAll('.reveal-key').forEach(button => {
        button.addEventListener('click', async (e) => {
            const apiCard = e.target.closest('.api-card');
            const keyId = apiCard.dataset.keyId;
            
            try {
                const response = await fetch(`/get_api_key/${keyId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch API key');

                const data = await response.json();
                
                // Create a temporary input to copy the API key
                const tempInput = document.createElement('input');
                tempInput.value = data.api_key;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                showNotification('API key copied to clipboard!', 'success');
                
            } catch (error) {
                console.error('Error:', error);
                showNotification('Failed to retrieve API key.', 'error');
            }
        });
    });

    // Handle API key revocation
    document.querySelectorAll('.revoke-key').forEach(button => {
        button.addEventListener('click', async (e) => {
            if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
                return;
            }

            const apiCard = e.target.closest('.api-card');
            const keyId = apiCard.dataset.keyId;

            try {
                const response = await fetch(`/revoke_api_key/${keyId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to revoke API key');

                // Update the UI to reflect the revoked state
                apiCard.querySelector('.api-status').textContent = 'Inactive';
                apiCard.querySelector('.api-status').classList.remove('active');
                apiCard.querySelector('.api-status').classList.add('inactive');
                button.disabled = true;
                
                showNotification('API key revoked successfully!', 'success');
                
            } catch (error) {
                console.error('Error:', error);
                showNotification('Failed to revoke API key.', 'error');
            }
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification styles if not already in CSS
    const styles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }
        .notification.success { background-color: #28a745; }
        .notification.error { background-color: #dc3545; }
        .notification.info { background-color: #17a2b8; }
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        
        ripple.className = 'ripple';
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
    });
});

// Optional: Add loading indicators for async operations
function showLoading(element) {
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    element.appendChild(loadingSpinner);
    element.disabled = true;
}

function hideLoading(element) {
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
    element.disabled = false;
}