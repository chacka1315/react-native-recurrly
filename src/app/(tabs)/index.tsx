import { SafeAreaView } from '@/components/custom-native-components';
import ListHeading from '@/components/ListHeading';
import SubCard from '@/components/SubCard';
import UpcomingSubCard from '@/components/UpcomingSubCard';
import '@/global.css';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { PlusIcon } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from '../../../constants/data';
import images from '../../../constants/images';

const HeaderComponent = () => (
  <>
    <View className="home-header">
      <View className="home-user">
        <Image source={images.avatar} className="home-avatar" />
        <Text className="home-user-name truncate">{HOME_USER.name}</Text>
      </View>
      <View className="home-add-con border rounded-full p-2 border-gray-300">
        <PlusIcon />
      </View>
    </View>
    <View className="home-balance-card">
      <Text className="home-balance-label">Balance</Text>
      <View className="home-balance-row">
        <Text className="home-balance-amount  font-black">
          {formatCurrency(HOME_BALANCE.amount, 'USD', 'en-US')}
        </Text>
        <Text className="home-balance-date">
          {format(HOME_BALANCE.nextRenewalDate, 'PP')}
        </Text>
      </View>
    </View>
    <View className="mb-5">
      <ListHeading title="Upcoming" />
      <FlatList
        data={UPCOMING_SUBSCRIPTIONS}
        renderItem={({ item }) => <UpcomingSubCard data={item} />}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No upcoming renewals yet...</Text>
        }
      />
    </View>
    <ListHeading title="Subscriptions" />
  </>
);

export default function App() {
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const handleSubCardPress = (currId: string | null) => {
    expandedSubId === currId
      ? setExpandedSubId(null)
      : setExpandedSubId(currId);
  };
  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <FlatList
        ListHeaderComponent={<HeaderComponent />}
        data={HOME_SUBSCRIPTIONS}
        renderItem={({ item }) => (
          <SubCard
            {...item}
            expanded={expandedSubId === item.id}
            onPress={() => handleSubCardPress(item.id)}
          />
        )}
        ItemSeparatorComponent={<View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet...</Text>
        }
      />
    </SafeAreaView>
  );
}
