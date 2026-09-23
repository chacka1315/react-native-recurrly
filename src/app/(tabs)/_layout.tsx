import { tabs } from '@/../constants/data';
import clsx from 'clsx';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../constants/theme';

const TabIcon = ({ focused, icon }: TabIconProps) => {
  const RendredIcon = icon;
  return (
    <View className={clsx('tabs-icon', focused && 'text-accent')}>
      <RendredIcon color={focused ? '#ea7a53' : '#000'} />
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          height: 55,
        },

        tabBarActiveTintColor: colors.accent,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarLabel: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
