# DocScanner Pro - Free Document Scanner Web App

A completely free, open-source document scanner web application with automatic document detection and perspective correction.

## 🚀 Features

- **📱 Authentication**: Email/password login (works in demo mode)
- **📄 Document Processing**: Upload PNG, JPEG, and PDF files
- **🤖 Auto-Detection**: OpenCV.js powered document boundary detection
- **📐 Perspective Correction**: Scanner-grade image correction
- **👀 Before/After Viewer**: Split-view comparison with zoom/pan
- **🗂️ Gallery**: Document management with search and filtering
- **💾 Local Storage**: No backend required - data stored locally
- **📱 Responsive**: Works on mobile, tablet, and desktop

## 🆓 Completely Free Setup

This app works entirely with open-source technologies and free services:

### Current Setup (No API Keys Required)
- **Frontend**: React + Vite
- **CV Processing**: OpenCV.js (completely client-side)
- **PDF Processing**: PDF.js (client-side)
- **Storage**: Browser localStorage (no external database)
- **Auth**: Demo mode (no Firebase required)

### Optional Upgrades (Free Tiers Available)
- **Firebase**: Free tier includes 1GB storage + 100k reads/writes
- **Supabase**: Free tier includes 500MB database + 1GB storage
- **Netlify**: Free hosting for static sites

## 🛠️ Tech Stack

- **React 19** - Frontend framework
- **Tailwind CSS** - Styling
- **OpenCV.js** - Document detection & correction
- **PDF.js** - PDF processing
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Vite** - Build tool

## 🔧 Development

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Start Development Server**
   ```bash
   yarn dev
   ```

3. **Build for Production**
   ```bash
   yarn build
   ```

## 🔑 Optional: Add Firebase (Free Tier)

1. Create a Firebase project (free tier)
2. Enable Authentication and Firestore
3. Update `.env` with your Firebase config:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

## 📱 Usage

1. **Demo Mode**: Works immediately without any setup
2. **Upload Documents**: Drag & drop or click to upload
3. **Auto-Detection**: AI detects document boundaries
4. **Perspective Correction**: Automatically corrects skew and perspective
5. **Save & Manage**: Documents saved to local storage
6. **Gallery View**: Browse and manage your scanned documents

## 🔒 Security & Privacy

- **Local Storage**: Documents stored in browser (not sent to external servers)
- **Client-Side Processing**: All CV processing happens in your browser
- **No Tracking**: No analytics or external tracking
- **Open Source**: Full source code available for review

## 🌟 Scanner Quality

The document scanner provides professional-grade results:

- **Edge Detection**: Canny edge detection for precise boundaries
- **Contour Analysis**: Finds rectangular document shapes
- **Perspective Transformation**: Corrects skew and viewing angle
- **Automatic Cropping**: Removes background and focuses on document
- **Fallback Handling**: Graceful degradation when detection fails

## 📦 Deployment Options

### Free Hosting Options:
1. **Netlify**: Drag & drop deployment
2. **Vercel**: GitHub integration
3. **GitHub Pages**: Static site hosting
4. **Firebase Hosting**: Free tier available

### Deploy to Netlify:
1. Build the project: `yarn build`
2. Drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Your app is live!

## 🤝 Contributing

This is an open-source project. Contributions welcome!

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

**Built with ❤️ using only open-source technologies**
