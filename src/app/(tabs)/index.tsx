import { SafeAreaView } from '@/components/custom-native-components';
import ListHeading from '@/components/ListHeading';
import SubCard from '@/components/SubCard';
import UpcomingSubCard from '@/components/UpcomingSubCard';
import '@/global.css';
import { posthog } from '@/lib/posthog';
import { formatCurrency } from '@/lib/utils';
import { useUser } from '@clerk/expo';
import { format } from 'date-fns';
import { PlusIcon } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  UPCOMING_SUBSCRIPTIONS,
} from '../../../constants/data';
import images from '../../../constants/images';

type HeaderComponentProps = {
  userName: string;
  avatarSource: typeof images.avatar | { uri: string };
  email: string | undefined;
};

const HeaderComponent = ({
  userName,
  avatarSource,
  email,
}: HeaderComponentProps) => (
  <>
    <View className="home-header">
      <View className="home-user">
        <Image source={avatarSource} className="home-avatar" />
        <View className="flex-1">
          <Text className="home-user-name">{userName}</Text>
          <Text className="ml-4 text-gray-500">{email}</Text>
        </View>
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
  const { isLoaded, user } = useUser();
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress.split('@')[0] ||
    (isLoaded ? 'there' : '');
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;
  const userMail = user?.primaryEmailAddress?.toString();

  const handleSubCardPress = (currId: string | null) => {
    const isExpanded = expandedSubId !== currId;
    setExpandedSubId(isExpanded ? currId : null);
    posthog?.capture('subscription_details_toggled', {
      subscription_id: currId,
      is_expanded: isExpanded,
    });
  };
  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <FlatList
        ListHeaderComponent={
          <HeaderComponent
            userName={userName}
            email={userMail}
            avatarSource={avatarSource}
          />
        }
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
