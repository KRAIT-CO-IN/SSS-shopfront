// Vercel serverless function — wraps Fastify and serves ALL /api/* routes.
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import authRoutes from "../server/src/routes/auth.mjs";
import productRoutes from "../server/src/routes/products.mjs";
import categoryRoutes from "../server/src/routes/categories.mjs";
import orderRoutes from "../server/src/routes/orders.mjs";
import settingsRoutes from "../server/src/routes/settings.mjs";

let appPromise;

async function buildApp() {
  const app = Fastify({ logger: false, disableRequestLogging: true });

  const prisma = new PrismaClient({ log: ["error"] });
  app.decorate("prisma", prisma);
  app.decorate("bcrypt", bcrypt);
  app.decorate("redis", null); // no Redis on Vercel — code handles null

  await app.register(cors, { origin: (process.env.CORS_ORIGIN || "*").split(",") });
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "dev-only-change-me",
    sign: { expiresIn: "7d" },
  });
  app.decorate("authed", async (req, reply) => {
    try { await req.jwtVerify(); } catch (e) { reply.code(401).send({ error: "Unauthorized" }); }
  });

  app.get("/health", async () => ({ ok: true, ts: Date.now() }));
  await app.register(authRoutes,     { prefix: "/api/adm" });
  await app.register(productRoutes,  { prefix: "/api/products" });
  await app.register(categoryRoutes, { prefix: "/api/categories" });
  await app.register(orderRoutes,    { prefix: "/api/orders" });
  await app.register(settingsRoutes, { prefix: "/api/settings" });

  await app.ready();
  return app;
}

async function getApp() {
  if (!appPromise) appPromise = buildApp();
  return appPromise;
}

export default async function handler(req, res) {
  // Vercel rewrites overwrite req.url with the destination ("/api/index").
  // Restore the original request path so Fastify route matching works.
  const original =
    req.headers["x-forwarded-uri"] ||
    req.headers["x-vercel-original-url"] ||
    req.headers["x-original-url"] ||
    req.url;
  req.url = original;
  const app = await getApp();
  app.server.emit("request", req, res);
}
