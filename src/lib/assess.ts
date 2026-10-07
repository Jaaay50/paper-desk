import type { OrderStatus } from "./order-status";

export type Brief = {
  title: string;
  docType: "paper" | "proposal" | "slides" | "figure";
  wordCount: number;
  dueDate: Date;
  requirements: string;
};

export type Assessment = {
  status: Extract<OrderStatus, "needs_info" | "quoted">;
  missing: string[];
  estimateCny?: number;
};

const MIN_REQUIREMENTS_CHARS = 20;
// Per-1000-word rate in CNY, by document type. Estimate only; no payment in v1.
const RATE: Record<Brief["docType"], number> = { paper: 60, proposal: 50, slides: 40, figure: 80 };
const RUSH_DAYS = 3;

export function assess(brief: Brief, now = new Date()): Assessment {
  const missing: string[] = [];
  if (brief.requirements.trim().length < MIN_REQUIREMENTS_CHARS) {
    missing.push("请补充写作要求（研究问题、学科、格式规范、参考材料等，至少 20 字）");
  }
  if (brief.dueDate.getTime() <= now.getTime()) missing.push("交期需晚于当前时间");
  if (missing.length) return { status: "needs_info", missing };

  const base = Math.ceil(brief.wordCount / 1000) * RATE[brief.docType];
  const days = (brief.dueDate.getTime() - now.getTime()) / 86_400_000;
  return { status: "quoted", missing, estimateCny: days < RUSH_DAYS ? Math.round(base * 1.3) : base };
}
