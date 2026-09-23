import { SafeAreaView } from '@/components/custom-native-components';
import { Link } from 'expo-router';
import { Text } from 'react-native';
const Login = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <Text>Login</Text>
      <Link href="/(auth)/register">Create Account</Link>
      <Link href="/">Homebrew</Link>
    </SafeAreaView>
  );
};

export default Login;
