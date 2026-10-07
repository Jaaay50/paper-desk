import Anthropic from "@anthropic-ai/sdk";
import type { Order } from "@/db/schema";

const DOC_LABEL: Record<Order["docType"], string> = {
  paper: "论文",
  proposal: "开题报告",
  slides: "PPT",
  figure: "图纸",
};

const SYSTEM = `你是学术写作辅助工具。根据用户的写作需求，输出四部分，使用 Markdown：
## 大纲
## 初稿
## 修改建议（指出初稿中薄弱、需要作者补充论据或数据的地方）
## 引用与格式（列出需要作者自行查证的文献方向；不要编造具体文献、作者、页码或数据）
初稿是供作者在此基础上改写的草稿，不是可直接提交的成品。`;

export async function generateDraft(order: Order): Promise<string> {
  const prompt = [
    `类型：${DOC_LABEL[order.docType]}`,
    `题目：${order.title}`,
    `目标字数：${order.wordCount}`,
    `写作要求：${order.requirements}`,
    order.reviewNote ? `审核意见（请据此修改）：${order.reviewNote}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return placeholder(order, prompt);

  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
    max_tokens: 8000,
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });
  const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
  if (!text.trim()) throw new Error("AI 返回为空");
  return text;
}

function placeholder(order: Order, prompt: string): string {
  return `> 未配置 ANTHROPIC_API_KEY，这是占位稿，仅用于本地演示流程。\n\n## 大纲\n1. 引言\n2. 文献综述\n3. 方法\n4. 讨论\n5. 结论\n\n## 初稿\n（《${order.title}》的草稿将在配置 AI 后生成）\n\n## 修改建议\n（占位）\n\n## 引用与格式\n（占位）\n\n---\n${prompt}`;
}
