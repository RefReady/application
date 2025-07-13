// RefReady Mobile App - Streamlined Version (Club Admin Features Removed)
console.log('🏐 RefReady Mobile App Loading...');

class RefReadyApp {
  constructor() {
    this.currentScreen = 'home';
    this.userData = this.loadUserData();
    this.gameData = this.loadGameData();
    this.badgeData = this.loadBadgeData();
    this.upcomingGames = this.loadUpcomingGames();
    this.checklistData = this.loadChecklistData();
    this.checklistTemplates = this.getChecklistTemplates();
    this.feedbackData = this.loadFeedbackData();
    this.trainingData = this.loadTrainingData();
    this.scenarioQuestions = this.getScenarioQuestions();
    this.init();
  }

  init() {
    console.log('📱 Initializing RefReady Mobile App...');
    this.registerServiceWorker();
    this.setupEventListeners();
    this.setupProfileHandlers();
    this.setupAvatarHandler();
    this.setupUpcomingGamesHandlers();
    this.loadSavedAvatar();
    this.showScreen('home');
    this.updateConfidenceDisplay();
    this.updateBadgeProgress();
    this.updateUpcomingGames();
    this.updateFeedbackDisplay();
    this.updateFeedbackStats();
    this.updateTrainingStats();
    this.updateTrainingActivity();
    this.setupGameReminders();
    
    // Initialize new high-priority features
    this.initializeAnalytics();
    this.initializeGoals();
    this.initializeNotifications();
    this.initializeEnhancedQR();
    
    console.log('✅ RefReady Mobile App Ready!');
  }

