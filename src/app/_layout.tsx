import '@/global.css';
import { ClerkProvider, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, usePathname } from 'expo-router';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect, useRef } from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { posthog } from '@/lib/posthog';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file to enable Clerk auth.',
  );
}

const PostHogIdentity = () => {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      posthog?.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress ?? '',
        name: user.fullName,
      });
    }
  }, [isLoaded, user]);

  return null;
};

export default function RootLayout() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
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

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog?.screen(pathname, {
        previous_screen: previousPathname.current,
      });
      previousPathname.current = pathname;
    }
  }, [pathname]);

  if (!fontsLoaded) return null;

  const app = (
    <ClerkProvider
      publishableKey={publishableKey ?? ''}
      tokenCache={tokenCache}
    >
      <PostHogIdentity />
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );

  return (
    <GluestackUIProvider mode="light">
      {posthog ? (
        <PostHogProvider
          client={posthog}
          autocapture={{ captureScreens: false, captureTouches: true }}
        >
          {app}
        </PostHogProvider>
      ) : (
        app
      )}
    </GluestackUIProvider>
  );
}
