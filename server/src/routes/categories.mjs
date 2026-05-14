function nextCid(n) { return `CAT-${String(n).padStart(3, "0")}`; }
function slugify(s) { return (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export default async function categoryRoutes(app) {
  app.get("/", async (req, reply) => {
    reply.header("cache-control", "public, s-maxage=15, stale-while-revalidate=120");
    const cats = await app.prisma.category.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    return { items: cats.map((c) => ({ ...c, products: c._count.products })) };
  });

  app.get("/:cid", async (req, reply) => {
    const c = await app.prisma.category.findUnique({
      where: { cid: req.params.cid },
      include: { _count: { select: { products: true } } },
    });
    if (!c) return reply.code(404).send({ error: "Not found" });
    return { category: { ...c, products: c._count.products } };
  });

  app.post("/", { preHandler: app.authed }, async (req) => {
    const b = req.body || {};
    const count = await app.prisma.category.count();
    const cat = await app.prisma.category.create({
      data: {
        cid: b.cid || nextCid(count + 1),
        name: b.name || "Untitled",
        slug: b.slug || slugify(b.name) || `cat-${count + 1}`,
        desc: b.desc || "",
        img: b.img || null,
        showNav: b.showNav !== false,
        showHome: b.showHome !== false,
        order: +b.order || count + 1,
        status: b.status || "Published",
      },
    });
    return { category: cat };
  });

  app.put("/:cid", { preHandler: app.authed }, async (req, reply) => {
    const b = req.body || {};
    const existing = await app.prisma.category.findUnique({ where: { cid: req.params.cid } });
    if (!existing) return reply.code(404).send({ error: "Not found" });
    const cat = await app.prisma.category.update({
      where: { cid: req.params.cid },
      data: {
        name: b.name ?? existing.name,
        slug: b.slug ?? existing.slug,
        desc: b.desc ?? existing.desc,
        img: b.img ?? existing.img,
        showNav: b.showNav ?? existing.showNav,
        showHome: b.showHome ?? existing.showHome,
        order: b.order !== undefined ? +b.order : existing.order,
        status: b.status ?? existing.status,
      },
    });
    return { category: cat };
  });

  app.delete("/:cid", { preHandler: app.authed }, async (req, reply) => {
    const existing = await app.prisma.category.findUnique({
      where: { cid: req.params.cid },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) return reply.code(404).send({ error: "Not found" });
    if (existing._count.products > 0) {
      return reply.code(400).send({ error: "Category has products; reassign or delete them first" });
    }
    await app.prisma.category.delete({ where: { cid: req.params.cid } });
    return { ok: true };
  });
}
