// Order lifecycle. The only loop is review -> revision -> review.
export const ORDER_STATUSES = [
  "submitted", // client sent the brief
  "needs_info", // materials missing, waiting on client
  "quoted", // assessment done, waiting on client confirmation
  "confirmed", // client accepted
  "drafting", // AI is producing the draft
  "in_review", // human reviewer checking the draft
  "revising", // reviewer sent it back
  "delivered", // client can download
  "closed", // client accepted delivery
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  submitted: ["needs_info", "quoted"],
  needs_info: ["quoted"], // client supplied the missing info
  quoted: ["confirmed"],
  confirmed: ["drafting"],
  drafting: ["in_review"],
  in_review: ["revising", "delivered"],
  revising: ["in_review"],
  delivered: ["revising", "closed"], // client feedback re-opens work
  closed: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[from];
}
