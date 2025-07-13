class RefReadyAuth {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.demoMode = false;
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkStoredAuth();
        
        // Set up demo clubs for testing
        this.setupDemoClubs();
        
        console.log('🔐 RefReady Auth System Initialized');
    }

    // Check for stored authentication
    checkStoredAuth() {
        const storedAuth = localStorage.getItem('refready-club-auth');
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth);
                if (authData.expires && new Date(authData.expires) > new Date()) {
                    this.isLoggedIn = true;
                    this.currentUser = authData.user;
                    this.demoMode = authData.demoMode || false;
                    
                    // Redirect to dashboard if we're on login page
                    if (window.location.pathname.includes('login.html')) {
                        this.redirectToDashboard();
                    }
                }
            } catch (error) {
                console.error('Error parsing stored auth:', error);
                this.clearAuth();
            }
        }
    }

    // Set up demo clubs for testing
    setupDemoClubs() {
        this.demoClubs = [
            {
                id: 'club-adelaide-netball-001',
                name: 'Adelaide Netball Association',
                email: 'admin@adelaidenetball.com',
                password: 'demo123',
                subscription: 'active',
                subscriptionExpiry: '2024-12-31'
            },
            {
                id: 'club-demo-001',
                name: 'Demo Netball Club',
                email: 'demo@refready.com',
                password: 'demo123',
                subscription: 'trial',
                subscriptionExpiry: '2024-02-15'
            }
        ];
    }

    // Login method
    async login(email, password, remember = false) {
        console.log('🔐 Attempting login for:', email);
        
        // Show loading state
        this.showLoading(true);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check demo credentials
            const demoClub = this.demoClubs.find(club => 
                club.email === email && club.password === password
            );
            
            if (demoClub) {
                // Demo login successful
                this.setAuthentication(demoClub, remember, false);
                this.showNotification('Login successful! Redirecting to dashboard...', 'success');
                setTimeout(() => this.redirectToDashboard(), 1500);
            } else {
                // In production, this would make an API call
                // For now, we'll simulate a failed login
                throw new Error('Invalid credentials');
            }
            
        } catch (error) {
            console.error('Login failed:', error);
            this.showNotification('Login failed. Please check your credentials.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Demo login method
    loginDemo() {
        console.log('🎯 Demo login initiated');
        
        const demoClub = this.demoClubs[0]; // Use first demo club
        this.setAuthentication(demoClub, false, true);
        this.showNotification('Demo access granted! Exploring dashboard...', 'success');
        setTimeout(() => this.redirectToDashboard(), 1500);
    }

    // Set authentication data
    setAuthentication(clubData, remember, demoMode = false) {
        this.isLoggedIn = true;
        this.currentUser = {
            id: clubData.id,
            name: clubData.name,
            email: clubData.email,
            subscription: clubData.subscription,
            subscriptionExpiry: clubData.subscriptionExpiry
        };
        this.demoMode = demoMode;
        
        // Store authentication
        const authData = {
            user: this.currentUser,
            demoMode: demoMode,
            expires: remember ? 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days
                new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
        };
        
        localStorage.setItem('refready-club-auth', JSON.stringify(authData));
        
        console.log('✅ Authentication set for:', this.currentUser.name);
    }

    // Logout method
    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.demoMode = false;
        this.clearAuth();
        
        // Redirect to login page
        window.location.href = 'login.html';
        
        console.log('👋 User logged out');
    }

    // Clear authentication
    clearAuth() {
        localStorage.removeItem('refready-club-auth');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.isLoggedIn;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if in demo mode
    isDemoMode() {
        return this.demoMode;
    }

    // Redirect to dashboard
    redirectToDashboard() {
        window.location.href = 'overview.html';
    }

    // Forgot password method
    async forgotPassword(email) {
        console.log('🔑 Password reset requested for:', email);
        
        // Show loading
        const submitBtn = document.querySelector('#forgot-form button');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Check if email exists in demo clubs
            const clubExists = this.demoClubs.some(club => club.email === email);
            
            if (clubExists || email === 'demo@refready.com') {
                this.showNotification('Password reset instructions sent to your email!', 'success');
                this.closeModal('forgot-modal');
            } else {
                this.showNotification('Email not found. Please check your club email address.', 'error');
            }
            
        } catch (error) {
            console.error('Password reset failed:', error);
            this.showNotification('Failed to send reset email. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Show loading state
    showLoading(show) {
        const btn = document.querySelector('.login-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        
        if (show) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            btn.disabled = true;
            btn.classList.add('loading');
        } else {
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.auth-notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Get notification icon
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Session management
    refreshSession() {
        if (this.isLoggedIn && this.currentUser) {
            // Extend session
            const authData = {
                user: this.currentUser,
                demoMode: this.demoMode,
                expires: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
            };
            localStorage.setItem('refready-club-auth', JSON.stringify(authData));
        }
    }

    // Check session expiry
    checkSessionExpiry() {
        const storedAuth = localStorage.getItem('refready-club-auth');
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth);
                if (authData.expires && new Date(authData.expires) <= new Date()) {
                    this.logout();
                }
            } catch (error) {
                console.error('Session check failed:', error);
                this.logout();
            }
        }
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Auto-refresh session every 30 minutes
    setInterval(() => {
        if (window.refreadyAuth) {
            window.refreadyAuth.checkSessionExpiry();
        }
    }, 30 * 60 * 1000);
});

// Make auth system globally available
window.RefReadyAuth = RefReadyAuth; 