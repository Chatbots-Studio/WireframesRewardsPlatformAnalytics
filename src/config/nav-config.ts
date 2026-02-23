import { NavItem } from '@/types';

/**
 * Navigation configuration
 * Used by sidebar and Cmd+K bar.
 */
export const navItems: NavItem[] = [
  {
    title: 'Топ-менеджмент',
    url: '/dashboard/exec',
    icon: 'exec',
    isActive: false,
    shortcut: ['t', 't'],
    items: []
  },
  {
    title: 'Продакт-менеджер',
    url: '/dashboard/cashback',
    icon: 'cashback',
    isActive: false,
    shortcut: ['p', 'p'],
    items: []
  },
  {
    title: 'Комунікації',
    url: '/dashboard/communications',
    icon: 'communications',
    isActive: false,
    shortcut: ['c', 'c'],
    items: []
  }
];
