export default async function authRoutes(app) {
  app.post("/login", async (req, reply) => {
    const { email, password } = req.body || {};
    if (!email || !password) return reply.code(400).send({ error: "Email and password required" });

    const admin = await app.prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin) return reply.code(401).send({ error: "Invalid credentials" });

    const ok = await app.bcrypt.compare(password, admin.password);
    if (!ok) return reply.code(401).send({ error: "Invalid credentials" });

    const token = app.jwt.sign({ sub: admin.id, email: admin.email, role: admin.role });
    return { token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role, phone: admin.phone } };
  });

  app.get("/me", { preHandler: app.authed }, async (req) => {
    const admin = await app.prisma.admin.findUnique({ where: { id: req.user.sub } });
    if (!admin) return { admin: null };
    return { admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role, phone: admin.phone } };
  });

  app.put("/profile", { preHandler: app.authed }, async (req) => {
    const { name, email, phone } = req.body || {};
    const admin = await app.prisma.admin.update({
      where: { id: req.user.sub },
      data: { name, email: email?.toLowerCase(), phone },
    });
    return { admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role, phone: admin.phone } };
  });

  app.put("/password", { preHandler: app.authed }, async (req, reply) => {
    const { current, next } = req.body || {};
    if (!next || next.length < 8) return reply.code(400).send({ error: "Password must be 8+ chars" });

    const admin = await app.prisma.admin.findUnique({ where: { id: req.user.sub } });
    const ok = await app.bcrypt.compare(current, admin.password);
    if (!ok) return reply.code(401).send({ error: "Current password incorrect" });

    const hash = await app.bcrypt.hash(next, 10);
    await app.prisma.admin.update({ where: { id: admin.id }, data: { password: hash } });
    return { ok: true };
  });
}
