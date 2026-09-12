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
import { PRODUCTS } from "@/data/catalog";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function HomePage() {
  const laptops = PRODUCTS.filter((p) => p.category === "laptops");
  const phones = PRODUCTS.filter((p) => p.category === "smartphones" || p.category === "iphones");
  const accessories = PRODUCTS.filter((p) => p.category === "accessories");
  const best = [...PRODUCTS].sort((a, b) => b.soldCount - a.soldCount);
  const fresh = PRODUCTS.filter((p) => p.isNew);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      <Hero />
      <div className="border-b border-slate-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-2 py-3 text-center text-[11px] font-bold text-slate-600 sm:grid-cols-4">
          <span>✓ Authentic Products</span>
          <span>✓ M-Pesa Payments</span>
          <span>✓ Fast Delivery</span>
          <span>✓ Expert Support</span>
        </div>
      </div>
      <AdSlot placement="HOMEPAGE" target="below-hero" />
      <CategoryGrid />
      <DealsSection />
      <AdSlot placement="HOMEPAGE" target="below-deals" />
      <ProductRow title="What Kenya Is Buying" kicker="Best sellers" href="/best-sellers" items={best} />
      <ProductRow title="Just Landed" kicker="New arrivals" href="/new-arrivals" items={[...fresh, ...PRODUCTS].slice(0, 8)} />
      <ProductRow title="Laptops for Work, School & Play" kicker="Laptop showcase" href="/laptops" items={laptops} dark />
      <ProductRow title="Phones & iPhones Kenyans Love" kicker="Smartphones" href="/phones" items={phones} />
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
