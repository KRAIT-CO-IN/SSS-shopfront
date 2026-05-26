import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const categories = [
  { cid: "CAT-SWE", name: "Sweets",    slug: "sweets",    order: 1, status: "Published", img: "/assets/product-rekulu.png" },
  { cid: "CAT-SPI", name: "Spices",    slug: "spices",    order: 2, status: "Published", img: "/assets/product-karam.jpg" },
  { cid: "CAT-SAV", name: "Savouries", slug: "savouries", order: 3, status: "Published", img: "/assets/product-snack.jpg" },
  { cid: "CAT-POW", name: "Powders",   slug: "powders",   order: 4, status: "Published", img: "/assets/product-podi.jpg" },
  { cid: "CAT-FRU", name: "Fruits",    slug: "fruits",    order: 5, status: "Published", img: "/assets/product-pickle.jpg" },
  { cid: "CAT-PIC", name: "Pickles",   slug: "pickles",   order: 6, status: "Published", img: "/assets/product-pickle.jpg" },
];

const stdVariants = [
  { w: "250g", price: 0, disc: null, stock: 100, status: "Published" },
  { w: "500g", price: 0, disc: null, stock: 100, status: "Published" },
  { w: "1kg",  price: 0, disc: null, stock: 100, status: "Published" },
];

const products = [
  // Sweets
  {
    pid: "PRD-SWE-001", name: "Special Ghee Mysorepak", catSlug: "sweets",
    shortDesc: "Available only on Saturday & Sunday",
    fullDesc: "Melt-in-the-mouth Mysorepak made fresh in pure ghee. Available only on Saturday & Sunday — order early.",
    img: "/assets/product-rekulu.png",
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Saturday & Sunday Only", "Pure Ghee", "Hand-made"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SWE-002", name: "Boondi Laddu", catSlug: "sweets",
    shortDesc: "Available only on Saturday & Sunday",
    fullDesc: "Classic boondi laddu, soft and aromatic — prepared fresh every Saturday & Sunday.",
    img: "/assets/product-rekulu.png",
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Saturday & Sunday Only", "Festive Favorite"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SWE-003", name: "Jeedipappu Pakam (Cashew Sweet)", catSlug: "sweets",
    shortDesc: "Premium cashews glazed in sugar syrup",
    fullDesc: "Whole jeedipappu (cashews) coated in a delicate jaggery / sugar syrup — a traditional Andhra delicacy.",
    img: "/assets/product-rekulu.png",
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Premium Cashew", "No Preservatives"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SWE-004", name: "Pootha Rekulu", catSlug: "sweets",
    shortDesc: "Paper-thin Atreyapuram delicacy",
    fullDesc: "Wafer-thin rice sheets layered with pure ghee, sugar and dry-fruit filling.",
    img: "/assets/product-rekulu.png",
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Hand-made", "No Preservatives"],
    variants: stdVariants,
  },

  // Spices / Dry fruits & ghee section (as per xlsx grouping)
  {
    pid: "PRD-SPI-001", name: "Jumbo Cashew (Export Quality)", catSlug: "spices",
    shortDesc: "Export-grade whole jumbo cashews",
    fullDesc: "Premium export-quality jumbo cashews — large, uniform, crunchy. Perfect for gifting and daily snacking.",
    img: "/assets/product-karam.jpg",
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Export Quality", "Premium"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SPI-002", name: "Split Cashew (Export Quality)", catSlug: "spices",
    shortDesc: "Export-quality split cashews",
    fullDesc: "Hand-sorted split cashews — ideal for sweets, curries and baking.",
    img: "/assets/product-karam.jpg",
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Export Quality", "Versatile"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SPI-003", name: "Pure Buffalo Ghee (Home Made)", catSlug: "spices",
    shortDesc: "Home-made pure buffalo ghee",
    fullDesc: "Slow-churned buffalo ghee made the traditional bilona way. Rich aroma, golden colour.",
    img: "/assets/product-karam.jpg",
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Home Made", "Bilona", "Pure"],
    variants: stdVariants,
  },

  // Savouries
  {
    pid: "PRD-SAV-001", name: "Chekkalu (Home Made)", catSlug: "savouries",
    shortDesc: "Crunchy home-made rice crackers",
    fullDesc: "Crisp Andhra-style rice crackers with chana dal, curry leaves and sesame.",
    img: "/assets/product-snack.jpg",
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Home Made", "Crunchy"],
    variants: stdVariants,
  },

  // Powders
  {
    pid: "PRD-POW-001", name: "Nalla Karam — Karappodi (Home Made)", catSlug: "powders",
    shortDesc: "Smoky Andhra black podi for idli & dosa",
    fullDesc: "Slow-roasted urad dal, dry chilies and curry leaves — stone-ground to a coarse, fragrant podi.",
    img: "/assets/product-karam.jpg",
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Home Made", "No Preservatives", "Vegan"],
    variants: stdVariants,
  },

  // Fruits
  {
    pid: "PRD-FRU-001", name: "Ulavapadu Mangoes", catSlug: "fruits",
    shortDesc: "Seasonal — sweet Ulavapadu mangoes",
    fullDesc: "Hand-picked Ulavapadu mangoes — rich flavor, low fiber. Available in season only.",
    img: "/assets/product-pickle.jpg",
    price: 0, disc: null, discountLabel: "", stock: 100, lowAlert: 10,
    status: "Published", visible: true,
    tags: ["Seasonal", "Hand-picked"],
    variants: stdVariants,
  },

  // Pickles
  {
    pid: "PRD-PIC-001", name: "Home Made Pickles — Coming Soon", catSlug: "pickles",
    shortDesc: "Coming Soon",
    fullDesc: "Authentic Andhra home-made pickles — launching soon. Stay tuned.",
    img: "/assets/product-pickle.jpg",
    price: 0, disc: null, discountLabel: "", stock: 0, lowAlert: 0,
    status: "Published", visible: true,
    tags: ["Coming Soon", "Home Made"],
    variants: stdVariants,
  },
];

async function run() {
  console.log("Seeding…");

  // Admin
  const email = (process.env.ADMIN_EMAIL || "admin@sssfoodworld.com").toLowerCase();
  const pwHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
  await prisma.admin.upsert({
    where: { email },
    create: { email, password: pwHash, name: "Admin User", role: "Super Admin" },
    update: {},
  });

  // Categories
  const catMap = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { cid: c.cid },
      create: c,
      update: c,
    });
    catMap[c.slug] = row;
  }

  // Drop legacy categories not in new set (so old "Pastes", "Chutneys", "Gift Packs" disappear)
  const keepSlugs = categories.map((c) => c.slug);
  await prisma.category.updateMany({
    where: { slug: { notIn: keepSlugs } },
    data: { status: "Draft" },
  });

  // Drop legacy products not in new pid list (mark unpublished)
  const keepPids = products.map((p) => p.pid);
  await prisma.product.updateMany({
    where: { pid: { notIn: keepPids } },
    data: { status: "Out of Stock", visible: false },
  });

  // Upsert products
  for (const p of products) {
    const { catSlug, ...data } = p;
    await prisma.product.upsert({
      where: { pid: p.pid },
      create: { ...data, categoryId: catMap[catSlug].id },
      update: { ...data, categoryId: catMap[catSlug].id },
    });
  }

  console.log("Seed complete.");
}

run().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
