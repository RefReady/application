# 🔥 Firebase Email Extension Setup Guide

## Quick Setup (5 minutes)

### Step 1: Install Firebase CLI
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### Step 2: Initialize Firebase Extensions
```bash
# Navigate to your project
cd website

# Initialize Firebase in your project (if not already done)
firebase init

# Initialize extensions
firebase init extensions
```

### Step 3: Install Email Extension
```bash
# Install the Firebase Send Email extension
firebase ext:install firestore-send-email
```

### Step 4: Configuration During Installation

You'll be prompted for these settings:

#### **Email Service Provider:**
- **Recommended: SendGrid** (best deliverability)
- Alternative: Mailgun, Mailjet, etc.

#### **Extension Configuration:**
```bash
# Collection name for email documents
MAIL_COLLECTION: mail

# Email from address  
FROM_EMAIL: noreply@refready.net

# Email from name
FROM_NAME: RefReady

# SendGrid API Key (you'll need to get this)
SENDGRID_API_KEY: [Get from SendGrid dashboard]
```

### Step 5: Get SendGrid API Key

1. Go to [SendGrid](https://sendgrid.com) and create free account
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Full Access** (or minimal: Mail Send permissions)
5. Copy the API key and paste it during Firebase setup

### Step 6: Deploy Extension
```bash
# Deploy the extension to your Firebase project
firebase deploy --only extensions
```

## ✅ Verification

After setup, the extension will:

1. **Monitor** the `mail` collection in Firestore
2. **Automatically send emails** when documents are added
3. **Update documents** with delivery status
4. **Handle retries** for failed sends

## 🧪 Test Your Setup

You can test by manually adding a document to Firestore:

```javascript
// In Firebase Console → Firestore → Create Document
// Collection: mail
// Document ID: (auto-generate)
// Fields:
{
  "to": "test@example.com",
  "message": {
    "subject": "Test Email",
    "text": "Hello from RefReady!"
  }
}
```

## 📧 Email Templates (Optional)

For better email design, you can use SendGrid templates:

### Create SendGrid Template:
1. Go to SendGrid → **Email API** → **Dynamic Templates**
2. Create new template with these variables:
   - `{{refereeName}}`
   - `{{clubName}}`
   - `{{clubCode}}`
   - `{{invitationLink}}`
   - `{{personalMessage}}`

### Update Your Code:
```javascript
// Instead of html/text, use template
const emailDoc = {
  to: invitation.refereeEmail,
  template: {
    name: 'referee-invitation',
    data: {
      refereeName: invitation.refereeName,
      clubName: invitation.clubName,
      clubCode: invitation.clubCode,
      invitationLink: invitationLink
    }
  }
};
```

## 🔧 Troubleshooting

### Extension Not Sending Emails?
1. Check Firebase Console → **Extensions** → **Send Email** → **Logs**
2. Verify SendGrid API key is correct
3. Check Firestore security rules allow writes to `mail` collection

### SendGrid Delivery Issues?
1. Verify your domain in SendGrid (for better deliverability)
2. Check SendGrid → **Activity** for bounce/spam reports
3. Consider setting up SPF/DKIM records

### Firestore Security Rules
Add this to your `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to write to mail collection
    match /mail/{document} {
      allow write: if request.auth != null;
    }
  }
}
```

## 💰 Costs

- **Firebase Extension**: FREE
- **SendGrid**: FREE for 100 emails/day (perfect for most clubs)
- **Firestore**: Minimal cost for email document storage

## 🎯 Next Steps

After setup, your RefReady invitation system will:
1. ✅ Send professional HTML emails automatically
2. ✅ Include club codes and direct links  
3. ✅ Handle delivery tracking and retries
4. ✅ Scale to thousands of invitations

**Your email system is now production-ready!** 🚀 