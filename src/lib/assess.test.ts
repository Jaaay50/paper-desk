import { describe, expect, it } from "vitest";
import { assess, type Brief } from "./assess";

const now = new Date("2026-10-07T00:00:00Z");
const brief = (o: Partial<Brief> = {}): Brief => ({
  title: "T",
  docType: "paper",
  wordCount: 3000,
  dueDate: new Date("2026-10-20T00:00:00Z"),
  requirements: "研究城市更新对社区治理的影响，APA 格式。",
  ...o,
});

describe("assess", () => {
  it("asks for more info when requirements are thin", () => {
    const r = assess(brief({ requirements: "写论文" }), now);
    expect(r.status).toBe("needs_info");
    expect(r.missing).toHaveLength(1);
  });
  it("rejects a due date in the past", () => {
    expect(assess(brief({ dueDate: new Date("2026-10-01") }), now).status).toBe("needs_info");
  });
  it("quotes by 1000-word blocks", () => {
    expect(assess(brief(), now)).toMatchObject({ status: "quoted", estimateCny: 180 });
    expect(assess(brief({ wordCount: 3001 }), now).estimateCny).toBe(240);
  });
  it("adds a rush surcharge under 3 days", () => {
    expect(assess(brief({ dueDate: new Date("2026-10-09T00:00:00Z") }), now).estimateCny).toBe(234);
  });
});
