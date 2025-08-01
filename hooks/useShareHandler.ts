import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import * as IntentLauncher from 'expo-intent-launcher';

interface SharedContent {
  url?: string;
  title?: string;
  text?: string;
}

export const useShareHandler = () => {
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);

  useEffect(() => {
    // Handle initial URL when app is opened via share
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        parseSharedContent(initialUrl);
      }
    };

    // Handle URL when app is already running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      parseSharedContent(url);
    });

    handleInitialURL();
    return () => subscription?.remove();
  }, []);

  const parseSharedContent = (url: string) => {
    try {
      console.log('Received URL:', url);
      
      // For Android intent data
      if (url.includes('linkset://share')) {
        const parsed = Linking.parse(url);
        const { queryParams } = parsed;
        
        if (queryParams?.url || queryParams?.text) {
          setSharedContent({
            url: queryParams.url as string,
            title: queryParams.title as string,
            text: queryParams.text as string,
          });
        }
      }
      
      // Direct URL sharing
      if (url.startsWith('http://') || url.startsWith('https://')) {
        setSharedContent({
          url: url,
          title: '',
          text: url,
        });
      }
    } catch (error) {
      console.error('Error parsing shared content:', error);
    }
  };

  const clearSharedContent = () => {
    setSharedContent(null);
  };

  return { sharedContent, clearSharedContent };
};