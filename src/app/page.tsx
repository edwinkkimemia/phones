import {
  Hero,
  CategoryGrid,
  DealsSection,
  ProductRow,
  BrandGrid,
  WhyUs,
  Reviews,
  DeliverySection,
  NewsletterCTA,
} from "@/components/home";
import AdSlot from "@/components/AdSlot";
import Link from "next/link";
import { PRODUCTS } from "@/data/catalog";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { shuffled, rotate } from "@/lib/rotation";

// Re-render hourly so daily-rotated picks (hero features, showcases)
// stay fresh without redeploying.
export const revalidate = 3600;

export default function HomePage() {
  // Every section rotates daily — no two days show identical picks.
  const laptops = shuffled(PRODUCTS.filter((p) => p.category === "laptops"), "home-laptops");
  const phones = shuffled(PRODUCTS.filter((p) => p.category === "phones" || p.category === "iphones"), "home-phones");
  const accessories = shuffled(PRODUCTS.filter((p) => p.category === "accessories"), "home-accessories");
  const best = rotate([...PRODUCTS].sort((a, b) => b.soldCount - a.soldCount), "home-best");
  const fresh = shuffled(PRODUCTS.filter((p) => p.isNew), "home-new");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      <Hero />
      <div className="border-b border-slate-100 bg-white">
        <div className="container-x flex items-center justify-center gap-x-5 gap-y-1 overflow-x-auto py-3 text-center text-[11px] font-bold text-slate-600 no-scrollbar sm:grid sm:grid-cols-4">
          <Link href="/delivery" className="shrink-0 hover:text-brand-700">✓ Same-day Nairobi delivery</Link>
          <Link href="/delivery" className="shrink-0 hover:text-brand-700">✓ M-Pesa &amp; pay on delivery</Link>
          <Link href="/warranty" className="shrink-0 hover:text-brand-700">✓ 1-year warranty included</Link>
          <Link href="/contact" className="shrink-0 hover:text-brand-700">✓ Nairobi pickup available</Link>
        </div>
      </div>
      <AdSlot placement="HOMEPAGE" target="below-hero" />
      <CategoryGrid />
      <DealsSection />
      <AdSlot placement="HOMEPAGE" target="below-deals" />
      <ProductRow title="What Kenya Is Buying" kicker="Best sellers" href="/best-sellers" items={best} />
      <ProductRow title="Just Landed" kicker="New arrivals" href="/new-arrivals" items={[...fresh, ...PRODUCTS].slice(0, 8)} />
      <ProductRow title="Laptops for Work, School & Play" kicker="Laptop showcase" href="/laptops" items={laptops} dark />
      <ProductRow title="Phones & iPhones Kenyans Love" kicker="Phones" href="/phones" items={phones} />
      <BrandGrid />
      <ProductRow title="Complete Your Setup" kicker="Accessories" href="/accessories" items={accessories} />
      <WhyUs />
      <Reviews />
      <DeliverySection />
      <AdSlot placement="HOMEPAGE" target="above-footer" />
      <NewsletterCTA />
    </>
  );
}
