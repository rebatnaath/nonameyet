import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  type?: 'default' | 'element' | 'selected';
};

export function ThemedView({ style, type = 'default', className = '', ...rest }: ThemedViewProps) {
  let baseClass = 'bg-slate-50 dark:bg-slate-900';

  if (type === 'element') {
    baseClass = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
  } else if (type === 'selected') {
    baseClass = 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50';
  }

  return (
    <View
      className={`${baseClass} ${className}`}
      style={style}
      {...rest}
    />
  );
}
