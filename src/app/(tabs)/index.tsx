import { SafeAreaView } from '@/components/custom-native-components';
import '@/global.css';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <Text className="text-xl font-bold text-sky-500">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 py-4 px-2 bg-primary text-white rounded-full text-center"
      >
        Go to Onboarding
      </Link>
      <Link
        href="/(auth)/login"
        className="mt-4 py-4 px-2 bg-primary text-white rounded-full text-center"
      >
        Sign In
      </Link>
      <Link
        href="/subs/spotify"
        className="mt-4 py-4 px-2 bg-primary text-white rounded-full text-center"
      >
        Spotify Subscription
      </Link>
      <Link
        href={{ pathname: '/subs/[id]', params: { id: 'claude' } }}
        className="mt-4 py-4 px-2 bg-primary text-white rounded-full text-center"
      >
        Claude Pro Subs
      </Link>
      <View className="justify-center items-center mt-10">
        <Text className="font-black text-sky-500 animate-spin">—</Text>
      </View>
    </SafeAreaView>
  );
}
