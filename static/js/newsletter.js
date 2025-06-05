import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Get Supabase configuration from window object (set by Flask template)
const supabaseUrl = window.SUPABASE_URL;
const supabaseKey = window.SUPABASE_ANON_KEY;

// Utility function for email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Initialize Supabase client
let supabase = null;
try {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase configuration');
    }
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (err) {
    console.error('Failed to initialize Supabase client:', err);
}

// Newsletter subscription handling
const initNewsletterSubscription = () => {
    const form = document.querySelector('.footer-subscribe-form');
    const input = document.querySelector('.footer-form-input');
    
    if (!form || !input) {
        console.error('Newsletter form elements not found');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('.footer-subscribe-button');
        if (!submitButton) return;

        const originalButtonText = submitButton.innerHTML;
        const email = input.value.trim();

        // Client-side validation
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Disable form while submitting
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        submitButton.disabled = true;
        input.disabled = true;

        try {
            if (!supabase) {
                throw new Error('Newsletter service is not properly configured');
            }

            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email }]);

            if (error) {
                console.error('Newsletter subscription error:', error);
                
                switch (error.code) {
                    case '23505': // unique_violation
                        alert('This email is already subscribed to our newsletter.');
                        break;
                    case '42501': // insufficient_privilege
                        alert('Subscription service temporarily unavailable. Please try again later.');
                        console.error('RLS policy error - check permissions');
                        break;
                    case '42P01': // undefined_table
                        alert('Subscription service not available. Please try again later.');
                        console.error('Table not found - run setup SQL');
                        break;
                    default:
                        alert('Unable to process subscription. Please try again later.');
                        console.error('Unknown error:', error);
                }
            } else {
                alert('Thanks for subscribing to our newsletter!');
                form.reset();
            }
        } catch (err) {
            console.error('Subscription error:', err);
            alert('Unable to process your subscription. Please try again later.');
        } finally {
            // Re-enable form
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            input.disabled = false;
        }
    });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initNewsletterSubscription);