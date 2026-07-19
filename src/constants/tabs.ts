export const TabRoutes = [
  {
    name: 'index',
    href: '/' as const,
    label: 'Home',
    icon: require('@/assets/images/tabIcons/home.png'),
  },
  {
    name: 'settings',
    href: '/settings' as const,
    label: 'Settings',
    icon: require('@/assets/images/tabIcons/explore.png'),
  },
] as const;
