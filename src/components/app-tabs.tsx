import { NativeTabs, Label, Icon } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'nativewind';

import { Colors } from '@/constants/theme';
import { TabRoutes } from '@/constants/tabs';

export default function AppTabs() {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      {TabRoutes.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Label>{tab.label}</Label>
          <Icon src={tab.icon} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