  // Service Worker Registration
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('SW registered: ', registration);
      } catch (error) {
        console.log('SW registration failed: ', error);
      }
    }
  }

  // Event Listeners
  setupEventListeners() {
    // Bottom navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-item') || e.target.parentElement.classList.contains('nav-item')) {
        const navItem = e.target.classList.contains('nav-item') ? e.target : e.target.parentElement;
        const screen = navItem.dataset.screen;
        if (screen) {
          console.log('📱 Navigation clicked:', screen);
          this.showScreen(screen);
        }
      }
    });

    // Game form submission
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'game-form') {
        e.preventDefault();
        console.log('📝 Game form submitted');
        this.addGame();
      }
    });

    // Date/time change listener to update form UI
    document.addEventListener('change', (e) => {
      if (e.target.id === 'game-date' || e.target.id === 'game-time') {
        this.updateGameFormUI();
      }
    });

    // Safety alert button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'safety-alert-btn' || e.target.parentElement.id === 'safety-alert-btn') {
        console.log('🆘 Safety alert triggered');
        this.triggerSafetyAlert();
      }
    });

    // QR Scanner button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'qr-scan-btn') {
        console.log('📷 QR scanner activated');
        this.simulateQRScan();
      }
    });

    // Action buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-game-btn') || e.target.parentElement.classList.contains('add-game-btn')) {
        console.log('📝 Add game button clicked');
        this.showScreen('add-game');
      }
    });

    console.log('👂 Event listeners setup complete');
  }

  // Screen Management
  showScreen(screenName) {
    console.log(`🔄 Switching to screen: ${screenName}`);
    
    // Hide all screens
    document.querySelectorAll('.app-screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Show selected screen
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = screenName;
      
      // Initialize screen-specific functionality
      if (screenName === 'add-game') {
        setTimeout(() => this.updateGameFormUI(), 100);
      } else if (screenName === 'analytics') {
        setTimeout(() => this.updateAnalytics(), 100);
      } else if (screenName === 'goals') {
        setTimeout(() => this.renderGoals(), 100);
      }
    } else {
      console.error(`❌ Screen not found: ${screenName}-screen`);
    }

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Find and activate the correct nav item
    const navItem = document.querySelector(`[data-screen="${screenName}"]`);
    if (navItem) {
      navItem.classList.add('active');
    }
  }

  // User Data Management
  loadUserData() {
    const saved = localStorage.getItem('refready-user');
    return saved ? JSON.parse(saved) : {
      name: 'Emma',
      confidence: 8,
      gamesRefereed: 12,
      totalBadges: 5,
      currentLevel: 'Rising Star'
    };
  }

  saveUserData() {
    localStorage.setItem('refready-user', JSON.stringify(this.userData));
  }

  loadGameData() {
    const saved = localStorage.getItem('refready-games');
    return saved ? JSON.parse(saved) : [];
  }

  saveGameData() {
    localStorage.setItem('refready-games', JSON.stringify(this.gameData));
  }

  loadBadgeData() {
    const saved = localStorage.getItem('refready-badges');
    return saved ? JSON.parse(saved) : {
      'first-game': { earned: true, date: '2024-01-15' },
      'confident-calls': { earned: true, date: '2024-02-03' },
      'feedback-champion': { earned: true, date: '2024-02-20' },
      'safety-aware': { earned: true, date: '2024-03-01' },
      'mentor-favorite': { earned: true, date: '2024-03-15' },
      'season-strong': { earned: false, progress: 12, target: 20 }
    };
  }

  saveBadgeData() {
    localStorage.setItem('refready-badges', JSON.stringify(this.badgeData));
  }

  // Game Management
  addGame() {
    const form = document.getElementById('game-form');
    if (!form) {
      console.error('❌ Game form not found');
      return;
    }

    const formData = new FormData(form);
    
    const game = {
      id: Date.now(),
      date: formData.get('game-date'),
      time: formData.get('game-time'),
      type: formData.get('game-type'),
      venue: formData.get('venue'),
      confidence: parseInt(formData.get('confidence')),
      notes: formData.get('notes'),
      timestamp: new Date().toISOString()
    };

    console.log('📝 Logging game:', game);

    // Check if this is a future game
    const gameDateTime = new Date(`${game.date}T${game.time}`);
    const now = new Date();
    
    if (gameDateTime > now) {
      // Add to upcoming games
      this.upcomingGames.push(game);
      this.saveUpcomingGames();
      this.updateUpcomingGames();
      this.showNotification('Upcoming game scheduled! 📅', 'success');
    } else {
      // Add to completed games
      this.gameData.push(game);
      this.userData.gamesRefereed++;
      this.userData.confidence = Math.round((this.userData.confidence + game.confidence) / 2);
      
      this.saveGameData();
      this.saveUserData();
      this.updateConfidenceDisplay();
      this.updateBadgeProgress();
      this.showNotification('Game logged successfully! 🎯', 'success');
    }

    // Clear form
    form.reset();
    this.updateGameFormUI();
    
    // Switch to home screen
    this.showScreen('home');
  }

  // Update Game Form UI
  updateGameFormUI() {
    const form = document.getElementById('game-form');
    if (!form) return;

    const dateInput = document.getElementById('game-date');
    const timeInput = document.getElementById('game-time');
    
    if (dateInput && timeInput) {
      const gameDateTime = new Date(`${dateInput.value}T${timeInput.value}`);
      const now = new Date();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        if (gameDateTime > now) {
          submitBtn.textContent = '📅 Schedule Game';
          submitBtn.className = 'btn btn-primary btn-large';
        } else {
          submitBtn.textContent = '📝 Log Game';
          submitBtn.className = 'btn btn-secondary btn-large';
        }
      }
    }
  }

  // Badge Management
  updateBadgeProgress() {
    const badgeCards = document.querySelectorAll('.badge-card');
    
    badgeCards.forEach(card => {
      const badgeId = card.dataset.badge;
      const badge = this.badgeData[badgeId];
      
      if (badge) {
        const progressBar = card.querySelector('.progress-bar');
        const statusIcon = card.querySelector('.badge-status');
        
        if (badge.earned) {
          card.classList.add('earned');
          if (statusIcon) statusIcon.textContent = '✅';
          if (progressBar) progressBar.style.width = '100%';
        } else if (badge.progress) {
          const percentage = Math.min((badge.progress / badge.target) * 100, 100);
          if (progressBar) progressBar.style.width = percentage + '%';
          if (statusIcon) statusIcon.textContent = `${badge.progress}/${badge.target}`;
        }
      }
    });
  }

  // QR Code Simulation
  simulateQRScan() {
    console.log('📷 QR Scanner simulation');
    
    // Simulate scan delay
    setTimeout(() => {
      const feedbackData = {
        mentorName: 'Sarah Mitchell',
        game: 'U15 vs Torrens Valley',
        date: new Date().toISOString().split('T')[0],
        type: 'qr-scan'
      };
      
      this.showFeedback(feedbackData);
    }, 2000);
    
    this.showNotification('Scanning QR code... 📷', 'info');
  }

  // Feedback Display
  showFeedback(data) {
    console.log('💬 Showing feedback:', data);
    
    // Show feedback modal or navigate to feedback screen
    this.showNotification(`Feedback from ${data.mentorName} received! 🎉`, 'success');
    
    // You could add more detailed feedback display here
  }

  // Safety Alert
  triggerSafetyAlert() {
    console.log('🆘 Safety alert triggered');
    
    // In a real app, this would send an alert to club coordinators
    this.showNotification('Safety alert sent to club coordinators! 🚨', 'warning');
    
    // Add to user's safety alert history
    const alertData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'general',
      status: 'sent'
    };
    
    // Save alert data
    const alerts = JSON.parse(localStorage.getItem('refready-safety-alerts') || '[]');
    alerts.push(alertData);
    localStorage.setItem('refready-safety-alerts', JSON.stringify(alerts));
  }

  // Notification System
  showNotification(message, type = 'info') {
    console.log(`📢 Notification: ${message}`);
    
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 4000);
  }

  // Get notification icon
  getNotificationIcon(type) {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  }

  // Profile and Stats
  updateConfidenceDisplay() {
    const confidenceElements = document.querySelectorAll('.confidence-display');
    confidenceElements.forEach(el => {
      el.textContent = this.userData.confidence;
    });
  }

  updateProfileStats() {
    const nameElements = document.querySelectorAll('.user-name');
    const levelElements = document.querySelectorAll('.user-level');
    const gamesElements = document.querySelectorAll('.games-count');
    const badgesElements = document.querySelectorAll('.badges-count');
    
    nameElements.forEach(el => el.textContent = this.userData.name);
    levelElements.forEach(el => el.textContent = this.userData.currentLevel);
    gamesElements.forEach(el => el.textContent = this.userData.gamesRefereed);
    badgesElements.forEach(el => el.textContent = this.userData.totalBadges);
  }

  // Profile Management
  setupProfileHandlers() {
    // Edit profile button
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-profile-btn')) {
        this.showEditProfileModal();
      }
    });

    // Settings actions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('setting-action')) {
        const action = e.target.dataset.action;
        this.handleSettingAction(action);
      }
    });

    // Toggle switches
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('toggle-switch')) {
        this.handleToggleChange(e.target, e.target.checked);
      }
    });
  }

  // Simplified placeholder methods for features not yet implemented
  loadUpcomingGames() {
    const saved = localStorage.getItem('refready-upcoming-games');
    return saved ? JSON.parse(saved) : [];
  }

  saveUpcomingGames() {
    localStorage.setItem('refready-upcoming-games', JSON.stringify(this.upcomingGames));
  }

  updateUpcomingGames() {
    // Update upcoming games display
    console.log('📅 Updating upcoming games display');
  }

  setupUpcomingGamesHandlers() {
    // Setup handlers for upcoming games
    console.log('📅 Setting up upcoming games handlers');
  }

  setupGameReminders() {
    // Setup game reminder system
    console.log('⏰ Setting up game reminders');
  }

  loadChecklistData() {
    return JSON.parse(localStorage.getItem('refready-checklists') || '{}');
  }

  getChecklistTemplates() {
    return {
      mental: ['Reviewed rules', 'Visualized scenarios', 'Prepared mindset'],
      physical: ['Warmed up', 'Stretched', 'Hydrated'],
      equipment: ['Whistle ready', 'Uniform clean', 'Emergency kit'],
      logistics: ['Travel planned', 'Arrived early', 'Checked in']
    };
  }

  loadFeedbackData() {
    return JSON.parse(localStorage.getItem('refready-feedback') || '[]');
  }

  updateFeedbackDisplay() {
    console.log('💬 Updating feedback display');
  }

  updateFeedbackStats() {
    console.log('📊 Updating feedback stats');
  }

  loadTrainingData() {
    return JSON.parse(localStorage.getItem('refready-training') || '{}');
  }

  updateTrainingStats() {
    console.log('📚 Updating training stats');
  }

  updateTrainingActivity() {
    console.log('🎯 Updating training activity');
  }

  getScenarioQuestions() {
    return [
      {
        id: 1,
        question: "Player A contacts Player B during a shot attempt. What's your call?",
        options: ["Personal foul", "No call", "Blocking foul", "Charging foul"],
        correct: 0,
        difficulty: "beginner"
      }
    ];
  }

  // Placeholder methods for advanced features
  initializeAnalytics() {
    console.log('📊 Analytics initialized');
  }

  updateAnalytics() {
    console.log('📊 Analytics updated');
  }

  initializeGoals() {
    console.log('🎯 Goals system initialized');
  }

  renderGoals() {
    console.log('🎯 Rendering goals');
  }

  initializeNotifications() {
    console.log('🔔 Notification system initialized');
  }

  initializeEnhancedQR() {
    console.log('📱 Enhanced QR system initialized');
  }

  // Placeholder methods for missing functionality
  showEditProfileModal() {
    this.showNotification('Profile editing available in full version', 'info');
  }

  handleSettingAction(action) {
    this.showNotification(`Settings: ${action}`, 'info');
  }

  handleToggleChange(element, enabled) {
    console.log(`Toggle ${element.id}: ${enabled}`);
  }

  setupAvatarHandler() {
    console.log('👤 Avatar handler setup');
  }

  loadSavedAvatar() {
    console.log('👤 Loading saved avatar');
  }

  // Initialize training system
  initializeTrainingSystem() {
    this.trainingData = this.loadTrainingData();
    this.scenarioQuestions = this.getScenarioQuestions();
    this.updateTrainingStats();
    this.updateTrainingActivity();
  }
}

// Initialize the app
const app = new RefReadyApp();

// Make app globally available for debugging
window.refReadyApp = app;

console.log('🏐 RefReady Mobile App - Streamlined Version Loaded Successfully!'); 