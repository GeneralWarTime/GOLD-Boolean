# GOLD Boolean - v2.0 ALPHA

**Boolean Search Management Platform with Firebase Authentication**

## 🚀 **v2.0 ALPHA - Authentication Implementation**

### ✅ **New Features:**
- **Firebase Authentication** - Google Sign-In and Guest Access
- **User-Specific Data Storage** - Each Google account has isolated data
- **Instant Guest Access** - No delays, immediate app access
- **Clean User Interface** - Username display, logout with page refresh
- **Secure Data Isolation** - Complete separation between user accounts

### 🔧 **Authentication Options:**
1. **Google Sign-In** - Requires Google account, full data persistence
2. **Guest Access** - Instant access, temporary data storage

### ⚠️ **KNOWN ISSUES (ALPHA):**
- **Google Sign-In Popup** - May show "Cross-Origin-Opener-Policy" warnings (cosmetic)
- **Guest Session** - Data lost on page refresh (by design)
- **Firebase Configuration** - Requires proper Firebase project setup
- **Browser Compatibility** - Some features may not work in older browsers

### 🛠️ **Setup Requirements:**
1. **Firebase Project** - Must be configured with Google Auth enabled
2. **Local Web Server** - Must run via `http://localhost:8000` (not `file://`)
3. **Node.js** - Required for Firebase dependencies

### 📦 **Installation:**
```bash
npm install firebase
python -m http.server 8000
start http://localhost:8000
```

### 🔐 **Firebase Configuration:**
- Enable Google Authentication in Firebase Console
- Add `localhost` to authorized domains
- Ensure proper API keys are configured

---

## 📋 **Original Features:**
- Boolean search string builder
- Keyword management and organization
- Training content creation
- Data export/import functionality
- Role-based search management

## 🎯 **Usage:**
1. **Start the server**: `python -m http.server 8000`
2. **Open browser**: Navigate to `http://localhost:8000`
3. **Authenticate**: Choose Google Sign-In or Guest Access
4. **Build searches**: Use the Builder tab for boolean search creation
5. **Manage data**: Use Storage tab for keyword organization
6. **Train**: Use Trainer tab for search refinement

## 📁 **File Structure:**
```
BULLION GOLD/
├── index.html          # Main application interface
├── script.js           # Core application logic + Auth
├── styles.css          # Application styling
├── package.json        # Firebase dependencies
├── run-app.bat         # Windows startup script
└── README.md           # This file
```

## 🔄 **Data Management:**
- **Google Users**: Data persists across sessions, isolated per account
- **Guest Users**: Data stored locally, cleared on logout/refresh
- **Export**: User-specific backup files with account information
- **Import**: Restore data from exported backup files

## 🚨 **ALPHA DISCLAIMER:**
This is an ALPHA release with known issues. Authentication system is functional but may have edge cases. Use for testing and development purposes only.

---

**Version**: 2.0 ALPHA  
**Status**: Authentication Implemented (Issues Present)  
**Last Updated**: January 2025 