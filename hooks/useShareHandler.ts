import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';

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
      
      // Handle Android share intent URLs
      if (url.startsWith('linkset://')) {
        const parsed = Linking.parse(url);
        const { queryParams } = parsed;
        
        // Extract shared content from query parameters
        if (queryParams) {
          const content: SharedContent = {};
          
          // Check for URL in different parameter names
          if (queryParams.url) content.url = queryParams.url as string;
          if (queryParams.text) content.text = queryParams.text as string;
          if (queryParams.title) content.title = queryParams.title as string;
          
          // Sometimes text contains the URL
          if (!content.url && content.text && isValidUrl(content.text)) {
            content.url = content.text;
          }
          
          if (content.url || content.text) {
            setSharedContent(content);
          }
        }
      }
      
      // Handle direct URL sharing (backup)
      else if (isValidUrl(url)) {
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

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const clearSharedContent = () => {
    setSharedContent(null);
  };

  return { sharedContent, clearSharedContent };
};