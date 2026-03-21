'use client';

import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n/config';

const localeLabels: Record<Locale, string> = {
  en: '🇬🇧',
  uk: '🇺🇦'
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;

  const nextLocale: Locale =
    locales[(locales.indexOf(locale) + 1) % locales.length];

  function handleSwitch() {
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    // Full page reload is required so that NextIntlClientProvider
    // re-reads the cookie on the server and delivers new messages
    // to all client components (sidebar, kbar, etc.).
    window.location.reload();
  }

  return (
    <Button
      variant='secondary'
      size='icon'
      className='size-8 text-base'
      onClick={handleSwitch}
      title={`Switch to ${nextLocale.toUpperCase()}`}
    >
      {localeLabels[locale]}
      <span className='sr-only'>
        {locale === 'en' ? 'Переключити на українську' : 'Switch to English'}
      </span>
    </Button>
  );
}
