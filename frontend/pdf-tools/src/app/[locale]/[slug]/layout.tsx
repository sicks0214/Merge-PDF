import type { Metadata } from 'next';
import { locales } from '@/config';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolibox.com';

interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string; slug: string };
}

async function getPluginData(slug: string, lang: string) {
  try {
    const response = await fetch(`${API_BASE}/plugins/${slug}?lang=${lang}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale, slug } = params;
  const pluginData = await getPluginData(slug, locale);

  if (!pluginData) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool does not exist.',
    };
  }

  const { ui } = pluginData;
  const title = ui.title || 'PDF Tools';
  const description = ui.description || '';
  const canonicalUrl = `${SITE_URL}/${locale}/${slug}`;

  // Generate hreflang alternates
  const alternates: Record<string, string> = {};
  for (const lang of locales) {
    alternates[lang] = `${SITE_URL}/${lang}/${slug}`;
  }
  alternates['x-default'] = `${SITE_URL}/en/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Toolibox',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function SlugLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
