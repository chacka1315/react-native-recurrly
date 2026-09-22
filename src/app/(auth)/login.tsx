import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const Login = () => {
  return (
    <View>
      <Text>Login</Text>
      <Link href="/(auth)/register">Create Account</Link>
      <Link href="/">Homebrew</Link>
    </View>
  );
};

export default Login;
