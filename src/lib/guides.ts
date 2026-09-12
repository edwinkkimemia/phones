import { prisma } from "@/lib/prisma";
import { GUIDES, type Guide as StaticGuide } from "@/data/guides";

export interface GuideSection {
  h: string;
  body: string;
}

export interface GuideListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover?: string | null;
  updated: string;
  readMins: number;
  keywords: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuideFull extends GuideListItem {
  intro: string;
  sections: GuideSection[];
  relatedSlugs: string[];
  faqs: [string, string][];
  published: boolean;
}

function asSections(v: unknown): GuideSection[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((s): s is { h: unknown; body: unknown } => typeof s === "object" && s !== null)
    .map((s) => ({ h: String((s as { h: unknown }).h ?? ""), body: String((s as { body: unknown }).body ?? "") }))
    .filter((s) => s.h || s.body);
}

function asFaqs(v: unknown): [string, string][] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((f): f is [unknown, unknown] => Array.isArray(f))
    .map(([q, a]) => [String(q ?? ""), String(a ?? "")] as [string, string])
    .filter(([q, a]) => q || a);
}

function toListItem(g: {
  id: string; slug: string; title: string; description: string; cover?: string | null;
  updated: string; readMins: number; keywords: string[]; views: number;
  createdAt: Date; updatedAt: Date;
}): GuideListItem {
  return { ...g };
}

// Static fallback so guides render even before migrate/seed runs.
function staticList(): GuideListItem[] {
  const now = new Date();
  return GUIDES.map((g, i) => ({
    id: `static-${g.slug}`,
    slug: g.slug,
    title: g.title,
    description: g.description,
    cover: g.cover ?? null,
    updated: g.updated,
    readMins: g.readMins,
    keywords: g.keywords,
    views: 0,
    createdAt: now,
    updatedAt: new Date(now.getTime() - i * 1000),
  }));
}

function staticFull(slug: string): GuideFull | null {
  const g: StaticGuide | undefined = GUIDES.find((x) => x.slug === slug);
  if (!g) return null;
  const now = new Date();
  return {
    id: `static-${g.slug}`,
    slug: g.slug,
    title: g.title,
    description: g.description,
    cover: g.cover ?? null,
    updated: g.updated,
    readMins: g.readMins,
    keywords: g.keywords,
    views: 0,
    createdAt: now,
    updatedAt: now,
    intro: g.intro,
    sections: g.sections,
    relatedSlugs: g.relatedSlugs,
    faqs: g.faqs,
    published: true,
  };
}

// Server-side reads (guides pages). Never fetch HTTP to own domain.
export async function getPublishedGuides(): Promise<GuideListItem[]> {
  try {
    const rows = await prisma.guide.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
    });
    if (rows.length > 0) return rows.map(toListItem);
  } catch {
    /* fall through to static */
  }
  return staticList();
}

export async function getPublishedGuide(slug: string): Promise<GuideFull | null> {
  try {
    const g = await prisma.guide.findUnique({ where: { slug } });
    if (g && g.published) {
      prisma.guide
        .update({ where: { slug }, data: { views: { increment: 1 } } })
        .catch(() => null);
      return {
        ...toListItem(g),
        intro: g.intro,
        sections: asSections(g.sections),
        relatedSlugs: g.relatedSlugs,
        faqs: asFaqs(g.faqs),
        published: g.published,
      };
    }
    if (g) return null; // exists but draft
  } catch {
    /* fall through to static */
  }
  return staticFull(slug);
}

// Static slugs for generateStaticParams fallback.
export function staticGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}
