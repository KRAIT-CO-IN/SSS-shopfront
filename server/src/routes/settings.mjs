const KEYS = ["store", "shipping", "checkout", "notifications"];

const defaults = {
  store: {
    name: "SSS FOOD WORLD",
    tagline: "Crafting authentic, small-batch preserves and culinary essentials.",
    supportEmail: "support@artisangroc.com",
    supportPhone: "+91 XXXXX XXXXX",
    address: "123 Heritage Lane, Old Fort Area, Hyderabad, Telangana 500001",
  },
  shipping: { free: 499, rate: 80, eta: "2-4 Business Days", cod: true },
  checkout: { otpExpiry: 30, otpLen: 4, autofill: true, razKey: "rzp_live_XXXX...XXXX" },
  notifications: {
    newOrder: true, paymentFailed: true, lowStock: true,
    email: true, sms: true,
    notifEmail: "admin@artisangroc.com", notifPhone: "+91 XXXXX XXXXX",
  },
};

export default async function settingsRoutes(app) {
  app.get("/:key", async (req, reply) => {
    const { key } = req.params;
    if (!KEYS.includes(key)) return reply.code(404).send({ error: "Unknown settings key" });
    reply.header("cache-control", "public, s-maxage=30, stale-while-revalidate=300");
    const row = await app.prisma.settings.findUnique({ where: { key } });
    return { value: row?.value ?? defaults[key] };
  });

  app.put("/:key", { preHandler: app.authed }, async (req, reply) => {
    const { key } = req.params;
    if (!KEYS.includes(key)) return reply.code(404).send({ error: "Unknown settings key" });
    const value = req.body?.value || {};
    const row = await app.prisma.settings.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return { value: row.value };
  });
}
