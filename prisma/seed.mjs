import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const categories = [
  { cid: "CAT-001", name: "Pickles",    slug: "pickles",    order: 1, status: "Published", img: "/assets/product-pickle.jpg" },
  { cid: "CAT-002", name: "Powders",    slug: "powders",    order: 2, status: "Published", img: "/assets/product-karam.jpg" },
  { cid: "CAT-003", name: "Pastes",     slug: "pastes",     order: 3, status: "Published", img: "/assets/product-podi.jpg" },
  { cid: "CAT-004", name: "Chutneys",   slug: "chutneys",   order: 4, status: "Draft",     img: "/assets/product-pickle.jpg" },
  { cid: "CAT-005", name: "Snacks",     slug: "snacks",     order: 5, status: "Published", img: "/assets/product-snack.jpg" },
  { cid: "CAT-006", name: "Gift Packs", slug: "gift-packs", order: 6, status: "Draft",     img: "/assets/product-rekulu.png" },
];

const products = [
  {
    pid: "PRD-0042", name: "Authentic Guntur Red Chili Powder", catSlug: "powders",
    shortDesc: "Premium quality authentic Guntur red chili powder",
    fullDesc: "Handpicked Guntur chilies, sun-dried and ground to perfection.",
    img: "/assets/product-karam.jpg",
    price: 199, disc: 149, discountLabel: "Save ₹50 (20% off)",
    stock: 248, lowAlert: 10, status: "Published", visible: true,
    tags: ["No Preservatives", "Vegan", "Gluten Free"],
    variants: [
      { w: "250g", price: 199, disc: 149, stock: 102, status: "Published" },
      { w: "500g", price: 349, disc: 299, stock: 98,  status: "Published" },
      { w: "1kg",  price: 649, disc: null, stock: 48,  status: "Low" },
    ],
  },
  {
    pid: "PRD-0001", name: "Mango Pickle — Avakaya", catSlug: "pickles",
    shortDesc: "Traditional", fullDesc: "Sun-cured raw mangoes hand-mixed with mustard, fenugreek & sesame oil. Aged for 21 days.",
    img: "/assets/product-pickle.jpg",
    price: 350, disc: null, discountLabel: "", stock: 120, lowAlert: 15,
    status: "Published", visible: true,
    tags: ["No Preservatives", "Hand-packed"],
    variants: [
      { w: "200g", price: 175, disc: null, stock: 60, status: "Published" },
      { w: "500g", price: 350, disc: null, stock: 60, status: "Published" },
    ],
  },
  {
    pid: "PRD-0010", name: "Nalla Karam", catSlug: "powders",
    shortDesc: "Andhra black powder — smoky heat for idlis & dosas",
    fullDesc: "Slow-roasted urad dal, curry leaves & sun-dried chilies, stone-ground.",
    img: "/assets/product-karam.jpg",
    price: 199, disc: null, stock: 180, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["No Preservatives", "Vegan", "Gluten Free"],
    variants: [
      { w: "100g", price: 180, disc: null, stock: 60, status: "Published" },
      { w: "250g", price: 199, disc: null, stock: 60, status: "Published" },
      { w: "500g", price: 380, disc: null, stock: 60, status: "Published" },
    ],
  },
  {
    pid: "PRD-0011", name: "Kandi Podi", catSlug: "powders",
    shortDesc: "Classic toor-dal podi for rice & ghee",
    fullDesc: "Roasted slowly with curry leaves, dry chilies and a hint of asafoetida.",
    img: "/assets/product-podi.jpg",
    price: 320, disc: null, stock: 96, lowAlert: 15,
    status: "Published", visible: true,
    tags: ["Vegan", "No Preservatives"],
    variants: [
      { w: "100g", price: 140, disc: null, stock: 48, status: "Published" },
      { w: "250g", price: 320, disc: null, stock: 48, status: "Published" },
    ],
  },
  {
    pid: "PRD-0020", name: "Putha Rekulu", catSlug: "snacks",
    shortDesc: "Paper-thin Atreyapuram sweet with jaggery & dry fruits",
    fullDesc: "Crafted with delicate rice wafers, pure ghee, and a luscious stuffing.",
    img: "/assets/product-rekulu.png",
    price: 220, disc: null, stock: 64, lowAlert: 10,
    status: "Published", visible: true,
    tags: ["No Preservatives", "Organic"],
    variants: [
      { w: "100g", price: 120, disc: null, stock: 30, status: "Published" },
      { w: "200g", price: 220, disc: null, stock: 30, status: "Published" },
      { w: "500g", price: 540, disc: null, stock: 4,  status: "Low" },
    ],
  },
  {
    pid: "PRD-0021", name: "Pappu Chekkalu", catSlug: "snacks",
    shortDesc: "Crunchy rice crackers with chana dal & curry leaves",
    fullDesc: "Golden, savory bites, perfect with evening tea.",
    img: "/assets/product-snack.jpg",
    price: 95, disc: null, stock: 140, lowAlert: 20,
    status: "Published", visible: true,
    tags: ["Gluten Free", "No Preservatives"],
    variants: [
      { w: "200g", price: 95,  disc: null, stock: 70, status: "Published" },
      { w: "500g", price: 220, disc: null, stock: 70, status: "Published" },
    ],
  },
  {
    pid: "PRD-0030", name: "Tomato Pachadi", catSlug: "chutneys",
    shortDesc: "Slow-cooked tomato chutney with mustard & curry leaves",
    fullDesc: "Bright, tangy and ready to elevate every dosa or paratha.",
    img: "/assets/product-pickle.jpg",
    price: 180, disc: null, stock: 88, lowAlert: 15,
    status: "Published", visible: true,
    tags: ["Vegan", "Gluten Free"],
    variants: [
      { w: "200g", price: 180, disc: null, stock: 44, status: "Published" },
      { w: "400g", price: 340, disc: null, stock: 44, status: "Published" },
    ],
  },
];

