SplashScreen.preventAutoHideAsync();

import '@/global.css';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file to enable Clerk auth.',
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require('@/../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('@/../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('@/../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semiBold': require('@/../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extraBold': require('@/../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('@/../assets/fonts/PlusJakartaSans-Light.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GluestackUIProvider mode="light">
      <ClerkProvider
        publishableKey={publishableKey ?? ''}
        tokenCache={tokenCache}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </ClerkProvider>
    </GluestackUIProvider>
  );
}
