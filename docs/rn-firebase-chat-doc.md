# rn-firebase-chat - Complete Documentation

**Library**: rn-firebase-chat  
**Version**: Latest  
**Platform**: React Native (iOS & Android)  
**Purpose**: Comprehensive Firebase-based real-time chat library with media sharing, encryption, and more

---

## Quick Start Guide

### What is rn-firebase-chat?

`rn-firebase-chat` is a comprehensive React Native Firebase chat library that provides:
- Real-time messaging with Firebase Firestore
- Media sharing (images, videos) with Firebase Storage
- End-to-end encryption support
- Group chat and one-on-one conversations
- Built-in UI components with react-native-gifted-chat
- Camera and gallery integration
- Message read receipts and typing indicators

---

## Installation

### React Native CLI Installation

Install the library and all required peer dependencies:

**Using npm:**
```bash
npm install rn-firebase-chat @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/storage randomcolor react-native-aes-crypto react-native-gifted-chat react-native-keyboard-controller --save
```

**Using Yarn:**
```bash
yarn add rn-firebase-chat @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/storage randomcolor react-native-aes-crypto react-native-gifted-chat react-native-keyboard-controller
```

### Expo Installation

For Expo projects, you need additional configuration. Install dependencies:

**Using npm:**
```bash
npm install rn-firebase-chat @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/storage randomcolor react-native-aes-crypto react-native-gifted-chat react-native-keyboard-controller react-native-video react-native-vision-camera react-native-image-picker expo-build-properties --save
```

**Using Yarn:**
```bash
yarn add rn-firebase-chat @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/storage randomcolor react-native-aes-crypto react-native-gifted-chat react-native-keyboard-controller react-native-video react-native-vision-camera react-native-image-picker expo-build-properties
```

**Important**: After installation, you MUST configure `app.config.ts` plugins. See [Expo Configuration](#expo-configuration) section below.

---

## Firebase Setup

Before using `rn-firebase-chat`, you must configure a Firebase project with Firestore and Storage.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "My Chat App")
4. (Optional) Enable Google Analytics
5. Click **"Create project"** and wait for setup to complete
6. Click **"Continue"** when ready

### Step 2: Enable Firestore Database

1. In Firebase dashboard, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose a starting mode:
   - **Production mode**: Requires security rules (recommended)
   - **Test mode**: Allows all reads/writes (development only)
4. Select a Firestore location (choose region closest to your users)
5. Click **"Enable"**

### Step 3: Configure Firestore Security Rules

**IMPORTANT**: These security rules are required for rn-firebase-chat to work properly.

