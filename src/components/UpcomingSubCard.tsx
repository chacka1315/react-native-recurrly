import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { Image, Text, View } from 'react-native';

const UpcomingSubCard = ({
  data: { name, price, dueDate, icon, currency },
}: {
  data: UpcomingSubscription;
}) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, currency || 'USD')}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {formatRelativeDate(dueDate)}
          </Text>
        </View>
      </View>
      <Text className="upcoming-name">{name}</Text>
    </View>
  );
};

export default UpcomingSubCard;
