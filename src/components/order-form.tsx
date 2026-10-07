"use client";

import { useActionState } from "react";
import { submitOrder, type FormState } from "@/app/actions";

const field = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

function Err({ msgs }: { msgs?: string[] }) {
  return msgs?.length ? <p className="mt-1 text-xs text-red-600">{msgs[0]}</p> : null;
}

export function OrderForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitOrder, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">邮箱
        <input name="email" type="email" required className={field} /><Err msgs={e.email} />
      </label>
      <label className="grid gap-1 text-sm">题目
        <input name="title" required className={field} /><Err msgs={e.title} />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">类型
          <select name="docType" className={field}>
            <option value="paper">论文</option><option value="proposal">开题报告</option>
            <option value="slides">PPT</option><option value="figure">图纸</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">目标字数
          <input name="wordCount" type="number" defaultValue={3000} min={500} className={field} /><Err msgs={e.wordCount} />
        </label>
        <label className="grid gap-1 text-sm">交期
          <input name="dueDate" type="date" required className={field} /><Err msgs={e.dueDate} />
        </label>
      </div>
      <label className="grid gap-1 text-sm">写作要求
        <textarea name="requirements" rows={5} placeholder="研究问题、学科、格式规范、参考材料……" className={field} />
        <Err msgs={e.requirements} />
      </label>
      <button disabled={pending} className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900">
        {pending ? "提交中…" : "提交需求，获取评估"}
      </button>
    </form>
  );
}
