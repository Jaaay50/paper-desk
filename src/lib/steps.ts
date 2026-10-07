// Client-facing flow shown on the home page and the order timeline.
export const STEPS = [
  { title: "提交需求", desc: "题目、类型、字数、交期，补充你的写作要求和材料。" },
  { title: "自动评估", desc: "系统检查信息是否完整并给出估价；不完整会告诉你缺什么。" },
  { title: "确认接单", desc: "你确认估价和范围后，订单立即开始，无需等人回复。" },
  { title: "AI 制作", desc: "生成大纲、初稿、修改建议、引用与格式清单。" },
  { title: "人工审核", desc: "审核人逐项检查，不合格会打回重做，你只会收到把关后的稿件。" },
  { title: "交付", desc: "在订单页查看和下载。不满意可以写明修改点，继续返修。" },
] as const;

// Which timeline step each order status sits on (0-based).
export const STATUS_STEP: Record<string, number> = {
  submitted: 1, needs_info: 1, quoted: 1, confirmed: 2, drafting: 3,
  in_review: 4, revising: 4, delivered: 5, closed: 5,
};

export const STATUS_LABEL: Record<string, string> = {
  submitted: "已提交", needs_info: "需要补充信息", quoted: "待你确认", confirmed: "已接单",
  drafting: "AI 制作中", in_review: "人工审核中", revising: "返修中", delivered: "已交付", closed: "已完成",
};
