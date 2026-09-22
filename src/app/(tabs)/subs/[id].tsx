import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

const SubsDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Subscription details : {id}</Text>
      <Link href="../(tabs)/index.tsx">Go back</Link>
    </View>
  );
};

export default SubsDetails;
