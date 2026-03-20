import { NavItem } from '@/types';

/**
 * Navigation configuration
 * Used by sidebar and Cmd+K bar.
 */
export const navItems: NavItem[] = [
  {
    title: 'Top Management',
    url: '/dashboard/exec',
    icon: 'exec',
    isActive: true,
    shortcut: ['t', 't'],
    items: [
      { title: 'Overall ROI', url: '/dashboard/exec' },
      { title: 'Cashback Impact', url: '/dashboard/exec/cashback-impact' }
    ]
  },
  {
    title: 'Product Manager',
    url: '/dashboard/cashback',
    icon: 'cashback',
    isActive: false,
    shortcut: ['p', 'p'],
    items: []
  },
  {
    title: 'Communications',
    url: '/dashboard/communications',
    icon: 'communications',
    isActive: false,
    shortcut: ['c', 'c'],
    items: []
  },
  {
    title: 'Dictionaries',
    url: '/dashboard/cashback/dictionaries',
    icon: 'workspace',
    isActive: false,
    shortcut: ['d', 'v'],
    items: []
  },
  {
    title: 'Reports',
    url: '/dashboard/reports/quick-cashback-refund',
    icon: 'reports',
    isActive: false,
    shortcut: ['z', 'v'],
    items: [
      {
        title: 'Quick Withdrawal + Refund',
        url: '/dashboard/reports/quick-cashback-refund'
      }
    ]
  }
];
