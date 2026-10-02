import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

export default function setup() {
  rmSync("prisma/test.db", { force: true });
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "pipe",
  });
}
