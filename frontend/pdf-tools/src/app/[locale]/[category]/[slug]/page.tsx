import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ToolClient } from '@/components/ToolClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchPluginData(slug: string, lang: string) {
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

interface PageProps {
  params: Promise<{
    locale: string;
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const plugin = await fetchPluginData(slug, locale);

  if (!plugin) return {};

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pdf-tools.example.com';
  const title = plugin.ui?.title || `${plugin.config?.name} - PDF-TOOLS`;
  const description = plugin.ui?.description || '';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/${category}/${slug}`,
      languages: {
        en: `${baseUrl}/en/${category}/${slug}`,
        zh: `${baseUrl}/zh/${category}/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { locale, category, slug } = await params;
  const plugin = await fetchPluginData(slug, locale);

  if (!plugin) {
    notFound();
  }

  return (
    <ToolClient
      pluginData={plugin}
      locale={locale}
      categoryId={category}
      slug={slug}
    />
  );
}
