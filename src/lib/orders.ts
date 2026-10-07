import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, type Order } from "@/db/schema";
import { assess, type Brief } from "./assess";
import { canTransition, type OrderStatus } from "./order-status";
import { generateDraft } from "./ai";

export async function getOrder(id: string): Promise<Order | undefined> {
  const db = await getDb();
  const [row] = await db.select().from(orders).where(eq(orders.id, id));
  return row;
}

export async function listOrders(): Promise<Order[]> {
  const db = await getDb();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

async function move(id: string, to: OrderStatus, patch: Partial<Order> = {}): Promise<Order> {
  const db = await getDb();
  const current = await getOrder(id);
  if (!current) throw new Error("订单不存在");
  if (!canTransition(current.status, to)) {
    throw new Error(`订单当前状态「${current.status}」不能变更为「${to}」`);
  }
  const [row] = await db
    .update(orders)
    .set({ ...patch, status: to, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return row;
}

export async function createOrder(email: string, brief: Brief): Promise<Order> {
  const db = await getDb();
  const [row] = await db.insert(orders).values({ email, ...brief }).returning();
  return move(row.id, assess(brief).status);
}

// Client supplies missing info on a needs_info order; stays needs_info if still incomplete.
export async function resubmit(id: string, brief: Brief): Promise<Order> {
  const current = await getOrder(id);
  if (!current) throw new Error("订单不存在");
  if (current.status !== "needs_info") throw new Error("当前状态不能补充材料");
  const db = await getDb();
  await db.update(orders).set({ ...brief, updatedAt: new Date() }).where(eq(orders.id, id));
  const result = assess(brief);
  return result.status === "quoted" ? move(id, "quoted") : (await getOrder(id))!;
}

// Generates a draft for an order in `confirmed` or `revising` and lands it in `in_review`.
// On failure the order keeps its prior status so the step can simply be retried.
async function draftInto(id: string, from: "confirmed" | "revising"): Promise<Order> {
  if (from === "confirmed") await move(id, "drafting");
  try {
    const draft = await generateDraft((await getOrder(id))!);
    return await move(id, "in_review", { draft });
  } catch (err) {
    if (from === "confirmed") {
      const db = await getDb();
      await db.update(orders).set({ status: "confirmed", updatedAt: new Date() }).where(eq(orders.id, id));
    }
    throw err;
  }
}

export async function confirmOrder(id: string): Promise<Order> {
  await move(id, "confirmed");
  return draftInto(id, "confirmed");
}

export async function approveOrder(id: string): Promise<Order> {
  return move(id, "delivered");
}

// Reviewer sends a draft back, or the client asks for changes after delivery.
export async function requestRevision(id: string, note: string): Promise<Order> {
  if (!note.trim()) throw new Error("请写明需要修改的内容");
  await move(id, "revising", { reviewNote: note.trim() });
  return draftInto(id, "revising");
}

export async function closeOrder(id: string): Promise<Order> {
  return move(id, "closed");
}
