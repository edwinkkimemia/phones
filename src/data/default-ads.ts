// Default image ads, shared by prisma/seed.ts and POST /api/ads/restore.
// update:{} semantics everywhere: admin edits in /admin are never clobbered.

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

interface DefaultAd {
  id: string;
  title: string;
  image: string;
  link: string;
  placement: "GLOBAL" | "HOMEPAGE" | "CATEGORY" | "PRODUCT" | "BLOG" | "GUIDES";
  target: string;
  format: "WIDE" | "SQUARE";
  sortOrder: number;
}

export const DEMO_ADS: DefaultAd[] = [
  {
    id: "demo-all-GLOBAL-WIDE",
    title: "Today's Tech Deals — Save up to 20%",
    image: img("photo-1607083206869-4c7672e72a8a"),
    link: "/deals",
    placement: "GLOBAL",
    target: "all",
    format: "WIDE",
    sortOrder: 0,
  },
  {
    id: "demo-laptops-CATEGORY-WIDE",
    title: "Laptop deals from KES 42,999",
    image: img("photo-1496181133206-80ce9b88a853"),
    link: "/laptops",
    placement: "CATEGORY",
    target: "laptops",
    format: "WIDE",
    sortOrder: 0,
  },
  {
    id: "demo-iphones-CATEGORY-WIDE",
    title: "iPhone 17 Pro — now in stock",
    image: img("photo-1592750475338-74b7b21085ab"),
    link: "/iphones/iphone-17-pro-256gb",
    placement: "CATEGORY",
    target: "iphones",
    format: "WIDE",
    sortOrder: 0,
  },
  {
    id: "demo-all-GLOBAL-SQUARE",
    title: "M-Pesa deals — pay on delivery available",
    image: img("photo-1556742049-0cfed4f6a45d", 800),
    link: "/deals",
    placement: "GLOBAL",
    target: "all",
    format: "SQUARE",
    sortOrder: 0,
  },
  {
    id: "demo-all-GLOBAL-SQUARE-2",
    title: "Complete your setup — accessories from KES 2,499",
    image: img("photo-1572569511254-d8f925fe2cbb", 800),
    link: "/accessories",
    placement: "GLOBAL",
    target: "all",
    format: "SQUARE",
    sortOrder: 1,
  },
  {
    id: "demo-below-hero-HOMEPAGE-WIDE",
    title: "New iPhones have landed — shop the 17 series",
    image: img("photo-1592750475338-74b7b21085ab"),
    link: "/iphones",
    placement: "HOMEPAGE",
    target: "below-hero",
    format: "WIDE",
    sortOrder: 0,
  },
  {
    id: "demo-below-deals-HOMEPAGE-WIDE",
    title: "Storage upgrades from KES 2,499 — SSDs, HDDs & more",
    image: img("photo-1597872200969-2b65d56bd16b"),
    link: "/storage",
    placement: "HOMEPAGE",
    target: "below-deals",
    format: "WIDE",
    sortOrder: 0,
  },
  {
    id: "demo-above-footer-HOMEPAGE-WIDE",
    title: "Everything tech, one trusted store — shop all departments",
    image: img("photo-1441986300917-64674bd600d8"),
    link: "/deals",
    placement: "HOMEPAGE",
    target: "above-footer",
    format: "WIDE",
    sortOrder: 0,
  },
  {
    id: "demo-blog-all-BLOG-WIDE",
    title: "Tech advice that saves you money — read the blog",
    image: img("photo-1496181133206-80ce9b88a853"),
    link: "/blog",
    placement: "BLOG",
    target: "all",
    format: "WIDE",
    sortOrder: 0,
  },
  {
    id: "demo-guides-all-GUIDES-WIDE",
    title: "Buying guides for Kenya — choose with confidence",
    image: img("photo-1518770660439-4636190af475"),
    link: "/guides",
    placement: "GUIDES",
    target: "all",
    format: "WIDE",
    sortOrder: 0,
  },
  {
    id: "demo-blog-all-BLOG-SQUARE",
    title: "Today's Tech Deals — save up to 20%",
    image: img("photo-1607083206869-4c7672e72a8a", 800),
    link: "/deals",
    placement: "BLOG",
    target: "all",
    format: "SQUARE",
    sortOrder: 0,
  },
  {
    id: "demo-blog-all-BLOG-SQUARE-2",
    title: "Complete your setup — accessories from KES 2,499",
    image: img("photo-1572569511254-d8f925fe2cbb", 800),
    link: "/accessories",
    placement: "BLOG",
    target: "all",
    format: "SQUARE",
    sortOrder: 1,
  },
  {
    id: "demo-guides-all-GUIDES-SQUARE",
    title: "Laptop deals from KES 42,999",
    image: img("photo-1496181133206-80ce9b88a853", 800),
    link: "/laptops",
    placement: "GUIDES",
    target: "all",
    format: "SQUARE",
    sortOrder: 0,
  },
  {
    id: "demo-guides-all-GUIDES-SQUARE-2",
    title: "M-Pesa deals — pay on delivery available",
    image: img("photo-1556742049-0cfed4f6a45d", 800),
    link: "/deals",
    placement: "GUIDES",
    target: "all",
    format: "SQUARE",
    sortOrder: 1,
  },
];

const CAT_IMAGE: Record<string, string> = {
  laptops: "photo-1496181133206-80ce9b88a853",
  desktops: "photo-1547082299-de196ea013d6",
  iphones: "photo-1592750475338-74b7b21085ab",
  phones: "photo-1511707171634-5f897ff02aa9",
  tablets: "photo-1544244015-0df4b3ffc6b0",
  wearables: "photo-1579586337278-3befd40fd17a",
  storage: "photo-1597872200969-2b65d56bd16b",
  "laptop-bags": "photo-1491637639811-60e2756cc1c7",
  "laptop-parts": "photo-1518770660439-4636190af475",
  "phone-parts": "photo-1601784551446-20c9e07cdbdb",
  accessories: "photo-1572569511254-d8f925fe2cbb",
  gaming: "photo-1593305841991-05c297ba4575",
  deals: "photo-1607083206869-4c7672e72a8a",
  "new-arrivals": "photo-1592750475338-74b7b21085ab",
  "best-sellers": "photo-1511707171634-5f897ff02aa9",
};

const CAT_TITLE: Record<string, string> = {
  laptops: "Laptop deals from KES 42,999",
  desktops: "Desktops for office & studio",
  iphones: "iPhone 17 Pro — now in stock",
  phones: "Phones & iPhones Kenyans love",
  tablets: "Tablets for work, study & play",
  wearables: "Smartwatches from KES 5,999",
  storage: "Storage upgrades from KES 2,499",
  "laptop-bags": "Padded, anti-theft laptop bags",
  "laptop-parts": "Genuine RAM, batteries & chargers",
  "phone-parts": "Original screens & batteries",
  accessories: "Chargers, audio & more from KES 2,499",
  gaming: "Gaming rigs & peripherals",
  deals: "Today's Tech Deals — save up to 20%",
  "new-arrivals": "Just landed — the newest tech",
  "best-sellers": "What Kenya is buying right now",
};

export const CATEGORY_ADS: DefaultAd[] = Object.keys(CAT_IMAGE).map((slug) => ({
  id: `cat-${slug}`,
  title: CAT_TITLE[slug],
  image: img(CAT_IMAGE[slug]),
  link: `/${slug}`,
  placement: "CATEGORY",
  target: slug,
  format: "WIDE",
  sortOrder: 0,
}));

export const ALL_DEFAULT_ADS: DefaultAd[] = [...DEMO_ADS, ...CATEGORY_ADS];
