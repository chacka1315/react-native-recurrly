import { SafeAreaView } from '@/components/custom-native-components';
import { Link } from 'expo-router';
import { Text } from 'react-native';

const Register = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <Text>Register</Text>
      <Link href="/(auth)/login">Sign In</Link>
    </SafeAreaView>
  );
};

export default Register;
