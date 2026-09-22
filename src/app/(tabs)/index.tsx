import '@/global.css';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background space-y-2">
      <Text className="text-xl font-bold text-sky-500">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="underline">
        Go to Onboarding
      </Link>
      <Link
        href="/(auth)/login"
        className="py-4 px-2 bg-primary text-white rounded-md"
      >
        Sign In
      </Link>
      <Link href="/subs/spotify">Spotify Subscription</Link>
      <Link href={{ pathname: '/subs/[id]', params: { id: 'claude' } }}>
        Claude Pro Subs
      </Link>
      <Text className="font-black text-sky-500 animate-spin">—</Text>
    </View>
  );
}
