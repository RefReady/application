// RefReady Notification Service - Push Notifications & Management
class RefReadyNotificationService {
    constructor() {
        this.isSupported = 'Notification' in window;
        this.permission = this.isSupported ? Notification.permission : 'denied';
        this.serviceWorkerRegistration = null;
        this.notificationQueue = [];
        this.settings = this.loadSettings();
        this.init();
    }

    async init() {
        if (this.isSupported) {
            await this.registerServiceWorker();
            this.setupEventHandlers();
        }
    }

    async requestPermission() {
        if (!this.isSupported) {
            console.warn('Notifications not supported');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        try {
            this.permission = await Notification.requestPermission();
            return this.permission === 'granted';
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    loadSettings() {
        const defaultSettings = {
            gameReminders: true,
            feedbackAlerts: true,
            badgeNotifications: true,
            mentorMessages: true,
            systemUpdates: true,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            },
            sound: true,
            vibration: true
        };

        const saved = localStorage.getItem('notificationSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
        
        if (window.refreadyAPI) {
            window.refreadyAPI.updateNotificationSettings(this.settings);
        }
    }

    async showNotification(title, options = {}) {
        if (!await this.requestPermission()) {
            console.warn('Notification permission denied');
            return false;
        }

        const notificationType = options.type || 'system';
        if (!this.isNotificationTypeEnabled(notificationType)) {
            return false;
        }

        if (this.isQuietHours()) {
            this.queueNotification(title, options);
            return false;
        }

        const notificationOptions = {
            body: options.message || '',
            icon: options.icon || '/icons/refready-192.png',
            badge: '/icons/refready-badge.png',
            tag: options.tag || notificationType,
            requireInteraction: options.requireInteraction || false,
            silent: !this.settings.sound,
            vibrate: this.settings.vibration ? [200, 100, 200] : [],
            data: {
                type: notificationType,
                url: options.url || '/',
                timestamp: Date.now(),
                ...options.data
            },
            actions: options.actions || []
        };

        try {
            if (this.serviceWorkerRegistration) {
                await this.serviceWorkerRegistration.showNotification(title, notificationOptions);
            } else {
                new Notification(title, notificationOptions);
            }

            this.storeNotificationHistory(title, options);
            return true;
        } catch (error) {
            console.error('Failed to show notification:', error);
            return false;
        }
    }

    async showGameReminder(gameData) {
        if (!this.settings.gameReminders) return false;

        const timeUntil = this.getTimeUntilGame(gameData.dateTime);
        return await this.showNotification(
            'Game Reminder',
            {
                message: `${gameData.teams.join(' vs ')} in ${timeUntil}`,
                type: 'game_reminder',
                icon: '/icons/game-reminder.png',
                tag: `game_${gameData.id}`,
                requireInteraction: true,
                actions: [
                    { action: 'view', title: 'View Details' },
                    { action: 'checklist', title: 'Open Checklist' }
                ],
                data: { gameId: gameData.id }
            }
        );
    }

    async showFeedbackAlert(feedbackData) {
        if (!this.settings.feedbackAlerts) return false;

        return await this.showNotification(
            'New Feedback Available',
            {
                message: `${feedbackData.mentorName} left feedback on your performance`,
                type: 'feedback',
                icon: '/icons/feedback.png',
                tag: `feedback_${feedbackData.id}`,
                actions: [
                    { action: 'view', title: 'View Feedback' },
                    { action: 'dismiss', title: 'Later' }
                ],
                data: { feedbackId: feedbackData.id }
            }
        );
    }

    async showBadgeNotification(badgeData) {
        if (!this.settings.badgeNotifications) return false;

        return await this.showNotification(
            'Badge Earned! 🎖️',
            {
                message: `Congratulations! You've earned the "${badgeData.name}" badge`,
                type: 'badge',
                icon: badgeData.iconUrl || '/icons/badge.png',
                tag: `badge_${badgeData.id}`,
                requireInteraction: true,
                actions: [
                    { action: 'view', title: 'View Badge' },
                    { action: 'share', title: 'Share Achievement' }
                ],
                data: { badgeId: badgeData.id }
            }
        );
    }

    async showMentorMessage(messageData) {
        if (!this.settings.mentorMessages) return false;

        return await this.showNotification(
            `Message from ${messageData.mentorName}`,
            {
                message: messageData.preview,
                type: 'mentor_message',
                icon: messageData.mentorAvatar || '/icons/mentor.png',
                tag: `mentor_${messageData.id}`,
                actions: [
                    { action: 'reply', title: 'Reply' },
                    { action: 'view', title: 'View' }
                ],
                data: { messageId: messageData.id }
            }
        );
    }

    async showSafetyAlert(alertData) {
        return await this.showNotification(
            '⚠️ Safety Alert',
            {
                message: alertData.message,
                type: 'safety',
                icon: '/icons/safety-alert.png',
                tag: 'safety_alert',
                requireInteraction: true,
                actions: [
                    { action: 'acknowledge', title: 'Acknowledge' },
                    { action: 'call', title: 'Call for Help' }
                ],
                data: { alertId: alertData.id, priority: 'high' }
            }
        );
    }

    isNotificationTypeEnabled(type) {
        const typeMap = {
            'game_reminder': 'gameReminders',
            'feedback': 'feedbackAlerts',
            'badge': 'badgeNotifications',
            'mentor_message': 'mentorMessages',
            'system': 'systemUpdates',
            'safety': true
        };

        return typeMap[type] === true || this.settings[typeMap[type]];
    }

    isQuietHours() {
        if (!this.settings.quietHours.enabled) return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number);
        const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number);
        
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        if (startTime < endTime) {
            return currentTime >= startTime && currentTime <= endTime;
        } else {
            return currentTime >= startTime || currentTime <= endTime;
        }
    }

    queueNotification(title, options) {
        this.notificationQueue.push({ title, options, timestamp: Date.now() });
        localStorage.setItem('notificationQueue', JSON.stringify(this.notificationQueue));
    }

    async processQueuedNotifications() {
        if (this.notificationQueue.length === 0) return;

        for (const notification of this.notificationQueue) {
            await this.showNotification(notification.title, notification.options);
        }

        this.notificationQueue = [];
        localStorage.removeItem('notificationQueue');
    }

    getTimeUntilGame(gameDateTime) {
        const now = new Date();
        const gameTime = new Date(gameDateTime);
        const diff = gameTime - now;

        if (diff < 0) return 'now';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    storeNotificationHistory(title, options) {
        const history = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
        history.unshift({
            title,
            message: options.message || '',
            type: options.type || 'system',
            timestamp: Date.now(),
            read: false
        });

        if (history.length > 100) {
            history.splice(100);
        }

        localStorage.setItem('notificationHistory', JSON.stringify(history));
    }

    getNotificationHistory() {
        return JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    }

    markNotificationRead(index) {
        const history = this.getNotificationHistory();
        if (history[index]) {
            history[index].read = true;
            localStorage.setItem('notificationHistory', JSON.stringify(history));
        }
    }

    clearNotificationHistory() {
        localStorage.removeItem('notificationHistory');
    }

    setupEventHandlers() {
        if (this.serviceWorkerRegistration) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'notification-click') {
                    this.handleNotificationClick(event.data);
                }
            });
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.isQuietHours()) {
                this.processQueuedNotifications();
            }
        });

        setInterval(() => {
            if (!this.isQuietHours()) {
                this.processQueuedNotifications();
            }
        }, 60000);
    }

    handleNotificationClick(data) {
        switch (data.action) {
            case 'view':
                if (data.gameId) {
                    window.location.hash = `#game/${data.gameId}`;
                } else if (data.feedbackId) {
                    window.location.hash = `#feedback/${data.feedbackId}`;
                }
                break;
            case 'checklist':
                if (data.gameId) {
                    window.refreadyApp?.showGameChecklist(data.gameId);
                }
                break;
            default:
                window.focus();
        }
    }

    getUnreadCount() {
        const history = this.getNotificationHistory();
        return history.filter(n => !n.read).length;
    }
}

window.refreadyNotifications = new RefReadyNotificationService();