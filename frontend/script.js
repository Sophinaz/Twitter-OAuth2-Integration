// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000', // Backend server URL
    ENDPOINTS: {
        AUTH_URL: '/auth/twitter',
        USER_INFO: '/auth/user',
        LOGOUT: '/auth/logout'
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

// Handle Twitter OAuth2 connection
async function handleConnectTwitter(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        // Get OAuth2 authorization URL from backend
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH_URL}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for session management
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.authUrl) {
            // Store current state for return
            sessionStorage.setItem('oauth_initiated', 'true');
            
            // Redirect to Twitter OAuth2 page
            window.location.href = data.authUrl;
        } else {
            throw new Error('No authorization URL received from server');
        }
        
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
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    
    if (code && sessionStorage.getItem('oauth_initiated')) {
        console.log('OAuth callback detected, processing...');
        handleOAuthCallback(code, state);
    }
}

// Handle OAuth callback processing
async function handleOAuthCallback(code, state) {
    try {
        showLoading(true, 'Processing authentication...');
        
        // Send authorization code to backend for token exchange
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH_URL}/callback`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, state })
        });
        
        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
            // Authentication successful
            currentUser = data.user;
            isAuthenticated = true;
            
            // Clean up URL and session storage
            window.history.replaceState(
                { authenticated: true, user: data.user }, 
                document.title, 
                window.location.pathname
            );
            sessionStorage.removeItem('oauth_initiated');
            
            // Show user information
            showUserInfo(data.user);
            showSuccess('Successfully connected to Twitter!');
            
        } else {
            throw new Error(data.message || 'Authentication failed');
        }
        
    } catch (error) {
        console.error('Error processing OAuth callback:', error);
        showError('Authentication failed. Please try again.');
        
        // Clean up on error
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.removeItem('oauth_initiated');
        
    } finally {
        showLoading(false);
    }
}

// Check current authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USER_INFO}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.user) {
                currentUser = data.user;
                isAuthenticated = true;
                showUserInfo(data.user);
            }
        }
    } catch (error) {
        console.log('No existing authentication found');
        // This is expected for new users, so we don't show an error
    }
}

// Show user information after successful authentication
function showUserInfo(user) {
    if (!user) return;
    
    // Hide loading state
    showLoading(false);
    
    // Update UI to show user info
    userDetailsDiv.innerHTML = `
        <div class="user-detail-item">
            <img src="${user.profile_image_url || '/default-avatar.png'}" alt="Profile" class="user-avatar">
            <div>
                <h3>${user.name || 'Twitter User'}</h3>
                <p><strong>Username:</strong> @${user.username || 'N/A'}</p>
                <p><strong>Followers:</strong> ${user.public_metrics?.followers_count || 'N/A'}</p>
                <p><strong>Following:</strong> ${user.public_metrics?.following_count || 'N/A'}</p>
                <p><strong>Tweets:</strong> ${user.public_metrics?.tweet_count || 'N/A'}</p>
            </div>
        </div>
        <div class="user-actions" style="margin-top: 1rem; text-align: center;">
            <button onclick="handleLogout()" class="connect-btn" style="background: #dc2626;">
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

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        // Reset UI regardless of response
        showLandingPage();
        showSuccess('Successfully disconnected from Twitter.');
        
    } catch (error) {
        console.error('Logout error:', error);
        // Still reset UI even if logout request fails
        showLandingPage();
    }
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
window.handleLogout = handleLogout;
