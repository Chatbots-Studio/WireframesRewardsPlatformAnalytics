import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'About'
};

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl'>
        <div className='mb-12 text-center'>
          <h1 className='text-foreground text-3xl font-bold tracking-tight sm:text-4xl'>
            {t('title')}
          </h1>
          <p className='text-muted-foreground mt-4 text-lg'>
            {t('subtitle')}
          </p>
        </div>

        <div className='space-y-8'>
          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>
              {t('openSourceTitle')}
            </h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              {t('openSourceDescription')}
            </p>
          </section>

          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>
              {t('demoPurposeTitle')}
            </h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              {t('demoPurposeDescription')}
            </p>
          </section>

          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>
              {t('dataPrivacyTitle')}
            </h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              {t('dataPrivacyDescription')}
            </p>
          </section>
        </div>

        <div className='mt-12 text-center'>
          <p className='text-muted-foreground text-sm'>
            {t('footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
