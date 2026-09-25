import { SafeAreaView } from '@/components/custom-native-components';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { posthog } from '@/lib/posthog';
import { useClerk } from '@clerk/expo';
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const Settings = () => {
  const { signOut } = useClerk();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      posthog?.capture('user_signed_out');
      posthog?.logger.info('session sign-out completed', {
        flow: 'sign_out',
      });
      posthog?.reset();
      setIsDialogOpen(false);
      router.replace('/(auth)/login');
    } catch (error) {
      posthog?.captureException(error, { auth_flow: 'sign_out' });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="flex-1">
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>

        <View className="mt-8 rounded-2xl border border-border bg-card p-4">
          <Text className="text-lg font-sans-semibold text-primary">
            Account
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Manage your Recurrly account.
          </Text>

          <Button
            className="mt-5 self-start"
            variant="destructive"
            onPress={() => setIsDialogOpen(true)}
          >
            <ButtonIcon as={LogOut} />
            <ButtonText>Sign out</ButtonText>
          </Button>
        </View>
      </View>

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={() => {
          if (!isSigningOut) {
            setIsDialogOpen(false);
          }
        }}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text className="text-xl font-sans-bold text-primary">
              Sign out?
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3">
            <Text className="text-base text-muted-foreground">
              You will need to sign in again to access your subscriptions.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onPress={() => setIsDialogOpen(false)}
              disabled={isSigningOut}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              variant="destructive"
              onPress={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : null}
              <ButtonText>Sign out</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
};

export default Settings;
