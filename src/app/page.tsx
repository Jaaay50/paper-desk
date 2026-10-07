import { OrderForm } from "@/components/order-form";
import { STEPS } from "@/lib/steps";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">论文写作，自动接单</h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        提交需求，系统自动评估、制作大纲与初稿，人工审核把关后交付。产出是供你改写完善的草稿与修改建议。
      </p>

      <ol className="mt-12 grid gap-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm text-white dark:bg-white dark:text-zinc-900">{i + 1}</span>
            <div><h2 className="font-medium">{s.title}</h2><p className="text-sm text-zinc-600 dark:text-zinc-400">{s.desc}</p></div>
          </li>
        ))}
      </ol>

      <section id="start" className="mt-16">
        <h2 className="mb-4 text-2xl font-semibold">开始</h2>
        <OrderForm />
      </section>
    </main>
  );
}
