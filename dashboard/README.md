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

The dashboard uses Firebase Authentication with email/password sign-in. Users must be registered through the trial signup process or created by administrators in the Firebase Console.

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

### 2. Login Process
- **User Login**: Use valid Firebase user credentials
- **Trial Signup**: Create new club account through trial signup
- **Password Reset**: Use Firebase password reset functionality

### 3. Test Features
- **Overview**: Check metrics and recent activity
- **Invite Referee**: Use the "Invite Referee" quick action
- **Invite Mentor**: Use the "Invite Mentor" quick action
- **Navigation**: Test sidebar navigation (placeholder links)
- **Logout**: Test logout functionality

### 4. Real Data
The dashboard displays real club data from Firebase:
- Active referees from club signup
- Active mentors from club signup
- Game tracking and activity
- Real-time activity feed
- Safety incident tracking

## 🛠️ Technical Details

### Authentication Flow
1. User visits login page
2. Credentials validated against Firebase Authentication
3. User data retrieved from Firestore
4. Redirected to dashboard overview
5. Real-time auth state monitoring

### Data Management
- Real-time data sync with Firebase Firestore
- User authentication through Firebase Auth
- Role-based access control
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
- Firebase Firestore for real-time data
- Firebase Authentication for user management
- Proper error handling and validation

## 📊 Data Structure

### Club Information
- **Name**: Dynamic (from club signup)
- **Active Referees**: Real count from database
- **Active Mentors**: Real count from database
- **Weekly Games**: Actual game tracking
- **Average Confidence**: Calculated from real data

### User Roles
- **Admin**: Full club management access
- **Coordinator**: Club oversight and management
- **Mentor**: Referee guidance and support
- **Referee**: Mobile app access and tracking

## 🐛 Known Issues

### Current Limitations
- Navigation links are placeholder (except Overview)
- Limited mobile responsiveness
- Some features still in development

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