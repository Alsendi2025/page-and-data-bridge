import { describe, it, expect } from "vitest";
import { formatCurrency, PRICE_ON_REQUEST } from "@/lib/format";

describe("product price display", () => {
  it("shows 'السعر عند الطلب' when a product has no published price", () => {
    expect(PRICE_ON_REQUEST).toBe("السعر عند الطلب");
    expect(formatCurrency(null)).toBe("السعر عند الطلب");
    expect(formatCurrency(undefined)).toBe("السعر عند الطلب");
  });

  it("still shows a real price in Yemeni rials when one is set", () => {
    expect(formatCurrency(250000)).toBe("250,000 ر.ي");
  });
});
