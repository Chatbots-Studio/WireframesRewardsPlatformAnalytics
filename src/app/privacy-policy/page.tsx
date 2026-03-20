import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: {
    index: false
  }
};

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('privacy');

  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8'>
        <h1 className='text-foreground text-3xl font-bold'>{t('title')}</h1>

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
            {t('dataCollectionTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('dataCollectionText')}
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            {t('noDataMisuseTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('noDataMisuseText')}
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            {t('demoApplicationTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('demoApplicationText')}
          </p>
        </section>

        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            {t('contactTitle')}
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t('contactText')}{' '}
            <a
              href={`mailto:${t('contactEmail')}`}
              className='text-primary font-medium hover:underline'
            >
              {t('contactEmail')}
            </a>
            .
          </p>
        </section>

        <div className='border-border border-t pt-4'>
          <p className='text-muted-foreground text-sm'>
            {t('lastUpdated')}
          </p>
        </div>
      </div>
    </div>
  );
}
