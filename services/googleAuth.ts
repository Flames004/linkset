// app/services/googleAuth.ts
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';
import { Alert } from 'react-native';

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: undefined, // not needed unless you want ios
    // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    selectAccount: true,
  });

  const handleGoogleAuth = async () => {
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        const { id_token } = result.params;
        
        // Create a Google credential with the token
        const credential = GoogleAuthProvider.credential(id_token);
        
        // Sign-in the user with the credential
        return await signInWithCredential(auth, credential);
      } else {
        throw new Error('Google sign-in was cancelled or failed');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Sign-in error', error.message || 'An error occurred during Google sign-in');
      throw error;
    }
  };

  return { 
    request, 
    promptAsync: handleGoogleAuth 
  };
};
