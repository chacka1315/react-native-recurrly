import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import clsx from 'clsx';
import { format } from 'date-fns';
import {
  CalendarClockIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  PackageOpenIcon,
  SignpostIcon,
} from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

const SubCard = ({
  name,
  price,
  icon,
  currency,
  billing,
  color,
  category,
  plan,
  renewalDate,
  onPress,
  expanded,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx('sub-card', expanded ? 'sub-card-exoanded' : 'bg-card')}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatRelativeDate(renewalDate) : '')}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-biling">{billing}</Text>
        </View>
      </View>
      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <View className="flex-row items-center gap-2">
                  <CreditCardIcon size={16} />
                  <Text className="sub-label">Payments :</Text>
                </View>

                <Text className="sub-value" numberOfLines={1}>
                  {paymentMethod?.trim()}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <View className="flex-row items-center gap-2">
                  <PackageOpenIcon size={16} />
                  <Text className="sub-label">Category :</Text>
                </View>

                <Text className="sub-value" numberOfLines={1}>
                  {category?.trim() || plan?.trim() || '--'}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <View className="flex-row items-center gap-2">
                  <CalendarDaysIcon size={16} />
                  <Text className="sub-label">Started :</Text>
                </View>

                <Text className="sub-value" numberOfLines={1}>
                  {startDate ? format(startDate, 'PP') : '--'}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <View className="flex-row items-center gap-2">
                  <CalendarClockIcon size={16} />
                  <Text className="sub-label">Renewal date :</Text>
                </View>

                <Text className="sub-value" numberOfLines={1}>
                  {renewalDate ? format(renewalDate, 'PP') : '--'}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <View className="flex-row items-center gap-2">
                  <SignpostIcon size={16} />
                  <Text className="sub-label">Status :</Text>
                </View>

                <Text className="sub-value capitalize" numberOfLines={1}>
                  {status ? status : '--'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubCard;
