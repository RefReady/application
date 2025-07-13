// Dashboard Authentication and Utilities
import { authFunctions, dbFunctions, utils } from '../firebase-config.js';

// Dashboard State Management
class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.currentClub = null;
        this.userRole = null;
        this.initialized = false;
    }

    // Initialize dashboard - call this on every dashboard page
    async init() {
        if (this.initialized) return;

        try {
            // Check authentication state
            await this.checkAuth();
            
            // Load user and club data
            await this.loadUserData();
            
            // Set up UI
            this.setupUI();
            
            // Set up real-time listeners
            this.setupListeners();
            
            this.initialized = true;
            console.log('Dashboard initialized successfully');
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.redirectToLogin();
        }
    }

    // Check if user is authenticated
    async checkAuth() {
        return new Promise((resolve, reject) => {
            const unsubscribe = authFunctions.onAuthStateChanged(async (user) => {
                unsubscribe(); // Stop listening after first check
                
                if (!user) {
                    reject(new Error('Not authenticated'));
                    return;
                }
                
                this.currentUser = user;
                resolve(user);
            });
        });
    }

    // Load current user and club data
    async loadUserData() {
        if (!this.currentUser) {
            throw new Error('No authenticated user');
        }

        try {
            // Get user data from Firestore
            const userResult = await dbFunctions.getUser(this.currentUser.uid);
            if (!userResult.success) {
                throw new Error('User profile not found');
            }

            const userData = userResult.user;
            this.userRole = userData.role;

                    // Check if user has dashboard access
        if (!['admin', 'coordinator'].includes(this.userRole)) {
            // Redirect non-admin users to mobile app
            window.location.href = '../mobile/index.html';
            return;
        }

            // Get club data
            if (userData.clubId) {
                const clubResult = await dbFunctions.getClub(userData.clubId);
                if (clubResult.success) {
                    this.currentClub = clubResult.club;
                }
            }

            console.log('User data loaded:', { user: userData, club: this.currentClub });
        } catch (error) {
            console.error('Error loading user data:', error);
            throw error;
        }
    }

    // Set up dashboard UI elements
    setupUI() {
        try {
            // Update club name in header
            const clubNameElements = document.querySelectorAll('#club-name, .club-name');
            clubNameElements.forEach(element => {
                if (this.currentClub) {
                    element.textContent = this.currentClub.name;
                } else {
                    element.textContent = this.currentUser.displayName || 'Dashboard';
                }
            });

            // Update user info
            const userNameElements = document.querySelectorAll('.user-name');
            userNameElements.forEach(element => {
                element.textContent = this.currentUser.displayName || this.currentUser.email;
            });

            const userRoleElements = document.querySelectorAll('.user-role, #club-role');
            userRoleElements.forEach(element => {
                element.textContent = this.getRoleDisplayName(this.userRole);
            });

            // Show/hide features based on role
            this.setupRoleBasedUI();

        } catch (error) {
            console.error('Error setting up UI:', error);
        }
    }

    // Set up role-based UI visibility
    setupRoleBasedUI() {
        const userRole = this.userRole;
        
        // Define role permissions
        const permissions = {
            admin: ['view_all', 'edit_all', 'delete_all', 'user_management', 'settings'],
            coordinator: ['view_all', 'edit_limited', 'user_invite', 'safety_manage'],
            mentor: ['view_limited', 'edit_own'],
            referee: ['view_own']
        };

        const userPermissions = permissions[userRole] || [];

        // Hide/show elements based on permissions
        document.querySelectorAll('[data-require-permission]').forEach(element => {
            const requiredPermission = element.getAttribute('data-require-permission');
            if (!userPermissions.includes(requiredPermission)) {
                element.style.display = 'none';
            }
        });
    }

    // Set up real-time listeners for data updates
    setupListeners() {
        if (!this.currentClub?.id) return;

        try {
            // Listen for club user updates
            this.unsubscribeUsers = dbFunctions.listenToClubUsers(this.currentClub.id, (users) => {
                this.handleUsersUpdate(users);
            });

            // Listen for safety alerts
            this.unsubscribeAlerts = dbFunctions.listenToSafetyAlerts(this.currentClub.id, (alerts) => {
                this.handleAlertsUpdate(alerts);
            });

        } catch (error) {
            console.error('Error setting up listeners:', error);
        }
    }

    // Handle real-time user updates
    handleUsersUpdate(users) {
        console.log('Users updated:', users);
        
        // Update referees count
        const referees = users.filter(user => user.role === 'referee');
        const refereesCountElements = document.querySelectorAll('#total-referees, .referees-count');
        refereesCountElements.forEach(element => {
            element.textContent = referees.length;
        });

        // Update mentors count
        const mentors = users.filter(user => user.role === 'mentor');
        const mentorsCountElements = document.querySelectorAll('#total-mentors, .mentors-count');
        mentorsCountElements.forEach(element => {
            element.textContent = mentors.length;
        });

        // Update active users count
        const activeUsers = users.filter(user => user.isActive);
        const activeCountElements = document.querySelectorAll('#active-referees, #active-mentors');
        activeCountElements.forEach(element => {
            element.textContent = activeUsers.length;
        });

        // Trigger custom event for page-specific updates
        document.dispatchEvent(new CustomEvent('usersUpdated', { detail: users }));
    }

    // Handle real-time safety alerts updates
    handleAlertsUpdate(alerts) {
        console.log('Safety alerts updated:', alerts);
        
        // Update alert counts
        const activeAlerts = alerts.filter(alert => alert.status === 'active');
        const alertCountElements = document.querySelectorAll('.alerts-count, .safety-alerts-count');
        alertCountElements.forEach(element => {
            element.textContent = activeAlerts.length;
        });

        // Show notification for new critical alerts
        const criticalAlerts = activeAlerts.filter(alert => alert.priority === 'high');
        if (criticalAlerts.length > 0) {
            this.showNotification(`${criticalAlerts.length} critical safety alert(s) require attention`, 'warning');
        }

        // Trigger custom event for page-specific updates
        document.dispatchEvent(new CustomEvent('alertsUpdated', { detail: alerts }));
    }

    // Get display name for role
    getRoleDisplayName(role) {
        const roleNames = {
            admin: 'Administrator',
            coordinator: 'Club Coordinator',
            mentor: 'Mentor',
            referee: 'Referee'
        };
        return roleNames[role] || role;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.dashboard-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification with animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Logout function
    async logout() {
        try {
            // Clean up listeners
            if (this.unsubscribeUsers) this.unsubscribeUsers();
            if (this.unsubscribeAlerts) this.unsubscribeAlerts();

            // Sign out from Firebase
            await authFunctions.signOut();
            
            // Clear local data
            this.currentUser = null;
            this.currentClub = null;
            this.userRole = null;
            this.initialized = false;

            // Redirect to login
            this.redirectToLogin();
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error during logout', 'error');
        }
    }

    // Redirect to login page
    redirectToLogin() {
        window.location.href = 'login.html';
    }

    // Get current user data
    getCurrentUser() {
        return {
            user: this.currentUser,
            club: this.currentClub,
            role: this.userRole
        };
    }

    // Check if user has specific permission
    hasPermission(permission) {
        const rolePermissions = {
            admin: ['view_all', 'edit_all', 'delete_all', 'user_management', 'settings'],
            coordinator: ['view_all', 'edit_limited', 'user_invite', 'safety_manage'],
            mentor: ['view_limited', 'edit_own'],
            referee: ['view_own']
        };

        return rolePermissions[this.userRole]?.includes(permission) || false;
    }

    // Format timestamp for display
    formatTimestamp(timestamp) {
        return utils.formatTimestamp(timestamp);
    }

    // Clean up on page unload
    cleanup() {
        if (this.unsubscribeUsers) this.unsubscribeUsers();
        if (this.unsubscribeAlerts) this.unsubscribeAlerts();
    }
}

// Create global dashboard instance
const dashboard = new DashboardManager();

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    dashboard.init().catch(error => {
        console.error('Dashboard initialization failed:', error);
        dashboard.redirectToLogin();
    });
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    dashboard.cleanup();
});

// Global functions for dashboard pages
window.initializeDashboard = () => dashboard.init();
window.logout = () => dashboard.logout();
window.showNotification = (message, type) => dashboard.showNotification(message, type);
window.getDashboardData = () => dashboard.getCurrentUser();
window.hasPermission = (permission) => dashboard.hasPermission(permission);
window.formatTimestamp = (timestamp) => dashboard.formatTimestamp(timestamp);

// Export for module use
export { dashboard, DashboardManager }; 