/**
 * Authentication Validation Functions
 * Provides real-time validation for username and email availability
 */

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Safeguard for modules.js function reference
// This prevents the "adjustAllCardsHeight is not defined" error
if (typeof window.adjustAllCardsHeight === 'undefined') {
    window.adjustAllCardsHeight = function() {
        console.log('Placeholder for adjustAllCardsHeight');
        // No implementation needed, just preventing errors
    };
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if a username already exists
const checkUsername = debounce(async (username, feedbackElement) => {
    if (!username || username.length < 3) {
        feedbackElement.innerHTML = '';
        feedbackElement.classList.remove('valid-feedback', 'invalid-feedback');
        return false; // Return false explicitly for short usernames
    }

    try {
        feedbackElement.innerHTML = '<span class="spinner"></span> Checking availability...';
        feedbackElement.classList.remove('valid-feedback', 'invalid-feedback');
        feedbackElement.classList.add('checking-feedback');

        const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (response.ok) {
            if (data.exists) {
                feedbackElement.innerHTML = 'This username is already taken';
                feedbackElement.classList.remove('checking-feedback', 'valid-feedback');
                feedbackElement.classList.add('invalid-feedback');
                return false;
            } else {
                feedbackElement.innerHTML = 'Username is available';
                feedbackElement.classList.remove('checking-feedback', 'invalid-feedback');
                feedbackElement.classList.add('valid-feedback');
                return true;
            }
        } else {
            throw new Error(data.message || 'Error checking username');
        }
    } catch (error) {
        console.error('Error checking username:', error);
        feedbackElement.innerHTML = 'Unable to verify username at this time';
        feedbackElement.classList.remove('checking-feedback', 'valid-feedback');
        feedbackElement.classList.add('invalid-feedback');
        return false;
    }
}, 500);

// Check if an email already exists
const checkEmail = debounce(async (email, feedbackElement) => {
    if (!email || !isValidEmail(email)) {
        feedbackElement.innerHTML = '';
        feedbackElement.classList.remove('valid-feedback', 'invalid-feedback');
        return;
    }

    try {
        feedbackElement.innerHTML = '<span class="spinner"></span> Checking availability...';
        feedbackElement.classList.remove('valid-feedback', 'invalid-feedback');
        feedbackElement.classList.add('checking-feedback');

        const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
            if (data.exists) {
                feedbackElement.innerHTML = 'An account with this email already exists';
                feedbackElement.classList.remove('checking-feedback', 'valid-feedback');
                feedbackElement.classList.add('invalid-feedback');
                return false;
            } else {
                feedbackElement.innerHTML = 'Email is available';
                feedbackElement.classList.remove('checking-feedback', 'invalid-feedback');
                feedbackElement.classList.add('valid-feedback');
                return true;
            }
        } else {
            throw new Error(data.message || 'Error checking email');
        }
    } catch (error) {
        console.error('Error checking email:', error);
        feedbackElement.innerHTML = 'Unable to verify email at this time';
        feedbackElement.classList.remove('checking-feedback', 'valid-feedback');
        feedbackElement.classList.add('invalid-feedback');
        return false;
    }
}, 500);

// Update password requirements UI based on password content
function updatePasswordRequirements(password) {
    const requirements = document.querySelectorAll('.password-requirement');
    if (!requirements.length) return 0;
    
    // Define validation checks
    const checks = [
        { test: p => p.length >= 8, index: 0 },
        { test: p => /[A-Z]/.test(p), index: 1 },
        { test: p => /[a-z]/.test(p), index: 2 },
        { test: p => /[0-9]/.test(p), index: 3 },
        { test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p), index: 4 }
    ];
    
    // Track passed requirements
    let passedCount = 0;
    
    // Apply appropriate class based on whether requirement is met
    checks.forEach(check => {
        const req = requirements[check.index];
        if (!req) return;
        
        const passed = password && check.test(password);
        
        if (!password) {
            req.classList.remove('met', 'unmet');
        } else if (passed) {
            req.classList.add('met');
            req.classList.remove('unmet');
            passedCount++;
        } else {
            req.classList.add('unmet');
            req.classList.remove('met');
        }
    });
    
    console.log(`Password requirements passed: ${passedCount} out of 5`);
    
    // Return how many requirements are met
    return passedCount;
}

