import { beforeAll, describe, expect, it } from "vitest";
import type { Brief } from "./assess";

let o: typeof import("./orders");
const brief = (over: Partial<Brief> = {}): Brief => ({
  title: "城市更新与社区治理",
  docType: "paper",
  wordCount: 3000,
  dueDate: new Date(Date.now() + 14 * 86_400_000),
  requirements: "研究城市更新对社区治理的影响，APA 格式，附文献综述。",
  ...over,
});

beforeAll(async () => {
  delete process.env.DATABASE_URL;
  delete process.env.ANTHROPIC_API_KEY;
  process.env.PGLITE_DIR = "memory://";
  o = await import("./orders");
});

describe("order flow", () => {
  it("runs submit -> confirm -> review -> deliver, with a revision loop", async () => {
    const created = await o.createOrder("a@b.co", brief());
    expect(created.status).toBe("quoted");

    const reviewing = await o.confirmOrder(created.id);
    expect(reviewing.status).toBe("in_review");
    expect(reviewing.draft).toContain("大纲");

    await expect(o.requestRevision(created.id, "  ")).rejects.toThrow("请写明");
    const again = await o.requestRevision(created.id, "第三章论据不足");
    expect(again.status).toBe("in_review");
    expect(again.reviewNote).toBe("第三章论据不足");

    expect((await o.approveOrder(created.id)).status).toBe("delivered");
    expect((await o.closeOrder(created.id)).status).toBe("closed");
  });

  it("holds thin briefs at needs_info until completed", async () => {
    const created = await o.createOrder("a@b.co", brief({ requirements: "写论文" }));
    expect(created.status).toBe("needs_info");
    expect((await o.resubmit(created.id, brief({ requirements: "写论文" }))).status).toBe("needs_info");
    expect((await o.resubmit(created.id, brief())).status).toBe("quoted");
  });

  it("rejects illegal transitions", async () => {
    const created = await o.createOrder("a@b.co", brief());
    await expect(o.approveOrder(created.id)).rejects.toThrow("不能变更");
  });
});
