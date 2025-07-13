# RefReady Club Dashboard

## 🎯 Overview

The RefReady Club Dashboard is a web-based administrative interface that allows club coordinators to manage referees, mentors, and monitor club activities. This separates the administrative functions from the mobile app, providing a more professional and desktop-optimized experience for club management.

## 🚀 Features

### ✅ Implemented Features
- **Authentication System**: Secure login for club administrators
- **Dashboard Overview**: Key metrics and activity summary
- **Referee Management**: View and invite new referees
- **Mentor Management**: Manage and invite mentors
- **Safety Monitoring**: Track safety incidents and alerts
- **Activity Tracking**: Recent club activity and notifications
- **Demo Mode**: Full-featured demo for testing

### 🔄 Coming Soon
- **Detailed Reports**: Advanced analytics and reporting
- **Calendar Integration**: Game scheduling and management
- **Real-time Notifications**: Live updates and alerts
- **Mobile Responsive**: Optimized mobile dashboard experience

## 🔐 Authentication

### Demo Credentials
For testing purposes, use these demo credentials:

**Option 1: Demo Login Button**
- Click "View Demo Dashboard" on the login page
- No credentials required

**Option 2: Manual Login**
- Email: `admin@adelaidenetball.com`
- Password: `demo123`

**Option 3: Alternative Demo**
- Email: `demo@refready.com`
- Password: `demo123`

## 🗂️ File Structure

```
website/dashboard/
├── login.html          # Authentication page
├── overview.html       # Main dashboard
├── auth.js            # Authentication logic
├── dashboard.js       # Dashboard functionality
├── dashboard.css      # Dashboard styling
└── README.md          # This file
```

## 📱 How to Test

### 1. Access the Dashboard
- Open your browser
- Navigate to `website/index.html`
- Click "Club Dashboard" in the navigation
- Or go directly to `website/dashboard/login.html`

### 2. Login Options
- **Quick Demo**: Click "View Demo Dashboard" button
- **Manual Login**: Use demo credentials above
- **Password Reset**: Test forgot password functionality

### 3. Test Features
- **Overview**: Check metrics and recent activity
- **Invite Referee**: Use the "Invite Referee" quick action
- **Invite Mentor**: Use the "Invite Mentor" quick action
- **Navigation**: Test sidebar navigation (placeholder links)
- **Logout**: Test logout functionality

### 4. Demo Data
The dashboard includes realistic demo data:
- 15 active referees
- 8 active mentors
- 24 weekly games
- Recent activity feed
- Safety incident tracking

## 🛠️ Technical Details

### Authentication Flow
1. User visits login page
2. Credentials validated against demo data
3. Session stored in localStorage
4. Redirected to dashboard overview
5. Auto-logout after session expiry

### Data Management
- Demo mode uses hardcoded sample data
- Production mode would sync with backend API
- Local storage for session management
- Real-time UI updates

### Security Features
- Session expiry management
- Secure password handling
- Demo mode isolation
- CSRF protection ready

## 🔧 Customization

### Adding New Features
1. Update `dashboard.js` with new functionality
2. Add corresponding HTML elements
3. Update CSS for styling
4. Test in demo mode

### Styling Changes
- Modify `dashboard.css` for visual updates
- Use CSS variables for consistent theming
- Responsive design included

### Data Integration
- Replace demo data with API calls
- Update authentication to use real backend
- Add proper error handling

## 📊 Demo Data Structure

### Club Information
- **Name**: Adelaide Netball Association
- **Active Referees**: 15
- **Active Mentors**: 8
- **Weekly Games**: 24
- **Average Confidence**: 7.8/10

### Sample Referees
- Emma Richardson (Rising Star, 12 games)
- James Wilson (Newcomer, 6 games)
- Alex Thompson (Developing, 9 games)

### Sample Mentors
- Sarah Mitchell (Senior Mentor, 5 years)
- Mike Roberts (Club Mentor, 3 years)

### Recent Activity
- Game logging
- Feedback provision
- Badge achievements
- Mentor invitations

## 🐛 Known Issues

### Current Limitations
- Navigation links are placeholder (except Overview)
- No real backend integration
- Limited mobile responsiveness
- Demo data only

### Future Improvements
- Real-time data synchronization
- Advanced reporting features
- Mobile app integration
- Push notifications

## 🤝 Integration with Mobile App

### Data Sync
- Shared localStorage structure
- Compatible data formats
- Consistent user experience

### Feature Separation
- **Mobile App**: Referee self-service features
- **Web Dashboard**: Administrative functions
- **Shared**: Authentication and core data

## 📞 Support

For issues or questions:
- Check console for error messages
- Verify demo credentials
- Test in different browsers
- Clear localStorage if needed

## 🔮 Future Roadmap

### Phase 2 Features
- Backend API integration
- Real-time notifications
- Advanced analytics
- Mobile optimization

### Phase 3 Features
- Multi-club management
- Advanced reporting
- Integration with external systems
- Enhanced security features

---

**Note**: This dashboard is currently in Phase 1 implementation with demo data. Full backend integration and additional features are planned for future releases. 