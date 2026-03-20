import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Terms of Service',
  robots: {
    index: false
  }
};

export default async function TermsOfServicePage() {
  const t = await getTranslations('terms');

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8'>
        <div className='text-center'>
          <h1 className='text-foreground text-3xl font-bold'>
            {t('title')}
          </h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            {t('lastUpdated', { date: formattedDate })}
          </p>
        </div>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            {t('introductionTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('introductionText')}
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            {t('demoPurposeTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('demoPurposeText')}
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            {t('openSourceTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('openSourceText')}
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            {t('noWarrantyTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('noWarrantyText')}
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            {t('dataUsageTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('dataUsageText')}
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            {t('changesTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('changesText')}
          </p>
        </section>

        <section className='border-border border-t pt-4'>
          <p className='text-muted-foreground text-center text-sm'>
            {t('contactText')}
          </p>
        </section>
      </div>
    </div>
  );
}
