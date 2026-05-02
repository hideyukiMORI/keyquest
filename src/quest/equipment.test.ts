import { describe, expect, it } from "vitest";

import { createInitialQuestResources } from "../save/model.js";
import { getEquipmentUpgradeLevel, resolveEquipmentUpgrades } from "./equipment.js";

describe("resolveEquipmentUpgrades", () => {
  it("spends materials to upgrade the training blade grip", () => {
    const result = resolveEquipmentUpgrades({
      ...createInitialQuestResources(),
      materials: {
        focusCrystal: 2,
        repairShard: 1,
      },
    });

    expect(getEquipmentUpgradeLevel(result.resources, "trainingBladeGrip")).toBe(1);
    expect(result.resources.maxHp).toBe(21);
    expect(result.resources.hp).toBe(21);
    expect(result.resources.materials).toEqual({
      focusCrystal: 0,
      repairShard: 0,
    });
    expect(result.unlocks).toEqual([
      {
        id: "trainingBladeGrip",
        level: 1,
      },
    ]);
  });

  it("applies multiple affordable levels deterministically", () => {
    const result = resolveEquipmentUpgrades({
      ...createInitialQuestResources(),
      materials: {
        focusCrystal: 12,
        repairShard: 6,
      },
    });

    expect(getEquipmentUpgradeLevel(result.resources, "trainingBladeGrip")).toBe(3);
    expect(result.resources.maxHp).toBe(23);
    expect(result.unlocks.map((unlock) => unlock.level)).toEqual([1, 2, 3]);
    expect(result.resources.materials).toEqual({
      focusCrystal: 0,
      repairShard: 0,
    });
  });

  it("does not upgrade when materials are missing", () => {
    const result = resolveEquipmentUpgrades(createInitialQuestResources());

    expect(getEquipmentUpgradeLevel(result.resources, "trainingBladeGrip")).toBe(0);
    expect(result.resources.maxHp).toBe(20);
    expect(result.unlocks).toEqual([]);
  });
});
