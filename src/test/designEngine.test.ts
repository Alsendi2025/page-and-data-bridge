import { describe, it, expect } from "vitest";
import { designSystem, DEFAULT_ASSUMPTIONS, type DesignInput } from "@/lib/designEngine";

const base: DesignInput = {
  city: "صنعاء",
  psh: 5.9,
  dailyEnergyWh: 5000,
  peakLoadW: 2000,
  autonomyHours: 12,
  batteryType: "lifepo4",
  systemType: "solar-battery",
  usageType: "home",
  assumptions: DEFAULT_ASSUMPTIONS,
};

describe("automatic panel wattage", () => {
  it("picks the market-standard 550W panel for a typical 5 kWh/day home without asking", () => {
    const r = designSystem(base);
    expect(r.system.panelAuto).toBe(true);
    expect(r.system.panelWattage).toBe(550);
  });

  it("keeps the array within 35% of the required wattage when choosing automatically", () => {
    for (const daily of [2500, 5000, 12000, 30000, 65000]) {
      const r = designSystem({ ...base, dailyEnergyWh: daily, peakLoadW: daily / 3 });
      expect(r.system.arrayWattage / r.production.requiredWattage).toBeLessThanOrEqual(1.35 + 1e-9);
    }
  });

  it("recalculates panel count when the user changes panel wattage after the result", () => {
    const auto = designSystem(base);
    const manual = designSystem({ ...base, panelWattage: 410 });
    expect(manual.system.panelAuto).toBe(false);
    expect(manual.system.panelWattage).toBe(410);
    expect(manual.system.recommendedPanelWattage).toBe(auto.system.panelWattage);
    expect(manual.system.numPanels).toBeGreaterThan(auto.system.numPanels);
    expect(manual.system.arrayWattage).toBeGreaterThanOrEqual(manual.production.requiredWattage);
  });
});

describe("panel strings", () => {
  it("always wires panels in equal strings", () => {
    for (const w of [100, 150, 300, 410, 550, 580, 700]) {
      const r = designSystem({ ...base, panelWattage: w });
      expect(r.system.numPanels).toBe(r.system.panelsPerString * r.system.numStrings);
    }
  });
});