// Check password strength with visual feedback
function checkPasswordStrength(password, feedbackElement) {
    // Clear feedback if password is empty
    if (!password) {
        feedbackElement.innerHTML = '';
        feedbackElement.className = '';
        return;
    }

    // Define validation checks
    const checks = [
        { test: p => p.length >= 8, message: 'At least 8 characters long' },
        { test: p => /[A-Z]/.test(p), message: 'At least one uppercase letter' },
        { test: p => /[a-z]/.test(p), message: 'At least one lowercase letter' },
        { test: p => /[0-9]/.test(p), message: 'At least one number' },
        { test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p), message: 'At least one special character' }
    ];

    // Log which requirements are not met
    console.log('Password validation:');
    checks.forEach(check => {
        const passed = check.test(password);
        console.log(`- ${check.message}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    // Update requirements UI and get score
    const score = updatePasswordRequirements(password);
    
    // Determine strength level based on score
    let feedback = '';
    let strengthClass = '';
    if (score < 3) {
        feedback = 'Weak password';
        strengthClass = 'password-weak';
    } else if (score < 5) {
        feedback = 'Moderate password';
        strengthClass = 'password-moderate';
    } else {
        feedback = 'Strong password';
        strengthClass = 'password-strong';
    }
    
    // Update feedback element
    feedbackElement.innerHTML = feedback;
    feedbackElement.className = strengthClass;
    
    return score === 5; // Return true only if all requirements are met
}

// Show password requirements when password field is focused
function togglePasswordRequirements(passwordInput, show) {
    const requirementsEl = passwordInput.nextElementSibling;
    if (requirementsEl && requirementsEl.classList.contains('password-requirements')) {
        requirementsEl.style.display = show ? 'block' : 'none';
    }
}

// Initialize form validation
function initAuthValidation() {
    // Check for signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitButton = signupForm.querySelector('button[type="submit"]');
        
        // Create feedback elements if they don't exist
        let usernameFeedback = document.getElementById('username-feedback');
        if (!usernameFeedback) {
            usernameFeedback = document.createElement('div');
            usernameFeedback.id = 'username-feedback';
            usernameFeedback.className = 'validation-feedback';
            usernameInput.parentNode.appendChild(usernameFeedback);
        }
        
        let emailFeedback = document.getElementById('email-feedback');
        if (!emailFeedback) {
            emailFeedback = document.createElement('div');
            emailFeedback.id = 'email-feedback';
            emailFeedback.className = 'validation-feedback';
            emailInput.parentNode.appendChild(emailFeedback);
        }
        
        let passwordFeedback = document.getElementById('password-feedback');
        if (!passwordFeedback) {
            passwordFeedback = document.createElement('div');
            passwordFeedback.id = 'password-feedback';
            passwordFeedback.className = 'validation-feedback';
            passwordInput.parentNode.appendChild(passwordFeedback);
        }
        
        // Password requirements visibility
        passwordInput.addEventListener('focus', () => togglePasswordRequirements(passwordInput, true));
        passwordInput.addEventListener('blur', (e) => {
            // Only hide if the user is not actively clicking on the requirements
            setTimeout(() => {
                if (!e.relatedTarget || !e.relatedTarget.closest('.password-requirements')) {
                    togglePasswordRequirements(passwordInput, false);
                }
            }, 100);
        });
        
        // Initial setup
        updatePasswordRequirements(passwordInput.value);
        
        // Add event listeners
        usernameInput.addEventListener('input', (e) => {
            checkUsername(e.target.value.trim(), usernameFeedback);
        });
        
        emailInput.addEventListener('input', (e) => {
            checkEmail(e.target.value.trim(), emailFeedback);
        });
        
        passwordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value, passwordFeedback);
        });
        
        // Add form submission validation
        signupForm.addEventListener('submit', function(e) {
            console.log('Signup form intercepted - submitting directly');
            
            // Don't prevent default - let the form submit naturally
            // This is the most reliable approach
            return true;
        });
    }
    
    // Check for Google signup completion form
    const googleSignupForm = document.getElementById('google-signup-form');
    if (googleSignupForm) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const submitButton = googleSignupForm.querySelector('button[type="submit"]');
        
        // Create feedback elements
        let usernameFeedback = document.getElementById('username-feedback');
        if (!usernameFeedback) {
            usernameFeedback = document.createElement('div');
            usernameFeedback.id = 'username-feedback';
            usernameFeedback.className = 'validation-feedback';
            usernameInput.parentNode.appendChild(usernameFeedback);
        }
        
        let passwordFeedback = document.getElementById('password-feedback');
        if (!passwordFeedback) {
            passwordFeedback = document.createElement('div');
            passwordFeedback.id = 'password-feedback';
            passwordFeedback.className = 'validation-feedback';
            passwordInput.parentNode.appendChild(passwordFeedback);
        }
        
        // Password requirements visibility
        passwordInput.addEventListener('focus', () => togglePasswordRequirements(passwordInput, true));
        passwordInput.addEventListener('blur', (e) => {
            setTimeout(() => {
                if (!e.relatedTarget || !e.relatedTarget.closest('.password-requirements')) {
                    togglePasswordRequirements(passwordInput, false);
                }
            }, 100);
        });
        
        // Initial setup
        updatePasswordRequirements(passwordInput.value);
        
        // Add event listeners
        usernameInput.addEventListener('input', (e) => {
            checkUsername(e.target.value.trim(), usernameFeedback);
        });
        
        passwordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value, passwordFeedback);
        });
        
        // Add form submission validation
        googleSignupForm.addEventListener('submit', function(e) {
            console.log('Google signup form intercepted - submitting directly');
            
            // Don't prevent default - let the form submit naturally
            return true;
        });
    }
}

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuthValidation); 