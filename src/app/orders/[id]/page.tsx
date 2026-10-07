import { notFound } from "next/navigation";
import { confirmOrder, clientRequestRevision, closeOrder } from "@/app/actions";
import { getOrder } from "@/lib/orders";
import { STATUS_LABEL, STATUS_STEP, STEPS } from "@/lib/steps";

export const dynamic = "force-dynamic";

export default async function OrderPage(props: PageProps<"/orders/[id]">) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const order = await getOrder(id);
  if (!order) notFound();
  const step = STATUS_STEP[order.status];
  const btn = "rounded-full bg-zinc-900 px-5 py-2 text-sm text-white dark:bg-white dark:text-zinc-900";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-zinc-500">订单 {order.id.slice(0, 8)}</p>
      <h1 className="text-3xl font-semibold">{order.title}</h1>
      <p className="mt-2 text-sm">当前状态：<strong>{STATUS_LABEL[order.status]}</strong></p>

      <ol className="mt-6 flex gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li key={s.title} className={`flex-1 rounded-md px-2 py-1 text-center ${i <= step ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>{s.title}</li>
        ))}
      </ol>

      {order.status === "needs_info" && (
        <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">信息还不完整：请把写作要求补充到至少 20 字，并确认交期晚于今天，然后重新提交一个订单。</p>
      )}
      {order.status === "quoted" && (
        <form action={confirmOrder.bind(null, order.id)} className="mt-8">
          <p className="mb-3 text-sm">评估完成。确认后立即开始制作（生成可能需要几十秒）。</p>
          <button className={btn}>确认接单</button>
        </form>
      )}
      {["in_review", "revising", "drafting", "confirmed"].includes(order.status) && (
        <p className="mt-8 text-sm text-zinc-600">稿件正在制作与审核中，通过后会显示在这里。</p>
      )}
      {(order.status === "delivered" || order.status === "closed") && order.draft && (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">交付稿件</h2>
          <pre className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-900">{order.draft}</pre>
          {order.status === "delivered" && (
            <div className="mt-6 grid gap-4">
              <form action={clientRequestRevision.bind(null, order.id)} className="grid gap-2">
                <textarea name="note" rows={3} required placeholder="需要修改的地方" className="rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
                <button className="w-fit rounded-full border border-zinc-400 px-5 py-2 text-sm">提交修改要求</button>
              </form>
              <form action={closeOrder.bind(null, order.id)}><button className={btn}>满意，完成订单</button></form>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