1. In Firestore Database, go to **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - users can only read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Conversations for each user
      match /conversations/{conversationId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
        
        // Messages within conversations
        match /messages/{messageId} {
          allow read: if request.auth != null && request.auth.uid == userId;
          allow write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}
```

3. Click **"Publish"**

**What these rules do:**
- Users can only access their own conversation data
- Each user has a separate collection of conversations under their user ID
- Messages are stored within each conversation
- Requires Firebase Authentication to be enabled

### Step 4: Enable Firebase Storage

1. In Firebase dashboard, click **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Review security rules and click **"Next"**
4. Select a storage location (same as Firestore location recommended)
5. Click **"Done"**

### Step 5: Configure Storage Security Rules

**IMPORTANT**: These rules allow users to upload chat media (images, videos).

1. In Storage, go to **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chat_media/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

**What these rules do:**
- Media files are stored in `/chat_media/{userId}/` paths
- Users can only upload to their own folder
- All authenticated users can read media (for viewing in chats)

### Step 6: Add iOS App to Firebase

1. In project settings, click the iOS icon
2. Enter your **iOS bundle ID** (found in Xcode: `General` → `Bundle Identifier`)
3. (Optional) Enter app nickname and App Store ID
4. Click **"Register app"**
5. **Download `GoogleService-Info.plist`**
6. **Add the file to your iOS project in Xcode** (drag into project root)
7. Click **"Continue to console"**

### Step 7: Add Android App to Firebase

1. In project settings, click the Android icon
2. Enter your **Android package name** (in `android/app/build.gradle` as `applicationId`)
3. (Optional) Enter app nickname
4. (Optional) Enter debug signing certificate SHA-1
5. Click **"Register app"**
6. **Download `google-services.json`**
7. **Place the file in `android/app/google-services.json`**
8. Follow SDK setup instructions (add Google Services plugin to gradle)
9. Click **"Continue to console"**

### Step 8: Enable Firebase Authentication

**Highly Recommended**: While `rn-firebase-chat` can work without auth, it's required for production security rules.

1. Click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable authentication methods:
   - **Email/Password** (most common)
   - **Google** (social login)
   - **Anonymous** (useful for testing)
   - **Phone** (SMS verification)
5. Configure each method according to your needs

**Note**: The security rules above require `request.auth != null`, so you must have authentication enabled.

### Firebase Setup Verification Checklist

Before proceeding, verify:

- ✅ Firestore Database is enabled
- ✅ Firestore security rules are configured (user-specific paths)
- ✅ Firebase Storage is enabled
- ✅ Storage security rules are configured (chat_media paths)
- ✅ iOS app registered and `GoogleService-Info.plist` added to Xcode
- ✅ Android app registered and `google-services.json` in `android/app/`
- ✅ Firebase Authentication is enabled with at least one sign-in method

---

## Expo Configuration

### Configure app.config.ts with Plugins

For Expo projects, you **must** add these plugins to your `app.config.ts`:

```typescript
// app.config.ts
import { ExpoConfig } from 'expo';

const config: ExpoConfig = {
  name: 'YourAppName',
  slug: 'your-app-slug',
  plugins: [
    // Firebase integration
    '@react-native-firebase/app',
    
    // Build properties (REQUIRED for iOS Firebase compatibility)
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          buildReactNativeFromSource: true, // Fixes Firebase modular header issues
        },
      },
    ],
    
    // Video playback support
    [
      'react-native-video',
      {
        enableNotificationControls: true,
        androidExtensions: {
          useExoplayerRtsp: false,
          useExoplayerSmoothStreaming: false,
          useExoplayerHls: false,
          useExoplayerDash: false,
        },
      },
    ],
    
    // Camera and microphone permissions
    [
      'react-native-vision-camera',
      {
        cameraPermissionText: '$(PRODUCT_NAME) needs access to your Camera.',
        enableMicrophonePermission: true,
        microphonePermissionText: '$(PRODUCT_NAME) needs access to your Microphone.',
      },
    ],
  ],
};

export default config;
```

**Why these plugins are required:**
- `@react-native-firebase/app`: Enables Firebase auto-configuration
- `expo-build-properties` with `useFrameworks: 'static'`: Required for Firebase native modules
- `buildReactNativeFromSource: true`: Fixes "include of non-modular header" build errors
- `react-native-video`: Enables video message playback
- `react-native-vision-camera`: Enables camera for taking photos/videos in chat

### Add Firebase Configuration Files for Expo

Place your Firebase config files in the correct locations:

**iOS Configuration:**
```
ios/GoogleService-Info.plist
```

**Android Configuration:**
```
android/app/google-services.json
```

Alternatively, reference them in `app.config.ts`:

```typescript
const config: ExpoConfig = {
  // ... other config
  ios: {
    googleServicesFile: './ios/GoogleService-Info.plist',
  },
  android: {
    googleServicesFile: './android/app/google-services.json',
  },
};
```

### Expo Prebuild and Run

After configuration:

```bash
expo prebuild --clean
```

Then build using EAS Build or local builds.

### Troubleshooting Expo Build Errors

**Error: "include of non-modular header inside framework module"**

If you see this error during iOS build:

```
❌  include of non-modular header inside framework module 'RNFBApp.RCTConvert_FIRApp'
```

**Solution**: Add `buildReactNativeFromSource: true` to `expo-build-properties`:

```typescript
[
  'expo-build-properties',
  {
    ios: {
      useFrameworks: 'static',
      buildReactNativeFromSource: true, // ← Add this
    },
  },
],
```

This forces React Native to build from source, resolving Firebase header conflicts.

---

## Basic Usage

### 1. Wrap Your App with ChatProvider

The `ChatProvider` component manages chat state and Firebase connections. It must wrap your entire navigation stack.

```javascript
import { ChatProvider } from 'rn-firebase-chat';

// Define current user information
const userInfo = {
  id: 'abc123',              // Unique user ID (from your auth system)
  name: 'John Doe',          // Display name
  avatar: 'https://example.com/avatar.jpg', // Profile image URL
};

