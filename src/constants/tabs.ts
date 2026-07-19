export const TabRoutes = [
  {
    name: 'index',
    href: '/(tabs)' as const,
    label: 'Home',
    icon: require('@/assets/images/tabIcons/home.png'),
  },
  {
    name: 'settings',
    href: '/(tabs)/settings' as const,
    label: 'Settings',
    icon: require('@/assets/images/tabIcons/explore.png'),
  },
] as const;
