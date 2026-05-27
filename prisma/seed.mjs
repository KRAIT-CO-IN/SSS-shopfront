import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const IMG = {
  mysore:       "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Mysore_pak.jpg/1280px-Mysore_pak.jpg",
  pootha:       "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Pootharekulu.JPG/1280px-Pootharekulu.JPG",
  avakaya:      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Mango_pickle._jpg.jpg/1280px-Mango_pickle._jpg.jpg",
  boondiLaddu:  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Boondi_Laddu.JPG/1280px-Boondi_Laddu.JPG",
  mango:        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Mangos_-_single_and_halved.jpg/1280px-Mangos_-_single_and_halved.jpg",
  ghee:         "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Home_made_Ghee.jpg/1280px-Home_made_Ghee.jpg",
  chekkalu:     "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chekkalu-_Sri_Sai_Telangana_foods%2CHafeezpet-Telangana-DSC_0004.jpg/1280px-Chekkalu-_Sri_Sai_Telangana_foods%2CHafeezpet-Telangana-DSC_0004.jpg",
  pickle:       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Chilli_pickle_in_a_plate_2.jpg/1280px-Chilli_pickle_in_a_plate_2.jpg",
  tomato:       "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Tomato_Chutney.jpg/1280px-Tomato_Chutney.jpg",
  cashewBrittle:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Gur_Badam_or_Chikki.jpg/1280px-Gur_Badam_or_Chikki.jpg",
  toor:         "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Toor_dal.jpg/1280px-Toor_dal.jpg",
  cashewJumbo:  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Pile_of_cashews.jpg/1280px-Pile_of_cashews.jpg",
  cashewSplit:  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Roasted_Cashew_Nuts_%2852746470588%29.jpg/1280px-Roasted_Cashew_Nuts_%2852746470588%29.jpg",
  spicesGen:    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Common_Indian_spices.jpg/1280px-Common_Indian_spices.jpg",
  chiliPowder:  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Byadgi_chili_powder.jpg/1280px-Byadgi_chili_powder.jpg",
  karaPodi:     "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Idli_podi.jpg/1280px-Idli_podi.jpg",
};

const categories = [
  { cid: "CAT-SWE", name: "Sweets",    slug: "sweets",    order: 1, status: "Published", img: IMG.mysore },
  { cid: "CAT-SPI", name: "Spices",    slug: "spices",    order: 2, status: "Published", img: IMG.spicesGen },
  { cid: "CAT-SAV", name: "Savouries", slug: "savouries", order: 3, status: "Published", img: IMG.chekkalu },
  { cid: "CAT-POW", name: "Powders",   slug: "powders",   order: 4, status: "Published", img: IMG.karaPodi },
  { cid: "CAT-FRU", name: "Fruits",    slug: "fruits",    order: 5, status: "Published", img: IMG.mango },
  { cid: "CAT-PIC", name: "Pickles",   slug: "pickles",   order: 6, status: "Published", img: IMG.pickle },
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
    img: IMG.mysore,
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Saturday & Sunday Only", "Pure Ghee", "Hand-made"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SWE-002", name: "Boondi Laddu", catSlug: "sweets",
    shortDesc: "Available only on Saturday & Sunday",
    fullDesc: "Classic boondi laddu, soft and aromatic — prepared fresh every Saturday & Sunday.",
    img: IMG.boondiLaddu,
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Saturday & Sunday Only", "Festive Favorite"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SWE-003", name: "Jeedipappu Pakam (Cashew Sweet)", catSlug: "sweets",
    shortDesc: "Premium cashews glazed in sugar syrup",
    fullDesc: "Whole jeedipappu (cashews) coated in a delicate jaggery / sugar syrup — a traditional Andhra delicacy.",
    img: IMG.cashewBrittle,
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Premium Cashew", "No Preservatives"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SWE-004", name: "Pootha Rekulu", catSlug: "sweets",
    shortDesc: "Paper-thin Atreyapuram delicacy",
    fullDesc: "Wafer-thin rice sheets layered with pure ghee, sugar and dry-fruit filling.",
    img: IMG.pootha,
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
    img: IMG.cashewJumbo,
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Export Quality", "Premium"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SPI-002", name: "Split Cashew (Export Quality)", catSlug: "spices",
    shortDesc: "Export-quality split cashews",
    fullDesc: "Hand-sorted split cashews — ideal for sweets, curries and baking.",
    img: IMG.cashewSplit,
    price: 0, disc: null, discountLabel: "", stock: 300, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Export Quality", "Versatile"],
    variants: stdVariants,
  },
  {
    pid: "PRD-SPI-003", name: "Pure Buffalo Ghee (Home Made)", catSlug: "spices",
    shortDesc: "Home-made pure buffalo ghee",
    fullDesc: "Slow-churned buffalo ghee made the traditional bilona way. Rich aroma, golden colour.",
    img: IMG.ghee,
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
    img: IMG.chekkalu,
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
    img: IMG.karaPodi,
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
    img: IMG.mango,
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
    img: IMG.pickle,
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

  // Categories — upsert by slug (slug is unique). Lets us rewrite legacy
  // rows like CAT-001/CAT-002 in place instead of colliding on their slugs.
  const catMap = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
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

  // Drop legacy products not in new pid list — move to Draft (xlsx is the source of truth)
  const keepPids = products.map((p) => p.pid);
  await prisma.product.updateMany({
    where: { pid: { notIn: keepPids } },
    data: { status: "Draft", visible: false },
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