function App() {
  return (
    <ChatProvider userInfo={userInfo}>
      <AppNavigation />
    </ChatProvider>
  );
}
```

**ChatProvider Props:**
- `userInfo` (required): Current logged-in user information
  - `id`: Unique identifier (must match Firebase Auth UID if using auth)
  - `name`: User's display name shown in messages
  - `avatar`: URL to user's profile picture
- `chatState` (optional): External chat state for custom state management
- `chatDispatch` (optional): External dispatch function for state updates
- `enableEncrypt` (optional): Enable end-to-end encryption (boolean)
- `encryptKey` (optional): Encryption key for messages (string)
- `encryptionOptions` (optional): Encryption algorithm configuration

### 1b. Advanced: External State Management with ChatProvider

For advanced use cases where you need to manage chat state externally (e.g., integration with your auth system, state persistence), you can pass `chatState` and `chatDispatch` from `useChat()` to `ChatProvider`:

```typescript
import React, { useState, useEffect } from 'react';
import {
  ChatProvider as RNFirebaseChatProvider,
  useChat,
} from 'rn-firebase-chat';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth(); // Your auth hook
  const [isReady, setIsReady] = useState(false);

  // Get chat state and dispatch from rn-firebase-chat
  const { chatState, chatDispatch } = useChat();

  useEffect(() => {
    // Set ready state based on authentication
    setIsReady(isAuthenticated && !!user);
  }, [isAuthenticated, user]);

  // If not ready, render children without chat provider
  if (!isReady || !user) {
    return <>{children}</>;
  }

  // Create user info for rn-firebase-chat
  const userInfo = {
    id: user.id.toString(),
    name:
      user.fullName ||
      (user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username) ||
      'Unknown User',
    avatar: user.profilePictureUrl || user.profileImageUrl || '',
  };

  return (
    <RNFirebaseChatProvider
      userInfo={userInfo}
      enableEncrypt={false}
      chatState={chatState}      // Pass state from useChat
      chatDispatch={chatDispatch} // Pass dispatch from useChat
    >
      {children}
    </RNFirebaseChatProvider>
  );
};
```

**Use Cases for External State Management:**
- **Authentication Integration**: Wait for user authentication before initializing chat
- **Conditional Rendering**: Only mount ChatProvider when user is logged in
- **State Persistence**: Save chat state to AsyncStorage or other storage
- **Custom Middleware**: Intercept and log chat actions
- **Integration with Redux/MobX**: Connect chat state with global state management
- **Debugging**: Track state changes and dispatch calls

**Important Notes:**
- `useChat()` must be called within a parent component that has access to the chat context
- The `chatState` and `chatDispatch` from `useChat()` are provided by rn-firebase-chat's internal state management
- Passing these props allows you to wrap the ChatProvider with your own logic while maintaining the library's state management

### 2. Setup Navigation for Chat Screens

Create a navigation stack with two screens:

```javascript
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export const ChatNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ListChatScreen" 
      component={ListChatScreen} 
      options={{ title: 'Conversations' }}
    />
    <Stack.Screen 
      name="ChatScreen" 
      component={ChatScreen} 
      options={{ title: 'Chat' }}
    />
  </Stack.Navigator>
);
```

### 3. Create Conversation List Screen

Display all conversations for the current user:

```javascript
import React, { useCallback } from 'react';
import { ListConversationScreen } from 'rn-firebase-chat';
import { useNavigation } from '@react-navigation/native';

export const ListChatScreen = () => {
  const navigation = useNavigation();

  const handleItemPress = useCallback((conversationData) => {
    // Navigate to chat screen when user taps a conversation
    navigation.navigate('ChatScreen', conversationData);
  }, [navigation]);

  return <ListConversationScreen onPress={handleItemPress} />;
};
```

**What `ListConversationScreen` does:**
- Displays all conversations for the current user
- Shows latest message preview
- Updates in real-time when new messages arrive
- Handles conversation creation automatically

### 4. Create Chat Screen (One-on-One)

For chatting with a single partner:

```javascript
import React from 'react';
import { ChatScreen as BaseChatScreen } from 'rn-firebase-chat';

// Partner information (the person you're chatting with)
const partnerInfo = {
  id: 'xyz789',
  name: 'Jane Smith',
  avatar: 'https://example.com/jane.jpg',
};

