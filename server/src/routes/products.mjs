function nextPid(n) { return `PRD-${String(n).padStart(4, "0")}`; }

async function bust(redis, keys) {
  if (!redis) return;
  for (const k of keys) await redis.del(k).catch(() => {});
}

export default async function productRoutes(app) {
  // List (public — storefront uses this; CDN-cached at the edge)
  app.get("/", async (req, reply) => {
    const { category, status, q, take = 100, skip = 0 } = req.query || {};
    reply.header("cache-control", "public, s-maxage=15, stale-while-revalidate=120");
    const where = {};
    if (status) where.status = status;
    if (q) where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortDesc: { contains: q, mode: "insensitive" } },
    ];
    if (category) where.category = { OR: [{ name: category }, { slug: category }, { cid: category }] };

    const [items, total] = await Promise.all([
      app.prisma.product.findMany({
        where, take: +take, skip: +skip,
        orderBy: { createdAt: "desc" },
        include: { category: true },
      }),
      app.prisma.product.count({ where }),
    ]);
    return { items, total };
  });

  // Read one
  app.get("/:pid", async (req, reply) => {
    const product = await app.prisma.product.findUnique({
      where: { pid: req.params.pid },
      include: { category: true },
    });
    if (!product) return reply.code(404).send({ error: "Not found" });
    return { product };
  });

  // Create (admin)
  app.post("/", { preHandler: app.authed }, async (req, reply) => {
    const b = req.body || {};
    if (!b.name) return reply.code(400).send({ error: "Name required" });
    const category = await app.prisma.category.findFirst({
      where: { OR: [{ id: b.categoryId }, { cid: b.catId }, { name: b.category }] },
    });
    if (!category) return reply.code(400).send({ error: "Category not found" });

    const count = await app.prisma.product.count();
    const product = await app.prisma.product.create({
      data: {
        pid: b.pid || nextPid(count + 1),
        name: b.name,
        shortDesc: b.shortDesc || "",
        fullDesc: b.fullDesc || "",
        img: b.img || null,
        price: +b.price || 0,
        disc: b.disc ? +b.disc : null,
        discountLabel: b.discountLabel || "",
        stock: +b.stock || 0,
        lowAlert: +b.lowAlert || 10,
        status: b.status || "Published",
        visible: !!b.visible,
        tags: b.tags || [],
        variants: b.variants || [],
        categoryId: category.id,
      },
      include: { category: true },
    });
    await bust(app.redis, ["products:*"]);
    return { product };
  });

  // Update (admin)
  app.put("/:pid", { preHandler: app.authed }, async (req, reply) => {
    const b = req.body || {};
    const existing = await app.prisma.product.findUnique({ where: { pid: req.params.pid } });
    if (!existing) return reply.code(404).send({ error: "Not found" });

    let categoryId = existing.categoryId;
    if (b.category || b.catId || b.categoryId) {
      const cat = await app.prisma.category.findFirst({
        where: { OR: [{ id: b.categoryId }, { cid: b.catId }, { name: b.category }] },
      });
      if (cat) categoryId = cat.id;
    }

    const product = await app.prisma.product.update({
      where: { pid: req.params.pid },
      data: {
        name: b.name ?? existing.name,
        shortDesc: b.shortDesc ?? existing.shortDesc,
        fullDesc: b.fullDesc ?? existing.fullDesc,
        img: b.img ?? existing.img,
        price: b.price !== undefined ? +b.price : existing.price,
        disc: b.disc !== undefined ? (b.disc === null ? null : +b.disc) : existing.disc,
        discountLabel: b.discountLabel ?? existing.discountLabel,
        stock: b.stock !== undefined ? +b.stock : existing.stock,
        lowAlert: b.lowAlert !== undefined ? +b.lowAlert : existing.lowAlert,
        status: b.status ?? existing.status,
        visible: b.visible !== undefined ? !!b.visible : existing.visible,
        tags: b.tags ?? existing.tags,
        variants: b.variants ?? existing.variants,
        categoryId,
      },
      include: { category: true },
    });
    await bust(app.redis, ["products:*"]);
    return { product };
  });

  // Delete (admin)
  app.delete("/:pid", { preHandler: app.authed }, async (req, reply) => {
    const product = await app.prisma.product.findUnique({ where: { pid: req.params.pid } });
    if (!product) return reply.code(404).send({ error: "Not found" });
    await app.prisma.product.delete({ where: { pid: req.params.pid } });
    await bust(app.redis, ["products:*"]);
    return { ok: true };
  });
}
