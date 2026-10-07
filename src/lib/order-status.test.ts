import { describe, expect, it } from "vitest";
import { canTransition, nextStatuses, ORDER_STATUSES } from "./order-status";

describe("order status machine", () => {
  it("allows the review/revision loop", () => {
    expect(canTransition("in_review", "revising")).toBe(true);
    expect(canTransition("revising", "in_review")).toBe(true);
  });
  it("lets client feedback reopen a delivered order", () => {
    expect(canTransition("delivered", "revising")).toBe(true);
  });
  it("blocks skipping review", () => {
    expect(canTransition("drafting", "delivered")).toBe(false);
    expect(canTransition("confirmed", "delivered")).toBe(false);
  });
  it("closed is terminal", () => {
    expect(nextStatuses("closed")).toHaveLength(0);
  });
  it("every status has a defined transition list", () => {
    for (const s of ORDER_STATUSES) expect(Array.isArray(nextStatuses(s))).toBe(true);
  });
});
