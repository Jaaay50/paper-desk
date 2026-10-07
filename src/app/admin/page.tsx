import { approve, login, sendBack } from "@/app/actions";
import { isAdmin } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function Admin(props: PageProps<"/admin">) {
  if (!(await isAdmin())) {
    const { error } = await props.searchParams;
    return (
      <main className="mx-auto max-w-sm px-6 py-24">
        <form action={login} className="grid gap-3">
          <label className="grid gap-1 text-sm">审核口令
            <input name="token" type="password" required className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
          </label>
          {error && <p className="text-xs text-red-600">口令不正确</p>}
          <button className="rounded-full bg-zinc-900 px-5 py-2 text-sm text-white dark:bg-white dark:text-zinc-900">进入</button>
        </form>
      </main>
    );
  }
  const queue = (await listOrders()).filter((o) => o.status === "in_review");
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">待审核（{queue.length}）</h1>
      {queue.map((o) => (
        <section key={o.id} className="mt-8 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-medium">{o.title}</h2>
          <p className="text-xs text-zinc-500">{o.email} · {o.wordCount} 字 · {o.docType}</p>
          {o.reviewNote && <p className="mt-2 text-sm text-amber-700">上次审核意见：{o.reviewNote}</p>}
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900">{o.draft}</pre>
          <div className="mt-3 flex flex-wrap gap-3">
            <form action={approve.bind(null, o.id)}><button className="rounded-full bg-green-700 px-4 py-2 text-sm text-white">通过并交付</button></form>
            <form action={sendBack.bind(null, o.id)} className="flex gap-2">
              <input name="note" required placeholder="打回原因" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
              <button className="rounded-full border border-zinc-400 px-4 py-2 text-sm">打回返修</button>
            </form>
          </div>
        </section>
      ))}
    </main>
  );
}