export const ChatScreen = () => {
  return (
    <BaseChatScreen 
      memberIds={[partnerInfo.id]}  // Array with partner's ID only
      partners={[partnerInfo]}       // Array with partner's info
    />
  );
};
```

**IMPORTANT**: `memberIds` should **NOT** include the current user's ID. The library automatically adds the current user from `ChatProvider`.

✅ **Correct:**
```javascript
// Current user: { id: 'user123', ... }
// Partner: { id: 'user456', ... }
<ChatScreen 
  memberIds={['user456']}  // Only partner's ID
  partners={[{ id: 'user456', name: 'Partner', avatar: '...' }]} 
/>
```

❌ **Wrong:**
```javascript
<ChatScreen 
  memberIds={['user123', 'user456']}  // Don't include current user!
  partners={[currentUser, partner]} 
/>
```

**Why?** Internally, the library creates conversation members as:
```typescript
members: [this.userId, ...memberIds]  // Current user added automatically
```

### 5. Create Group Chat Screen

For group conversations with multiple participants:

```javascript
import React from 'react';
import { ChatScreen as BaseChatScreen } from 'rn-firebase-chat';

const groupMembers = [
  { id: 'user1', name: 'Alice', avatar: 'https://example.com/alice.jpg' },
  { id: 'user2', name: 'Bob', avatar: 'https://example.com/bob.jpg' },
  { id: 'user3', name: 'Charlie', avatar: 'https://example.com/charlie.jpg' },
];

export const GroupChatScreen = () => {
  return (
    <BaseChatScreen 
      memberIds={['user1', 'user2', 'user3']}  // All group member IDs
      partners={groupMembers}                   // All member information
      customConversationInfo={{
        name: 'Project Team',                   // Group name
        image: 'https://example.com/group.jpg', // Group avatar
        isGroup: true                           // Mark as group chat
      }}
    />
  );
};
```

**Group Chat Features:**
- Multiple participants in one conversation
- Shared message history
- Group name and avatar
- All members can send/receive messages

---

## Advanced Features

### Message Encryption

Enable end-to-end encryption for secure messaging:

```javascript
import { ChatProvider } from 'rn-firebase-chat';

function App() {
  return (
    <ChatProvider 
      userInfo={currentUser}
      enableEncrypt={true}
      encryptKey="your-secure-256-bit-encryption-key-here"
      encryptionOptions={{
        algorithm: 'aes-256-cbc'  // AES-256 encryption
      }}
    >
      <AppNavigation />
    </ChatProvider>
  );
}
```

**Important Encryption Notes:**
- Uses `react-native-aes-crypto` for AES-256 encryption
- Messages are encrypted before being sent to Firebase
- Each user must have the same encryption key to decrypt messages
- **Lost encryption keys = lost message history** (unrecoverable)
- Store encryption keys securely (use react-native-keychain or similar)
- Consider per-conversation keys for better security

**Security Considerations:**
- Never hardcode encryption keys in your app
- Generate unique keys per conversation for group chats
- Implement secure key exchange mechanism
- Store keys in device's secure storage (Keychain/Keystore)

### Camera and Gallery Integration

Add photo/video capture and media picker:

**Install additional dependencies:**

```bash
# Using npm
npm install react-native-video react-native-vision-camera react-native-image-picker --save

# Using Yarn
yarn add react-native-video react-native-vision-camera react-native-image-picker
```

**Implement camera in ChatScreen:**

```javascript
import React from 'react';
import { ChatScreen as BaseChatScreen } from 'rn-firebase-chat';
import { CameraView, useCamera } from 'rn-firebase-chat/src/addons/camera';

export const ChatScreen = () => {
  const { onPressCamera, onPressGallery } = useCamera();

  return (
    <BaseChatScreen
      memberIds={[partnerInfo.id]}
      partners={[partnerInfo]}
      inputToolbarProps={{
        hasCamera: true,        // Enable camera button
        hasGallery: true,       // Enable gallery button
        onPressCamera,          // Camera action handler
        onPressGallery,         // Gallery action handler
      }}
    >
      {({ onSend }) => (
        <CameraView onSend={onSend} />  // Camera interface
      )}
    </BaseChatScreen>
  );
};
```

**What this enables:**
- Camera button in message input toolbar
- Gallery button for selecting existing media
- Photo capture with front/back camera
- Video recording support
- Automatic upload to Firebase Storage
- Media preview before sending

**Permissions Required:**

iOS (`Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to send photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need gallery access to send images</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access to record videos</string>
```

Android (`AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### Accessing Chat State with useChat Hook

