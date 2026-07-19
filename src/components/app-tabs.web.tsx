import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, Text } from 'react-native';

import { ExternalLink } from './external-link';
import { TabRoutes } from '@/constants/tabs';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {TabRoutes.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} className="active:opacity-70">
      <View
        className={`py-1.5 px-4 rounded-xl transition-all duration-200 ${
          isFocused 
            ? 'bg-indigo-600 shadow-md shadow-indigo-600/30' 
            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        <Text 
          className={`text-sm font-semibold tracking-wide ${
            isFocused 
              ? 'text-white' 
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} className="absolute bottom-0 w-full p-4 flex-row justify-center items-center z-50">
      <View className="flex-row items-center flex-1 max-w-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md py-3 px-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl justify-between">
        <Text className="text-lg font-black tracking-tight text-indigo-600 dark:text-indigo-400 mr-auto">
          Photo Reveal <Text className="text-slate-900 dark:text-white">📸</Text>
        </Text>

        <View className="flex-row gap-2">
          {props.children}
        </View>

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable className="flex-row items-center gap-1 ml-4 active:opacity-70">
            <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              Docs
            </Text>
          </Pressable>
        </ExternalLink>
      </View>
    </View>
  );
}
