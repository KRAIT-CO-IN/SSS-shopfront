import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import bcrypt from "bcryptjs";

import authRoutes from "./routes/auth.mjs";
import productRoutes from "./routes/products.mjs";
import categoryRoutes from "./routes/categories.mjs";
import orderRoutes from "./routes/orders.mjs";
import settingsRoutes from "./routes/settings.mjs";

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL || "info" },
  trustProxy: true,
});

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
});

export const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  lazyConnect: true,
}) : null;

if (redis) {
  redis.on("error", (e) => app.log.warn({ err: e.message }, "redis error"));
  redis.connect().catch(() => {});
}

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, {
  origin: (process.env.CORS_ORIGIN || "*").split(","),
  credentials: true,
});
await app.register(rateLimit, {
  max: 200,
  timeWindow: "1 minute",
  redis: redis || undefined,
});
await app.register(jwt, {
  secret: process.env.JWT_SECRET || "dev-only-change-me",
  sign: { expiresIn: "7d" },
});

app.decorate("prisma", prisma);
app.decorate("redis", redis);
app.decorate("bcrypt", bcrypt);

app.decorate("authed", async (req, reply) => {
  try { await req.jwtVerify(); } catch (e) { reply.code(401).send({ error: "Unauthorized" }); }
});

app.get("/health", async () => ({ ok: true, ts: Date.now() }));

await app.register(authRoutes,     { prefix: "/api/auth" });
await app.register(productRoutes,  { prefix: "/api/products" });
await app.register(categoryRoutes, { prefix: "/api/categories" });
await app.register(orderRoutes,    { prefix: "/api/orders" });
await app.register(settingsRoutes, { prefix: "/api/settings" });

app.setErrorHandler((err, req, reply) => {
  req.log.error(err);
  const code = err.statusCode || 500;
  reply.code(code).send({ error: err.message || "Server error" });
});

const port = +(process.env.PORT || 4000);
const host = process.env.HOST || "0.0.0.0";
await app.listen({ port, host });
app.log.info(`API listening on ${host}:${port}`);

const shutdown = async () => {
  app.log.info("Shutting down");
  await app.close();
  await prisma.$disconnect();
  if (redis) await redis.quit();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
