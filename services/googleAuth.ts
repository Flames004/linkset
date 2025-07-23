// app/services/googleAuth.ts
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import {
  useAuthRequest,
  makeRedirectUri,
  ResponseType,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { auth } from "./firebase";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!; // From Firebase Console OAuth credentials

export const useGoogleAuth = () => {
  const redirectUri = makeRedirectUri({
    useProxy: true,
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri,
      scopes: ["profile", "email"],
      responseType: ResponseType.IdToken,
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    }
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch((err) => {
        console.error("Google sign-in error:", err);
      });
    }
  }, [response]);

  return { request, promptAsync };
};
