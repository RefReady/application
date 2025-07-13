# AWS Amplify Deployment Guide

Deploy your RefReady Dashboard to AWS Amplify in minutes!

## 🚀 **Quick Deploy (Recommended)**

### **Step 1: Go to AWS Amplify Console**
1. Open: https://console.aws.amazon.com/amplify/
2. Click **"New app"** → **"Host web app"**

### **Step 2: Choose Deployment Method**

#### **Option A: Deploy without Git (Fastest)**
1. Select **"Deploy without Git"**
2. **App name**: `RefReady Dashboard`
3. **Environment name**: `production`
4. **Method**: Choose **"Drag and drop"** or **"Browse files"**
5. Upload the `refready-dashboard.zip` file (already created in your website folder)
6. Click **"Save and deploy"**

#### **Option B: Connect GitHub Repository**
1. Select your Git provider (GitHub, GitLab, etc.)
2. Connect your repository
3. Select branch: `main` or `master`
4. Amplify will auto-detect it's a static site
5. Click **"Save and deploy"**

### **Step 3: Configure Build Settings (If using Git)**
Amplify will auto-detect the `amplify.yml` file, but you can customize:

```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - echo "Building RefReady Dashboard..."
        - echo "No build process needed for static site"
  artifacts:
    baseDirectory: /
    files:
      - '**/*'
  cache:
    paths: []
```

### **Step 4: Custom Domain (Optional)**
1. Go to **"Domain management"** in your Amplify app
2. Click **"Add domain"**
3. Enter your domain (e.g., `refready.com`)
4. Amplify will handle SSL certificates automatically

## 🔧 **Advanced Configuration**

### **Environment Variables**
Add these in Amplify Console → App Settings → Environment Variables:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### **Redirects & Rewrites**
Add to Amplify Console → App Settings → Rewrites and redirects:

```
Source: /dashboard
Target: /dashboard/index.html
Type: 200 (Rewrite)

Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
Target: /index.html
Type: 200 (Rewrite)
```

### **Headers Configuration**
Add security headers in Amplify Console → App Settings → Custom headers:

```json
{
  "headers": [{
    "source": "**/*",
    "headers": [{
      "key": "X-Frame-Options",
      "value": "DENY"
    }, {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    }, {
      "key": "Referrer-Policy",
      "value": "strict-origin-when-cross-origin"
    }]
  }]
}
```

## 📱 **Features You Get with Amplify**

✅ **Global CDN** - Lightning fast worldwide  
✅ **SSL Certificate** - HTTPS automatically  
✅ **Custom Domains** - Use your own domain  
✅ **Branch Deployments** - Test different versions  
✅ **Atomic Deployments** - Zero downtime updates  
✅ **Monitoring** - Built-in analytics  
✅ **Password Protection** - Secure staging environments  

## 💰 **Pricing**
- **Free Tier**: 1000 build minutes/month + 15GB served/month
- **Perfect for RefReady**: Likely stays within free tier
- **Paid**: $0.01 per build minute, $0.15 per GB served

## 🔄 **Automatic Deployments**
If you connected Git:
1. Push to your repository
2. Amplify automatically builds and deploys
3. Live in ~2 minutes

## 🎯 **Your Files Are Ready**
- ✅ `refready-dashboard.zip` - Ready to upload
- ✅ `amplify.yml` - Build configuration  
- ✅ All dashboard files optimized

## 🚀 **Deploy Now**
1. Go to: https://console.aws.amazon.com/amplify/
2. Upload `refready-dashboard.zip`
3. Your RefReady Dashboard will be live in 2-3 minutes!

## 🆘 **Troubleshooting**

### **Firebase Not Loading**
- Make sure DEMO_MODE is set correctly in `firebase-config.js`
- Check browser console for errors

### **Login Issues**
- Verify Firebase configuration
- Check authentication is enabled in Firebase Console

### **Build Fails**
- Ensure all files are included in the zip
- Check `amplify.yml` syntax

---

**Need help?** Check the [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/) or reach out! 