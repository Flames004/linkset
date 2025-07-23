# LinkSet 🔗

A modern, elegant link management app built with React Native and Expo. Save, organize, and access your important links with a beautiful, intuitive interface.

## 🌟 Features

### 🔐 **Authentication**
- Email/password registration and login
- Google Sign-in integration
- Secure user session management
- Protected routes with automatic redirects

### 📎 **Link Management**
- Add links with optional titles/captions
- Edit existing links (URL and title)
- Delete links with intuitive swipe gestures
- Real-time synchronization across devices
- Automatic sorting by modification date

### 🎨 **Modern Design**
- Clean, card-based interface
- Dark/Light theme with system preference
- Smooth animations and transitions
- Responsive design for all screen sizes
- Beautiful gradient backgrounds

### 📱 **User Experience**
- Tab navigation (Links + Account)
- Swipe-to-edit and swipe-to-delete
- Modal-based editing interface
- Keyboard-aware layouts
- Touch feedback and loading states

### ⚙️ **Account Management**
- User profile with account details
- Organized settings (Account, App, Support)
- Theme preference management
- Secure logout with confirmation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase account
- Google Developer Console account (for Google Auth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/linkset.git
   cd linkset
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Download the configuration file

4. **Configure Firebase**
   Create `services/firebase.ts` with your Firebase configuration:
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     // Your Firebase configuration
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   ```

5. **Set up Google Authentication**
   - Configure OAuth 2.0 in Google Developer Console
   - Add your configuration to `services/googleAuth.ts`

6. **Start the development server**
   ```bash
   npx expo start
   ```

## 📱 Running the App

### Development
```bash
# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on physical device
# Scan QR code with Expo Go app
```

### Building for Production
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

## 🏗️ Project Structure

```
linkset/
├── app/                    # Main application code
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx      # Login screen
│   │   └── signup.tsx     # Sign up screen
│   ├── (tabs)/            # Main app tabs
│   │   ├── index.tsx      # Home/Links screen
│   │   ├── account.tsx    # Account/Settings screen
│   │   └── _layout.tsx    # Tab navigation layout
│   └── _layout.tsx        # Root layout
├── context/               # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── ThemeContext.tsx   # Theme management
├── services/              # External services
│   ├── firebase.ts        # Firebase configuration
│   └── googleAuth.ts      # Google authentication
├── assets/                # Static assets
└── README.md             # This file
```

## 🛠️ Tech Stack

### **Frontend**
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and toolchain
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based navigation

### **Backend & Services**
- **Firebase Auth** - User authentication
- **Firestore** - NoSQL database for real-time data
- **Google OAuth** - Social authentication

### **UI & Styling**
- **React Native Gesture Handler** - Touch interactions
- **Expo Linear Gradient** - Beautiful gradients
- **Expo Vector Icons** - Icon library
- **Custom Themes** - Dark/Light mode support

## 🎯 Current Status

### ✅ **Completed Features**
- [x] User authentication (Email/Password)
- [x] Link CRUD operations
- [x] Modern UI with dark/light themes
- [x] Swipe gestures for edit/delete
- [x] Real-time data synchronization
- [x] Account management
- [x] Tab navigation

### 🚧 **In Progress**
- [ ] Google Authentication fixes
- [ ] Share extension integration
- [ ] User onboarding flow

### 📋 **Planned Features**
- [ ] Search functionality
- [ ] Link categories/tags
- [ ] Link previews with thumbnails
- [ ] Offline mode with sync
- [ ] Export/import functionality
- [ ] Widget support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Follow the existing code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include device/OS information
- Attach screenshots if applicable

---

<p align="center">
  <strong>Built with ❤️ by Flames</strong>
</p>
