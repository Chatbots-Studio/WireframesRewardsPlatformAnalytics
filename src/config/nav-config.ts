import { NavItem } from '@/types';

/**
 * Navigation configuration
 * Used by sidebar and Cmd+K bar.
 * titleKey is resolved via useTranslations('nav') for i18n support.
 */
export const navItems: NavItem[] = [
  {
    title: 'Top Management',
    titleKey: 'topManagement',
    url: '/dashboard/exec',
    icon: 'exec',
    isActive: true,
    shortcut: ['t', 't'],
    items: [
      {
        title: 'Overall ROI',
        titleKey: 'overallRoi',
        url: '/dashboard/exec'
      },
      {
        title: 'Cashback Impact',
        titleKey: 'cashbackImpact',
        url: '/dashboard/exec/cashback-impact'
      }
    ]
  },
  {
    title: 'Product Manager',
    titleKey: 'productManager',
    url: '/dashboard/cashback',
    icon: 'cashback',
    isActive: false,
    shortcut: ['p', 'p'],
    items: []
  },
  {
    title: 'Communications',
    titleKey: 'communications',
    url: '/dashboard/communications',
    icon: 'communications',
    isActive: false,
    shortcut: ['c', 'c'],
    items: []
  },
  {
    title: 'Dictionaries',
    titleKey: 'dictionaries',
    url: '/dashboard/cashback/dictionaries',
    icon: 'workspace',
    isActive: false,
    shortcut: ['d', 'v'],
    items: []
  },
  {
    title: 'Reports',
    titleKey: 'reports',
    url: '/dashboard/reports/quick-cashback-refund',
    icon: 'reports',
    isActive: false,
    shortcut: ['z', 'v'],
    items: [
      {
        title: 'Quick Withdrawal + Refund',
        titleKey: 'quickWithdrawalRefund',
        url: '/dashboard/reports/quick-cashback-refund'
      }
    ]
  }
];
