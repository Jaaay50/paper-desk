import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { orders } from "./schema";
import type { Db } from "./index";

let db: Db;
beforeAll(async () => {
  delete process.env.DATABASE_URL;
  process.env.PGLITE_DIR = "memory://";
  db = await (await import("./index")).getDb();
});
afterAll(() => {
  delete process.env.PGLITE_DIR;
});

describe("orders table", () => {
  it("applies migrations and round-trips an order with defaults", async () => {
    const [row] = await db
      .insert(orders)
      .values({
        email: "a@b.co",
        title: "Test",
        docType: "paper",
        wordCount: 3000,
        dueDate: new Date("2027-01-01"),
      })
      .returning();
    expect(row.status).toBe("submitted");
    expect(row.requirements).toBe("");
    const [found] = await db.select().from(orders).where(eq(orders.id, row.id));
    expect(found.title).toBe("Test");
  });
});
