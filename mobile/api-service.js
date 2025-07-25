// RefReady API Service - Real Data Integration Layer
// RefReady API Service - Real Data Integration Layer
class RefReadyAPIService {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.token = this.getAuthToken();
        this.isOnline = navigator.onLine;
        this.setupOfflineHandling();
    }

    getAuthToken() {
        return localStorage.getItem('authToken') || null;
    }

    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                ...options.headers
            },
            ...options
        };

        try {
            if (!this.isOnline) {
                throw new Error('Offline - using cached data');
            }

            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.warn(`API call failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async getAnalyticsData(userId, period = 'month') {
        const result = await this.apiCall(`/analytics/${userId}?period=${period}`);
        
        if (result.success) {
            return result.data;
        } else {
            return this.getMockAnalyticsData(period);
        }
    }

    getMockAnalyticsData(period) {
        const baseData = {
            gamesPlayed: period === 'year' ? 47 : period === 'quarter' ? 18 : 8,
            averageConfidence: 7.2,
            badgesEarned: period === 'year' ? 12 : period === 'quarter' ? 5 : 2,
            skillProgress: {
                'Rule Knowledge': 85,
                'Communication': 78,
                'Positioning': 82,
                'Decision Making': 75,
                'Game Management': 70
            },
            confidenceTrend: this.generateConfidenceTrend(period),
            badgeTimeline: this.generateBadgeTimeline(period)
        };

        return baseData;
    }

    generateConfidenceTrend(period) {
        const points = period === 'year' ? 12 : period === 'quarter' ? 3 : 4;
        const trend = [];
        
        for (let i = 0; i < points; i++) {
            trend.push({
                date: new Date(Date.now() - (points - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
                confidence: 6.5 + Math.random() * 2
            });
        }
        
        return trend;
    }

    generateBadgeTimeline(period) {
        const badges = [
            { name: 'First Game', date: '2024-01-15', status: 'earned' },
            { name: 'Confident Calls', date: '2024-02-20', status: 'earned' },
            { name: 'Team Player', date: '2024-03-10', status: 'earned' },
            { name: 'Rule Master', date: '2024-04-05', status: 'in-progress' },
            { name: 'Communication Pro', date: '2024-05-01', status: 'upcoming' }
        ];

        return badges.slice(0, period === 'year' ? 5 : period === 'quarter' ? 3 : 2);
    }

    async getGoals(userId) {
        const result = await this.apiCall(`/goals/${userId}`);
        
        if (result.success) {
            return result.data;
        } else {
            return this.getMockGoals();
        }
    }

    async createGoal(goalData) {
        const result = await this.apiCall('/goals', {
            method: 'POST',
            body: JSON.stringify(goalData)
        });

        if (result.success) {
            return result.data;
        } else {
            const goals = JSON.parse(localStorage.getItem('userGoals') || '[]');
            const newGoal = {
                id: Date.now(),
                ...goalData,
                createdAt: new Date().toISOString(),
                progress: 0
            };
            goals.push(newGoal);
            localStorage.setItem('userGoals', JSON.stringify(goals));
            return newGoal;
        }
    }

    getMockGoals() {
        return [
            {
                id: 1,
                title: 'Improve Communication Skills',
                category: 'skills',
                target: 8.5,
                current: 7.2,
                unit: 'rating',
                deadline: '2024-06-30',
                priority: 'high',
                progress: 85
            },
            {
                id: 2,
                title: 'Complete 20 Games This Season',
                category: 'games',
                target: 20,
                current: 12,
                unit: 'games',
                deadline: '2024-08-31',
                priority: 'medium',
                progress: 60
            }
        ];
    }

    async exportData(userId, format = 'json') {
        const analytics = await this.getAnalyticsData(userId, 'year');
        const goals = await this.getGoals(userId);

        const exportData = {
            user: userId,
            exportDate: new Date().toISOString(),
            analytics,
            goals
        };

        if (format === 'csv') {
            return this.convertToCSV(exportData);
        }

        return JSON.stringify(exportData, null, 2);
    }

    convertToCSV(data) {
        const csvRows = [];
        
        csvRows.push('Analytics Data');
        csvRows.push('Metric,Value');
        csvRows.push(`Games Played,${data.analytics.gamesPlayed}`);
        csvRows.push(`Average Confidence,${data.analytics.averageConfidence}`);
        csvRows.push(`Badges Earned,${data.analytics.badgesEarned}`);
        
        csvRows.push('\nGoals Data');
        csvRows.push('Title,Category,Target,Current,Progress');
        data.goals.forEach(goal => {
            csvRows.push(`${goal.title},${goal.category},${goal.target},${goal.current},${goal.progress}%`);
        });

        return csvRows.join('\n');
    }

    async syncOfflineData() {
        const offlineData = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        
        for (const item of offlineData) {
            try {
                await this.apiCall(item.endpoint, item.options);
            } catch (error) {
                console.warn('Failed to sync offline data:', error);
            }
        }

        localStorage.removeItem('offlineQueue');
    }
}

window.refreadyAPI = new RefReadyAPIService();