async function run() {
  console.log("Seeding…");

  // Admin
  const email = (process.env.ADMIN_EMAIL || "admin@artisangroc.com").toLowerCase();
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

  // Products
  for (const p of products) {
    const { catSlug, ...data } = p;
    await prisma.product.upsert({
      where: { pid: p.pid },
      create: { ...data, categoryId: catMap[catSlug].id },
      update: { ...data, categoryId: catMap[catSlug].id },
    });
  }

  // Demo orders
  const now = new Date();
  const sample = [
    { customerName: "Priya Sharma", customerPhone: "+91 987XX X3210", address: "123 Heritage Lane, Old Fort Area", city: "Jaipur", state: "Rajasthan", payment: "UPI",
      items: [{ name: "Guntur Red Chili Powder (500g)", qty: 1, price: 149, total: 149 }, { name: "Mango Pickle (200g)", qty: 2, price: 175, total: 350 }] },
    { customerName: "Aarav Mehta", customerPhone: "+91 945XX X1122", address: "44 MG Road", city: "Mumbai", state: "Maharashtra", payment: "Card",
      items: [{ name: "Mango Pickle (200g)", qty: 2, price: 175, total: 350 }] },
    { customerName: "Ishaan Roy", customerPhone: "+91 876XX X5432", address: "9 Park Street", city: "Kolkata", state: "West Bengal", payment: "UPI",
      items: [{ name: "Heritage Mango Pickle (500g)", qty: 2, price: 460, total: 920 }, { name: "Nalla Karam (500g)", qty: 1, price: 380, total: 380 }] },
  ];

  for (let i = 0; i < sample.length; i++) {
    const s = sample[i];
    const subtotal = s.items.reduce((sum, it) => sum + it.total, 0);
    const shipping = subtotal >= 999 ? 0 : 80;
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + shipping + gst;
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    await prisma.order.upsert({
      where: { txId: `TXN-SEED-${i}` },
      update: {},
      create: {
        orderId: `ORD-${1189 - i}`,
        txId: `TXN-SEED-${i}`,
        customerName: s.customerName, customerPhone: s.customerPhone,
        address: s.address, city: s.city, state: s.state,
        subtotal, shipping, gst, total,
        payment: s.payment, status: "Completed",
        createdAt: date,
        items: { create: s.items.map((it) => ({ ...it })) },
      },
    });
  }

  console.log("Seed complete.");
}

run().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
