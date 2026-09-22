import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const Register = () => {
  return (
    <View>
      <Text>Register</Text>
      <Link href="/(auth)/login">Sign In</Link>
    </View>
  );
};

export default Register;