Access and manipulate chat state from anywhere in your app:

```javascript
import { useChat } from 'rn-firebase-chat';

function MyComponent() {
  const { chatState, chatDispatch, userInfo, firestoreServices } = useChat();
  
  // Access all conversations
  const conversations = chatState?.conversations || [];
  
  // Access current active conversation
  const currentConversation = chatState?.conversation;
  
  // Get user information
  console.log('Current user:', userInfo);
  
  // Use Firestore services for custom operations
  // (advanced usage only)
  
  return (
    <View>
      <Text>Total Conversations: {conversations.length}</Text>
    </View>
  );
}
```

**Available from `useChat` hook:**
- `chatState`: Current chat state
  - `conversations`: Array of all user's conversations
  - `conversation`: Currently active conversation object
- `chatDispatch`: Function to dispatch Redux-like actions
- `userInfo`: Current user data from ChatProvider
- `firestoreServices`: Direct Firebase Firestore service instance

### Optimized State Access with useChatSelector

For better performance, use selectors to subscribe to specific state:

```javascript
import { useChatSelector, getConversation, getListConversation } from 'rn-firebase-chat';

function ConversationList() {
  // Only re-renders when conversations array changes
  const conversations = useChatSelector(getListConversation);
  
  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ConversationItem data={item} />}
    />
  );
}

function ChatHeader() {
  // Only re-renders when current conversation changes
  const currentConversation = useChatSelector(getConversation);
  
  return (
    <Text>{currentConversation?.name || 'Chat'}</Text>
  );
}
```

**Benefits of `useChatSelector`:**
- Prevents unnecessary re-renders
- Better performance for large conversation lists
- Granular state subscriptions

**Available selectors:**
- `getListConversation`: Get all conversations array
- `getConversation`: Get currently active conversation

---

## Common Use Cases

### Starting a New Conversation

When a user wants to chat with someone new:

```javascript
import { useNavigation } from '@react-navigation/native';

function UserProfileScreen({ user }) {
  const navigation = useNavigation();

  const handleStartChat = () => {
    // Navigate to ChatScreen with partner info
    navigation.navigate('ChatScreen', {
      memberIds: [user.id],
      partners: [{
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      }],
    });
  };

  return (
    <Button title="Send Message" onPress={handleStartChat} />
  );
}
```

**What happens:**
1. User taps "Send Message"
2. ChatScreen opens with the partner's info
3. If conversation doesn't exist, it's created automatically on first message
4. If conversation exists, it loads the existing chat history

### Creating a Group Chat

Allow users to create group conversations:

```javascript
function CreateGroupScreen() {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const navigation = useNavigation();

  const handleCreateGroup = () => {
    const memberIds = selectedUsers.map(user => user.id);
    
    navigation.navigate('ChatScreen', {
      memberIds,
      partners: selectedUsers,
      customConversationInfo: {
        name: groupName,
        image: 'https://example.com/default-group.jpg',
        isGroup: true,
      },
    });
  };

  return (
    <View>
      <TextInput 
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
      />
      {/* User selection UI */}
      <Button title="Create Group" onPress={handleCreateGroup} />
    </View>
  );
}
```

### Customizing Chat UI

Customize the chat interface using `react-native-gifted-chat` props:

```javascript
import { ChatScreen as BaseChatScreen } from 'rn-firebase-chat';

export const ChatScreen = () => {
  return (
    <BaseChatScreen
      memberIds={[partnerInfo.id]}
      partners={[partnerInfo]}
      // Pass any react-native-gifted-chat props
      placeholder="Type your message..."
      showUserAvatar={true}
      alwaysShowSend={true}
      renderBubble={(props) => (
        <Bubble
          {...props}
          wrapperStyle={{
            right: { backgroundColor: '#0084ff' },
            left: { backgroundColor: '#e5e5ea' },
          }}
        />
      )}
    />
  );
};
```

