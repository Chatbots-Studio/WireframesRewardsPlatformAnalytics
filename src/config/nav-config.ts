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
    isActive: true,
    shortcut: ['t', 't'],
    items: [
      { title: 'Загальний ROI', url: '/dashboard/exec' },
      { title: 'Вплив кешбеків', url: '/dashboard/exec/cashback-impact' }
    ]
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
  },
  {
    title: 'Довідники',
    url: '/dashboard/cashback/dictionaries',
    icon: 'workspace',
    isActive: false,
    shortcut: ['d', 'v'],
    items: []
  },
  {
    title: 'Звіти',
    url: '/dashboard/reports/quick-cashback-refund',
    icon: 'reports',
    isActive: false,
    shortcut: ['z', 'v'],
    items: [
      {
        title: 'Швидкий вивід + повернення',
        url: '/dashboard/reports/quick-cashback-refund'
      }
    ]
  }
];
