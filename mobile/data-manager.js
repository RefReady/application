// RefReady Data Manager - Local Storage & Caching
class RefReadyDataManager {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.defaultCacheTime = 5 * 60 * 1000; // 5 minutes
        this.setupPeriodicCleanup();
    }

    set(key, data, expiryTime = this.defaultCacheTime) {
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + expiryTime);
        
        const cacheData = {
            data,
            expiry: Date.now() + expiryTime
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    }

    get(key) {
        const now = Date.now();
        
        if (this.cache.has(key) && this.cacheExpiry.get(key) > now) {
            return this.cache.get(key);
        }

        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
            const cacheData = JSON.parse(stored);
            if (cacheData.expiry > now) {
                this.cache.set(key, cacheData.data);
                this.cacheExpiry.set(key, cacheData.expiry);
                return cacheData.data;
            } else {
                localStorage.removeItem(`cache_${key}`);
            }
        }

        return null;
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        localStorage.removeItem(`cache_${key}`);
    }

    clear() {
        this.cache.clear();
        this.cacheExpiry.clear();
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    }

    saveUserData(userId, data) {
        const userData = {
            ...data,
            lastUpdated: Date.now()
        };
        
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        this.set(`user_${userId}`, userData, 24 * 60 * 60 * 1000);
    }

    getUserData(userId) {
        let userData = this.get(`user_${userId}`);
        
        if (!userData) {
            const stored = localStorage.getItem(`user_${userId}`);
            if (stored) {
                userData = JSON.parse(stored);
                this.set(`user_${userId}`, userData);
            }
        }

        return userData;
    }

    saveGoals(userId, goals) {
        const key = `goals_${userId}`;
        this.set(key, goals);
        localStorage.setItem(`userGoals_${userId}`, JSON.stringify(goals));
    }

    getGoals(userId) {
        const key = `goals_${userId}`;
        let goals = this.get(key);
        
        if (!goals) {
            const stored = localStorage.getItem(`userGoals_${userId}`);
            if (stored) {
                goals = JSON.parse(stored);
                this.set(key, goals);
            }
        }

        return goals || [];
    }

    addGoal(userId, goal) {
        const goals = this.getGoals(userId);
        const newGoal = {
            id: Date.now(),
            ...goal,
            createdAt: new Date().toISOString(),
            progress: 0
        };
        
        goals.push(newGoal);
        this.saveGoals(userId, goals);
        return newGoal;
    }

    updateGoal(userId, goalId, updates) {
        const goals = this.getGoals(userId);
        const goalIndex = goals.findIndex(g => g.id === goalId);
        
        if (goalIndex !== -1) {
            goals[goalIndex] = {
                ...goals[goalIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveGoals(userId, goals);
            return goals[goalIndex];
        }
        
        return null;
    }

    saveGameData(userId, gameData) {
        const games = this.getGameHistory(userId);
        const newGame = {
            id: Date.now(),
            ...gameData,
            timestamp: Date.now()
        };
        
        games.unshift(newGame);
        
        if (games.length > 100) {
            games.splice(100);
        }
        
        localStorage.setItem(`gameHistory_${userId}`, JSON.stringify(games));
        this.set(`games_${userId}`, games);
        
        return newGame;
    }

    getGameHistory(userId) {
        const key = `games_${userId}`;
        let games = this.get(key);
        
        if (!games) {
            const stored = localStorage.getItem(`gameHistory_${userId}`);
            if (stored) {
                games = JSON.parse(stored);
                this.set(key, games);
            }
        }

        return games || [];
    }

    saveSettings(settings) {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        this.set('settings', settings, 24 * 60 * 60 * 1000);
    }

    getSettings() {
        let settings = this.get('settings');
        
        if (!settings) {
            const stored = localStorage.getItem('appSettings');
            if (stored) {
                settings = JSON.parse(stored);
                this.set('settings', settings);
            } else {
                settings = {
                    notifications: true,
                    darkMode: false,
                    language: 'en',
                    autoSync: true
                };
                this.saveSettings(settings);
            }
        }

        return settings;
    }

    exportAllData(userId) {
        const userData = this.getUserData(userId);
        const goals = this.getGoals(userId);
        const games = this.getGameHistory(userId);
        const settings = this.getSettings();

        return {
            user: userData,
            goals,
            games,
            settings,
            exportDate: new Date().toISOString()
        };
    }

    getStorageStats() {
        let totalSize = 0;
        let itemCount = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
                itemCount++;
            }
        }

        return {
            totalSize: totalSize,
            itemCount: itemCount,
            availableSpace: 5 * 1024 * 1024 - totalSize,
            cacheSize: this.cache.size
        };
    }

    setupPeriodicCleanup() {
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 60000);
    }

    cleanupExpiredCache() {
        const now = Date.now();
        
        for (const [key, expiry] of this.cacheExpiry) {
            if (expiry <= now) {
                this.cache.delete(key);
                this.cacheExpiry.delete(key);
            }
        }

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
                const stored = localStorage.getItem(key);
                if (stored) {
                    try {
                        const cacheData = JSON.parse(stored);
                        if (cacheData.expiry <= now) {
                            localStorage.removeItem(key);
                        }
                    } catch (error) {
                        localStorage.removeItem(key);
                    }
                }
            }
        });
    }
}

window.refreadyData = new RefReadyDataManager();