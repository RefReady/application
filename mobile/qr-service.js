// RefReady QR Service - Secure QR Code Generation & Validation
class RefReadyQRService {
    constructor() {
        this.activeQRCodes = new Map();
        this.qrExpiryTime = 15 * 60 * 1000; // 15 minutes
        this.setupPeriodicCleanup();
    }

    async generateQRCode(gameId, mentorId = null, expiryMinutes = 15) {
        try {
            const result = await window.refreadyAPI.generateQRCode(gameId, mentorId);
            
            if (result.success) {
                const qrData = result.data;
                this.storeActiveQR(qrData);
                return qrData;
            } else {
                return this.generateLocalQR(gameId, mentorId, expiryMinutes);
            }
        } catch (error) {
            console.error('QR generation failed:', error);
            return this.generateLocalQR(gameId, mentorId, expiryMinutes);
        }
    }

    generateLocalQR(gameId, mentorId = null, expiryMinutes = 15) {
        const qrId = this.generateUniqueId();
        const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);
        
        const qrData = {
            id: qrId,
            gameId: gameId,
            mentorId: mentorId,
            timestamp: Date.now(),
            expiryTime: expiryTime,
            isValid: true,
            pattern: this.generateQRPattern(),
            securityHash: this.generateSecurityHash(qrId, gameId, expiryTime)
        };

        this.storeActiveQR(qrData);
        return qrData;
    }

    async validateQRCode(qrCode, scannerUserId) {
        try {
            const result = await window.refreadyAPI.validateQRCode(qrCode, scannerUserId);
            
            if (result.success) {
                return result.data;
            } else {
                return this.validateLocalQR(qrCode, scannerUserId);
            }
        } catch (error) {
            console.error('QR validation failed:', error);
            return this.validateLocalQR(qrCode, scannerUserId);
        }
    }

    validateLocalQR(qrCode, scannerUserId) {
        const qrData = this.activeQRCodes.get(qrCode);
        
        if (!qrData) {
            return {
                valid: false,
                reason: 'QR code not found or expired'
            };
        }

        if (Date.now() > qrData.expiryTime) {
            this.activeQRCodes.delete(qrCode);
            return {
                valid: false,
                reason: 'QR code has expired'
            };
        }

        if (!qrData.isValid) {
            return {
                valid: false,
                reason: 'QR code has been revoked'
            };
        }

        const expectedHash = this.generateSecurityHash(
            qrData.id, 
            qrData.gameId, 
            qrData.expiryTime
        );
        
        if (qrData.securityHash !== expectedHash) {
            return {
                valid: false,
                reason: 'Invalid security signature'
            };
        }

        return {
            valid: true,
            gameId: qrData.gameId,
            mentorId: qrData.mentorId,
            timeRemaining: qrData.expiryTime - Date.now()
        };
    }

    storeActiveQR(qrData) {
        this.activeQRCodes.set(qrData.id, qrData);
        
        const storedQRs = JSON.parse(localStorage.getItem('activeQRCodes') || '{}');
        storedQRs[qrData.id] = qrData;
        localStorage.setItem('activeQRCodes', JSON.stringify(storedQRs));
    }

    revokeQRCode(qrId) {
        const qrData = this.activeQRCodes.get(qrId);
        if (qrData) {
            qrData.isValid = false;
            this.storeActiveQR(qrData);
        }
    }

    getActiveQRCode(qrId) {
        return this.activeQRCodes.get(qrId);
    }

    getAllActiveQRCodes() {
        return Array.from(this.activeQRCodes.values())
            .filter(qr => qr.isValid && Date.now() < qr.expiryTime);
    }

    generateQRPattern() {
        const patterns = [];
        const size = 25; // 25x25 grid
        
        for (let row = 0; row < size; row++) {
            const rowPattern = [];
            for (let col = 0; col < size; col++) {
                const seed = (row * size + col) * Date.now();
                rowPattern.push(Math.sin(seed) > 0 ? 1 : 0);
            }
            patterns.push(rowPattern);
        }

        return patterns;
    }

    renderQRPattern(pattern, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        container.className = 'qr-pattern';

        pattern.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'qr-row';
            
            row.forEach(module => {
                const moduleDiv = document.createElement('div');
                moduleDiv.className = `qr-module ${module ? 'filled' : ''}`;
                rowDiv.appendChild(moduleDiv);
            });
            
            container.appendChild(rowDiv);
        });
    }

    generateUniqueId() {
        return 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSecurityHash(qrId, gameId, expiryTime) {
        const data = `${qrId}${gameId}${expiryTime}`;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    async getAvailableMentors(gameId) {
        try {
            const result = await window.refreadyAPI.getAvailableMentors(gameId);
            if (result.success) {
                return result.data;
            }
        } catch (error) {
            console.error('Failed to fetch mentors:', error);
        }

        return this.getMockMentors();
    }

    getMockMentors() {
        return [
            {
                id: 1,
                name: 'Sarah Johnson',
                role: 'Senior Mentor',
                avatar: '/images/mentor1.jpg',
                online: true,
                specialties: ['Rule Interpretation', 'Game Management']
            },
            {
                id: 2,
                name: 'Michael Chen',
                role: 'Technical Mentor',
                avatar: '/images/mentor2.jpg',
                online: true,
                specialties: ['Positioning', 'Communication']
            },
            {
                id: 3,
                name: 'Emma Williams',
                role: 'Development Mentor',
                avatar: '/images/mentor3.jpg',
                online: false,
                specialties: ['Confidence Building', 'Skill Development']
            }
        ];
    }

    updateQRTimer(qrData, timerId) {
        const timerElement = document.getElementById(timerId);
        if (!timerElement || !qrData) return;

        const updateTimer = () => {
            const timeRemaining = qrData.expiryTime - Date.now();
            
            if (timeRemaining <= 0) {
                timerElement.textContent = 'Expired';
                timerElement.style.color = '#ff6b6b';
                return;
            }

            const minutes = Math.floor(timeRemaining / 60000);
            const seconds = Math.floor((timeRemaining % 60000) / 1000);
            
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeRemaining < 300000) { // Less than 5 minutes
                timerElement.style.color = '#ff6b6b';
            } else if (timeRemaining < 600000) { // Less than 10 minutes
                timerElement.style.color = '#ffa726';
            } else {
                timerElement.style.color = '#4caf50';
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        setTimeout(() => {
            clearInterval(interval);
            timerElement.textContent = 'Expired';
            timerElement.style.color = '#ff6b6b';
        }, qrData.expiryTime - Date.now());
    }

    setupPeriodicCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [qrId, qrData] of this.activeQRCodes) {
                if (now > qrData.expiryTime) {
                    this.activeQRCodes.delete(qrId);
                }
            }

            const storedQRs = JSON.parse(localStorage.getItem('activeQRCodes') || '{}');
            const activeStoredQRs = {};
            
            for (const [qrId, qrData] of Object.entries(storedQRs)) {
                if (now < qrData.expiryTime) {
                    activeStoredQRs[qrId] = qrData;
                }
            }
            
            localStorage.setItem('activeQRCodes', JSON.stringify(activeStoredQRs));
        }, 60000);
    }

    loadStoredQRCodes() {
        const storedQRs = JSON.parse(localStorage.getItem('activeQRCodes') || '{}');
        const now = Date.now();
        
        for (const [qrId, qrData] of Object.entries(storedQRs)) {
            if (now < qrData.expiryTime && qrData.isValid) {
                this.activeQRCodes.set(qrId, qrData);
            }
        }
    }
}

window.refreadyQR = new RefReadyQRService();
window.refreadyQR.loadStoredQRCodes();