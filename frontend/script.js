// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:8080/api/v1', // Backend server URL
    TWITTER_CLIENT_ID: 'TnlOMnVXcmNfdDA3dE1BSTlTeDQ6MTpjaQ',
    TWITTER_REDIRECT_URI: 'http://localhost:3000',
    TWITTER_SCOPE: 'tweet.read users.read follows.read offline.access',
    ENDPOINTS: {
        TWITTER_CALLBACK: '/twitter/callback',
        USER_PROFILE: '/user/profile'
    }
};

// DOM Elements
const connectBtnHeader = document.getElementById('connectTwitterBtn');
const connectBtnMain = document.getElementById('connectTwitterBtnMain');
const userInfoSection = document.getElementById('userInfo');
const userDetailsDiv = document.getElementById('userDetails');
const loadingState = document.getElementById('loadingState');

// State Management
let isAuthenticated = false;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('TwitterConnect App Initialized');
    
    // Check if user is returning from OAuth callback
    checkAuthCallback();
    
    // Check if user is already authenticated
    checkAuthStatus();
    
    // Bind event listeners
    bindEventListeners();
    
    // Add fade-in animation to main content
    document.querySelector('.main').classList.add('fade-in');
});

// Bind event listeners to buttons
function bindEventListeners() {
    // Header connect button
    if (connectBtnHeader) {
        connectBtnHeader.addEventListener('click', handleConnectTwitter);
    }
    
    // Main connect button
    if (connectBtnMain) {
        connectBtnMain.addEventListener('click', handleConnectTwitter);
    }
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.authenticated) {
            showUserInfo(event.state.user);
        } else {
            showLandingPage();
        }
    });
}

// Generate PKCE code challenge using plain method
function generateCodeChallenge() {
    // Generate a random code verifier (43-128 characters)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = btoa(String.fromCharCode.apply(null, array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    // For plain method, code_challenge = code_verifier
    return {
        codeVerifier: codeVerifier,
        codeChallenge: codeVerifier // Plain method uses the same value
    };
}

// Generate random state parameter
function generateState() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Handle Twitter OAuth2 connection
async function handleConnectTwitter(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        // Generate PKCE parameters
        const { codeVerifier, codeChallenge } = generateCodeChallenge();
        const state = generateState();
        
        // Store PKCE parameters for callback
        sessionStorage.setItem('oauth_initiated', 'true');
        sessionStorage.setItem('code_verifier', codeVerifier);
        sessionStorage.setItem('oauth_state', state);
        
        // Build Twitter OAuth URL
        const authUrl = new URL('https://x.com/i/oauth2/authorize');
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', CONFIG.TWITTER_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', CONFIG.TWITTER_REDIRECT_URI);
        authUrl.searchParams.set('scope', CONFIG.TWITTER_SCOPE);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'plain');
        
        console.log('Redirecting to Twitter OAuth:', authUrl.toString());
        
        // Redirect to Twitter OAuth2 page
        window.location.href = authUrl.toString();
        
    } catch (error) {
        console.error('Error initiating Twitter OAuth:', error);
        showError('Failed to connect to Twitter. Please try again.');
        showLoading(false);
    }
}

// Check if user is returning from OAuth callback
function checkAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
        console.error('OAuth error:', error);
        showError('Authentication failed. Please try again.');
        // Clean up URL and session storage
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.removeItem('oauth_initiated');
        sessionStorage.removeItem('code_verifier');
        sessionStorage.removeItem('oauth_state');
        return;
    }
    
    if (code && sessionStorage.getItem('oauth_initiated')) {
        // Verify state parameter
        const storedState = sessionStorage.getItem('oauth_state');
        if (state !== storedState) {
            console.error('State parameter mismatch');
            showError('Authentication failed: Invalid state parameter.');
            return;
        }
        
        console.log('OAuth callback detected, processing...');
        handleOAuthCallback(code);
    }
}

