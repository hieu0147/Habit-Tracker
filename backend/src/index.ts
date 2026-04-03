import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./server";
import { connectDb } from "./lib/db";
import { env } from "./lib/env";

async function main() {
  await connectDb(env.MONGODB_URI);
  const app = createApp();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

