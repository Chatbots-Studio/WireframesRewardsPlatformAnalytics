'use client';
import { useTranslations } from 'next-intl';
import { navItems } from '@/config/nav-config';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useFilteredNavItems } from '@/hooks/use-nav';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const filteredItems = useFilteredNavItems(navItems);
  const t = useTranslations('search');
  const tNav = useTranslations('nav');

  // Resolve nav item title via i18n key if available
  const navTitle = (item: { title: string; titleKey?: string }) =>
    item.titleKey ? tNav(item.titleKey) : item.title;

  const actions = useMemo(() => {
    const navigateTo = (url: string) => {
      router.push(url);
    };

    return filteredItems.flatMap((navItem) => {
      const name = navTitle(navItem);
      const baseAction =
        navItem.url !== '#'
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name,
              shortcut: navItem.shortcut,
              keywords: `${navItem.title.toLowerCase()} ${name.toLowerCase()}`,
              section: t('navigation'),
              subtitle: t('goTo', { title: name }),
              perform: () => navigateTo(navItem.url)
            }
          : null;

      const childActions =
        navItem.items?.map((childItem) => {
          const childName = navTitle(childItem);
          return {
            id: `${childItem.title.toLowerCase()}Action`,
            name: childName,
            shortcut: childItem.shortcut,
            keywords: `${childItem.title.toLowerCase()} ${childName.toLowerCase()}`,
            section: name,
            subtitle: t('goTo', { title: childName }),
            perform: () => navigateTo(childItem.url)
          };
        }) ?? [];

      return baseAction ? [baseAction, ...childActions] : childActions;
    });
  }, [router, filteredItems, t, tNav]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden' />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
