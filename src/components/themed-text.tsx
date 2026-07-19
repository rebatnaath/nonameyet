import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
};

export function ThemedText({ style, type = 'default', className = '', ...rest }: ThemedTextProps) {
  let baseClass = 'text-slate-900 dark:text-white font-medium';

  switch (type) {
    case 'title':
      baseClass = 'text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white';
      break;
    case 'subtitle':
      baseClass = 'text-2xl font-bold tracking-tight text-slate-900 dark:text-white';
      break;
    case 'small':
      baseClass = 'text-sm text-slate-500 dark:text-slate-400';
      break;
    case 'smallBold':
      baseClass = 'text-sm font-bold text-slate-800 dark:text-slate-200';
      break;
    case 'link':
      baseClass = 'text-sm text-slate-500 dark:text-slate-400 underline';
      break;
    case 'linkPrimary':
      baseClass = 'text-sm text-indigo-600 dark:text-indigo-400 font-semibold';
      break;
    case 'code':
      baseClass = 'font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200';
      break;
    case 'default':
    default:
      baseClass = 'text-base text-slate-700 dark:text-slate-300';
      break;
  }

  return (
    <Text
      className={`${baseClass} ${className}`}
      style={style}
      {...rest}
    />
  );
}