// Handle OAuth callback processing
async function handleOAuthCallback(code) {
    try {
        showLoading(true, 'Processing authentication...');
        
        // Get stored code verifier
        const codeVerifier = sessionStorage.getItem('code_verifier');
        if (!codeVerifier) {
            throw new Error('Code verifier not found');
        }
        
        // Send authorization code to backend for token exchange
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.TWITTER_CALLBACK}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                code: code, 
                code_verifier: codeVerifier 
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Authentication failed: ${errorData.message || response.status}`);
        }
        
        const data = await response.json();
        console.log('Callback response:', data);
        
        if (data.message === 'success' && data.user_id) {
            // Authentication successful, now fetch user profile
            await fetchAndShowUserProfile(data.user_id);
            
            // Clean up URL and session storage
            window.history.replaceState(
                { authenticated: true, user_id: data.user_id }, 
                document.title, 
                window.location.pathname
            );
            
            showSuccess('Successfully connected to Twitter!');
            
        } else {
            throw new Error(data.message || 'Authentication failed');
        }
        
    } catch (error) {
        console.error('Error processing OAuth callback:', error);
        showError(`Authentication failed: ${error.message}`);
        
        // Clean up on error
        window.history.replaceState({}, document.title, window.location.pathname);
        
    } finally {
        // Clean up session storage
        sessionStorage.removeItem('oauth_initiated');
        sessionStorage.removeItem('code_verifier');
        sessionStorage.removeItem('oauth_state');
        showLoading(false);
    }
}

// Fetch and display user profile
async function fetchAndShowUserProfile(userId) {
    try {
        showLoading(true, 'Fetching user profile...');
        
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USER_PROFILE}/${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch profile: ${errorData.message || response.status}`);
        }
        
        const data = await response.json();
        console.log('User profile response:', data);
        
        if (data.data) {
            currentUser = { ...data.data, user_id: userId };
            isAuthenticated = true;
            showUserInfo(currentUser);
        } else {
            throw new Error('No user data received');
        }
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        showError(`Failed to fetch user profile: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Check current authentication status (simplified for this implementation)
async function checkAuthStatus() {
    // For this implementation, we'll rely on URL state or session storage
    // since we don't have a session-based backend endpoint
    console.log('Checking authentication status...');
}

// Show user information after successful authentication
function showUserInfo(user) {
    if (!user) return;
    
    // Hide loading state
    showLoading(false);
    
    // Update UI to show user info
    userDetailsDiv.innerHTML = `
        <div class="user-detail-item">
            <div class="user-avatar-placeholder" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #1da1f2, #0d8bd9); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">
                ${(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
                <h3>${user.name || 'Twitter User'}</h3>
                <p><strong>Username:</strong> @${user.username || 'N/A'}</p>
                <p><strong>Twitter ID:</strong> ${user.twitter_id || user.user_id || 'N/A'}</p>
                <p><strong>Connected:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
        <div class="user-actions" style="margin-top: 1rem; text-align: center;">
            <button onclick="handleDisconnect()" class="connect-btn" style="background: #dc2626;">
                Disconnect Twitter
            </button>
        </div>
    `;
    
    // Show user info section
    userInfoSection.style.display = 'block';
    userInfoSection.classList.add('fade-in');
    
    // Update connect buttons to show connected state
    updateConnectButtons(true);
    
    // Scroll to user info
    userInfoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show landing page (hide user info)
function showLandingPage() {
    userInfoSection.style.display = 'none';
    updateConnectButtons(false);
    isAuthenticated = false;
    currentUser = null;
}

// Update connect button states
function updateConnectButtons(connected) {
    const buttons = [connectBtnHeader, connectBtnMain];
    
    buttons.forEach(btn => {
        if (btn) {
            if (connected) {
                btn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Connected
                `;
                btn.style.background = '#16a34a';
                btn.disabled = true;
            } else {
                btn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Connect Twitter
                `;
                btn.style.background = '#1da1f2';
                btn.disabled = false;
            }
        }
    });
}

// Handle disconnect (simplified logout for this implementation)
function handleDisconnect() {
    // Reset UI state
    showLandingPage();
    showSuccess('Successfully disconnected from Twitter.');
    
    // Clear any remaining session data
    sessionStorage.clear();
    
    console.log('User disconnected');
}

// Show loading state
function showLoading(show, message = 'Connecting to Twitter...') {
    if (show) {
        loadingState.querySelector('p').textContent = message;
        loadingState.style.display = 'block';
        loadingState.classList.add('fade-in');
    } else {
        loadingState.style.display = 'none';
    }
}

// Show success message
function showSuccess(message) {
    showMessage(message, 'success');
}

// Show error message
function showError(message) {
    showMessage(message, 'error');
}

// Show message (success or error)
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert after header
    const header = document.querySelector('.header');
    header.insertAdjacentElement('afterend', messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Utility function to handle fetch errors
function handleFetchError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Unable to connect to server. Please make sure the backend is running.';
    }
    return error.message || 'An unexpected error occurred.';
}

// Export functions for global access (for onclick handlers)
window.handleDisconnect = handleDisconnect;
