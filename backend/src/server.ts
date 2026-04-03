import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./lib/env";
import { notFoundHandler, errorHandler } from "./middleware/errors";
import { authRouter } from "./routes/auth";
import { habitsRouter } from "./routes/habits";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/habits", habitsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

