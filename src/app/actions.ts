"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DOC_TYPES } from "@/db/schema";
import { adminLogin, isAdmin } from "@/lib/admin-auth";
import * as orders from "@/lib/orders";

const briefSchema = z.object({
  email: z.email("请填写有效邮箱"),
  title: z.string().trim().min(2, "请填写题目").max(200),
  docType: z.enum(DOC_TYPES),
  wordCount: z.coerce.number().int().min(500, "至少 500 字").max(50000, "最多 50000 字"),
  dueDate: z.coerce.date("请选择交期"),
  requirements: z.string().trim().max(5000),
});

export type FormState = { errors?: Record<string, string[] | undefined>; message?: string };

export async function submitOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = briefSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  const { email, ...brief } = parsed.data;
  const order = await orders.createOrder(email, brief);
  redirect(`/orders/${order.id}`);
}

// Client-side actions are authorised by possession of the unguessable order id in the URL.
export async function confirmOrder(id: string) {
  await orders.confirmOrder(id);
  revalidatePath(`/orders/${id}`);
}

export async function clientRequestRevision(id: string, formData: FormData) {
  await orders.requestRevision(id, String(formData.get("note") ?? ""));
  revalidatePath(`/orders/${id}`);
}

export async function closeOrder(id: string) {
  await orders.closeOrder(id);
  revalidatePath(`/orders/${id}`);
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

export async function approve(id: string) {
  await requireAdmin();
  await orders.approveOrder(id);
  revalidatePath("/admin");
}

export async function sendBack(id: string, formData: FormData) {
  await requireAdmin();
  await orders.requestRevision(id, String(formData.get("note") ?? ""));
  revalidatePath("/admin");
}

export async function login(formData: FormData) {
  if (await adminLogin(String(formData.get("token") ?? ""))) redirect("/admin");
  redirect("/admin?error=1");
}