**Customization options:**
- Message bubble styles
- Input toolbar appearance
- Avatar display
- Send button behavior
- Custom message renderers
- Date/time formatting

See [react-native-gifted-chat documentation](https://github.com/FaridSafi/react-native-gifted-chat) for all available props.

---

## Data Structure

Understanding how rn-firebase-chat stores data in Firebase:

### Firestore Structure

```
users/
  {userId}/
    conversations/
      {conversationId}/
        id: string
        name: string
        image: string
        isGroup: boolean
        members: array
        lastMessage: object
        updatedAt: timestamp
        
        messages/
          {messageId}/
            _id: string
            text: string
            user: object
            createdAt: timestamp
            image?: string
            video?: string
```

**Key points:**
- Each user has their own copy of conversations
- Messages are nested under conversations
- Real-time listeners update automatically
- Conversation metadata includes latest message

### Storage Structure

```
chat_media/
  {userId}/
    images/
      {timestamp}_{randomId}.jpg
    videos/
      {timestamp}_{randomId}.mp4
```

**Media handling:**
- Files uploaded to user-specific paths
- Automatic file naming with timestamps
- Download URLs stored in message objects
- Security rules limit uploads to own folder

---

## Troubleshooting

### Common Issues and Solutions

**Issue**: "Firestore permission denied"
- **Cause**: Security rules not configured or user not authenticated
- **Solution**: 
  1. Verify Firestore rules are published
  2. Ensure user is logged in with Firebase Auth
  3. Check that `userInfo.id` matches `auth.uid`

**Issue**: "Storage upload failed"
- **Cause**: Storage rules not configured or incorrect path
- **Solution**:
  1. Verify Storage rules are published
  2. Check `/chat_media/{userId}/` path is allowed
  3. Ensure user is authenticated

**Issue**: Messages not appearing in real-time
- **Cause**: Firestore listeners not properly initialized
- **Solution**:
  1. Verify `ChatProvider` wraps your navigation
  2. Check Firebase connection in logs
  3. Ensure Firestore is enabled in Firebase Console

**Issue**: "Cannot read property 'id' of undefined"
- **Cause**: `userInfo` not provided to `ChatProvider`
- **Solution**:
  1. Ensure `userInfo` prop is passed to `ChatProvider`
  2. Check that `userInfo.id` is set
  3. Wait for user authentication before rendering `ChatProvider`

**Issue**: Duplicate conversations created
- **Cause**: Including current user ID in `memberIds`
- **Solution**: Only pass partner/other user IDs, not current user

**Issue**: Encryption/decryption errors
- **Cause**: Mismatched encryption keys or missing key
- **Solution**:
  1. Ensure all conversation participants have the same `encryptKey`
  2. Store encryption keys persistently
  3. Don't change encryption keys mid-conversation

**Issue**: Camera/gallery not working
- **Cause**: Missing permissions or dependencies
- **Solution**:
  1. Install required packages: `react-native-video`, `react-native-vision-camera`, `react-native-image-picker`
  2. Add permission declarations to `Info.plist` (iOS) and `AndroidManifest.xml` (Android)
  3. Request runtime permissions in your app

**Issue**: Expo build fails with "non-modular header" error
- **Cause**: Firebase and React Native framework compatibility
- **Solution**: Add `buildReactNativeFromSource: true` to `expo-build-properties` config

---

## Best Practices

### Authentication Integration

Always integrate with Firebase Authentication:

```javascript
import auth from '@react-native-firebase/auth';
import { ChatProvider } from 'rn-firebase-chat';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          avatar: firebaseUser.photoURL || 'https://example.com/default.jpg',
        });
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <ChatProvider userInfo={user}>
      <AppNavigation />
    </ChatProvider>
  );
}
```

**Why this matters:**
- Security rules require authenticated users
- User ID must match Firebase Auth UID
- Prevents unauthorized access

### Performance Optimization

**Pagination for large conversation lists:**
- Use `FlatList` with `initialNumToRender`
- Implement infinite scroll for messages
- Limit initial message load

**Optimize image uploads:**
- Compress images before upload
- Use thumbnail URLs for previews
- Lazy load media in message list

**Reduce re-renders:**
- Use `useChatSelector` instead of `useChat` when possible
- Memoize components with `React.memo`
- Use `useCallback` for event handlers

### Security Best Practices

1. **Always use Firebase Authentication**
   - Never bypass auth in production
   - Validate user identity server-side if needed

2. **Secure encryption keys**
   - Use `react-native-keychain` or similar
   - Never hardcode keys in source code
   - Implement key rotation if needed

3. **Validate user input**
   - Sanitize message text
   - Limit file upload sizes
   - Check file types before upload

4. **Monitor Firebase usage**
   - Set up billing alerts
   - Track Firestore read/write operations
   - Monitor Storage bandwidth

### User Experience Tips

1. **Show loading states**
   - Display spinner while loading conversations
   - Show "sending..." indicator for messages
   - Handle offline states gracefully

2. **Provide feedback**
   - Show success/error toasts
   - Display read receipts
   - Indicate when partner is typing

3. **Handle errors gracefully**
   - Catch and display user-friendly error messages
   - Implement retry logic for failed uploads
   - Provide offline message queue

---

## API Reference Summary

### ChatProvider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userInfo` | `{ id: string, name: string, avatar: string }` | Yes | Current user information |
| `chatState` | `object` | No | External chat state from `useChat()` for custom state management |
| `chatDispatch` | `function` | No | External dispatch function from `useChat()` for state updates |
| `enableEncrypt` | `boolean` | No | Enable message encryption |
| `encryptKey` | `string` | No | Encryption key (required if `enableEncrypt` is true) |
| `encryptionOptions` | `object` | No | Encryption algorithm configuration |

### ChatScreen Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `memberIds` | `string[]` | Yes | Array of partner user IDs (excludes current user) |
| `partners` | `User[]` | Yes | Array of partner user objects |
| `customConversationInfo` | `object` | No | Custom conversation metadata (for groups) |
| `inputToolbarProps` | `object` | No | Props for message input toolbar |
| All react-native-gifted-chat props | Various | No | Pass-through to GiftedChat component |

### ListConversationScreen Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onPress` | `(conversation) => void` | Yes | Callback when conversation is tapped |

### useChat Hook Returns

| Property | Type | Description |
|----------|------|-------------|
| `chatState` | `object` | Current chat state with conversations and messages |
| `chatDispatch` | `function` | Dispatch function for state updates |
| `userInfo` | `object` | Current user information |
| `firestoreServices` | `object` | Firebase Firestore service instance |

### useChatSelector Hook

| Selector | Returns | Description |
|----------|---------|-------------|
| `getListConversation` | `Conversation[]` | Array of all conversations |
| `getConversation` | `Conversation \| null` | Current active conversation |

---

## FAQ

**Q: Do I need Firebase Authentication to use rn-firebase-chat?**  
A: While technically possible without auth, it's highly recommended. The example security rules require authentication for production use.

**Q: Can I use this with Expo?**  
A: Yes! Follow the [Expo Configuration](#expo-configuration) section to set up required plugins.

**Q: How do I handle message pagination?**  
A: The library uses `react-native-gifted-chat` which handles pagination automatically. You can customize `loadEarlier` props for more control.

**Q: Can I customize the UI?**  
A: Yes! `ChatScreen` accepts all `react-native-gifted-chat` props for complete UI customization.

**Q: Is end-to-end encryption secure?**  
A: The library provides AES-256 encryption, but security depends on your key management implementation. Use secure storage and proper key exchange.

**Q: How do I delete messages?**  
A: Message deletion is not built-in. You'll need to implement custom Firestore operations using the `firestoreServices` from `useChat`.

**Q: Can I use this with TypeScript?**  
A: Yes! The library includes TypeScript definitions.

**Q: What's the maximum file size for media uploads?**  
A: Default Firebase Storage limits apply (5GB per file). Implement client-side validation for better UX.

**Q: How do I implement typing indicators?**  
A: Use Firestore presence system or implement custom real-time fields in conversation documents.

**Q: Can I use this for customer support chat?**  
A: Yes! Create conversations between customers and support agents using the same pattern.

---

## Additional Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **React Native Firebase**: https://rnfirebase.io/
- **React Native Gifted Chat**: https://github.com/FaridSafi/react-native-gifted-chat
- **Expo Documentation**: https://docs.expo.dev/

---

## License

MIT

---

**Last Updated**: 2025-10-28  
**Documentation Version**: 1.0  
**Library**: rn-firebase-chat

