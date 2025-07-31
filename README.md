# LinkSet 🔗

A beautiful, cross-platform link management app built with React Native and Expo. Save, organize, and access your favorite links across all devices with real-time sync.

## ✨ Features

### 🔐 Authentication & User Management
- **Email Authentication** - Secure login and registration with Firebase Auth
- **Google Sign-In** - Coming Soon! 🚀
- **Profile Management** - Edit name and avatar
- **Secure Logout** - Safe session management

### 🐾 Avatar System
- **22 Animal Avatars** - Choose from bear, cat, dog, fox, panda, and more
- **Custom Avatar Collection** - Beautiful, consistent design across all animals
- **Profile Sync** - Avatar selections sync across devices
- **Visual Selection** - Easy avatar picker with emoji indicators

### 🔗 Link Management
- **Add Links** - Save any URL with custom titles and descriptions
- **Smart Categories** - Organize links with color-coded categories
- **Edit & Delete** - Full CRUD operations for your links
- **Real-time Sync** - Changes sync instantly across devices
- **URL Validation** - Automatic link formatting and validation

### 🔍 Search & Discovery
- **Global Search** - Find links by title, description, or URL
- **Category Filtering** - Filter links by specific categories
- **Smart Suggestions** - Intelligent search recommendations
- **Instant Results** - Real-time search with no delays

### 🎨 User Interface
- **Dark & Light Themes** - Beautiful themes that adapt to your preference
- **Gradient Backgrounds** - Stunning visual design
- **Smooth Animations** - Polished transitions and interactions
- **Responsive Design** - Works perfectly on phones and tablets
- **Clean Typography** - Easy-to-read fonts and proper hierarchy

### 📱 Navigation & UX
- **Tab Navigation** - Easy access to Home, Categories, and Account
- **Floating Action Button** - Quick link addition from anywhere
- **Modal Interfaces** - Intuitive popup forms and editors
- **Pull-to-Refresh** - Easy content updates
- **Haptic Feedback** - Satisfying touch responses

### 📧 Support & Feedback
- **Contact Us System** - Built-in feedback collection
- **Multiple Contact Types** - General Feedback, Bug Reports, Feature Requests, Technical Support
- **Firebase Integration** - All feedback saved to Firestore for easy management
- **Professional Forms** - Structured subject and message fields

### ⚙️ Account Settings
- **Profile Editing** - Update name and avatar
- **Theme Toggle** - Switch between light and dark modes
- **Password Management** - Change account password (Coming Soon)
- **Data Export** - Download your saved links (Coming Soon)
- **About Section** - App version and information

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Firestore, Authentication)
- **Navigation**: Expo Router with file-based routing
- **Styling**: StyleSheet with theme support
- **State Management**: React Hooks
- **Icons**: Expo Vector Icons (Ionicons)
- **Gradients**: Expo Linear Gradient

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Studio (for local testing)
- Expo Go app (for device testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Flames004/linkset.git
   cd linkset
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Add your Firebase config to `services/firebase.ts`

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Test on device**
   - Install Expo Go on your mobile device
   - Scan the QR code from the terminal
   - Or use `npx expo start --tunnel` for remote testing

## 🎯 Roadmap

### 🔜 Coming Soon
- **Google Authentication** - One-click sign in with Google
- **Password Reset** - Email-based password recovery
- **Data Export** - Backup your links as JSON/CSV
- **Link Validation** - Check if saved links are still active
- **Favorites System** - Star your most important links
- **Advanced Search** - Filter by date, tags, and more

### 🌐 Future Plans
- **Chrome Extension** - Quick save from any website
- **Web App** - Access your links from any browser
- **Team Sharing** - Share link collections with others
- **Import/Export** - Migrate from other bookmark services
- **Analytics** - Track your link usage patterns

## 🐛 Known Issues

- Google Authentication is temporarily disabled (under development)
- Some features show "Coming Soon" placeholders

## 📞 Support

Found a bug or have a feature request? Use the built-in Contact Us feature in the app, or reach out to us at:

- **Email**: support@linkset.app
- **Feedback**: Use the in-app contact form
- **Issues**: Create an issue on GitHub


**LinkSet** - Save links. Stay organized. Sync everywhere. 🔗✨
