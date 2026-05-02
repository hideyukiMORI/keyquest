import type {
  EquipmentUpgradeId,
  EquipmentUpgradeRecord,
  MaterialId,
  QuestResources,
} from "../save/model.js";

export type EquipmentUpgradeDefinition = {
  readonly id: EquipmentUpgradeId;
  readonly maxLevel: number;
  readonly costs: (nextLevel: number) => Readonly<Record<MaterialId, number>>;
  readonly apply: (resources: QuestResources, nextLevel: number) => QuestResources;
};

export type EquipmentUpgradeUnlock = {
  readonly id: EquipmentUpgradeId;
  readonly level: number;
};

export type EquipmentUpgradeResult = {
  readonly resources: QuestResources;
  readonly unlocks: readonly EquipmentUpgradeUnlock[];
};

export const EQUIPMENT_UPGRADES: readonly EquipmentUpgradeDefinition[] = [
  {
    id: "trainingBladeGrip",
    maxLevel: 3,
    costs(nextLevel) {
      return {
        focusCrystal: nextLevel * 2,
        repairShard: nextLevel,
      };
    },
    apply(resources) {
      return {
        ...resources,
        hp: resources.hp + 1,
        maxHp: resources.maxHp + 1,
      };
    },
  },
];

export function resolveEquipmentUpgrades(resources: QuestResources): EquipmentUpgradeResult {
  let nextResources = normalizeEquipmentUpgrades(resources);
  const unlocks: EquipmentUpgradeUnlock[] = [];

  for (const definition of EQUIPMENT_UPGRADES) {
    let currentLevel = getEquipmentUpgradeLevel(nextResources, definition.id);
    while (currentLevel < definition.maxLevel) {
      const nextLevel = currentLevel + 1;
      const costs = definition.costs(nextLevel);
      if (!canAfford(nextResources, costs)) {
        break;
      }

      nextResources = definition.apply(
        {
          ...nextResources,
          materials: {
            focusCrystal: nextResources.materials.focusCrystal - costs.focusCrystal,
            repairShard: nextResources.materials.repairShard - costs.repairShard,
          },
          equipmentUpgrades: setEquipmentUpgradeLevel(
            nextResources.equipmentUpgrades,
            definition.id,
            nextLevel,
          ),
        },
        nextLevel,
      );
      unlocks.push({
        id: definition.id,
        level: nextLevel,
      });
      currentLevel = nextLevel;
    }
  }

  return {
    resources: nextResources,
    unlocks,
  };
}

export function getEquipmentUpgradeLevel(
  resources: QuestResources,
  id: EquipmentUpgradeId,
): number {
  return resources.equipmentUpgrades.find((upgrade) => upgrade.id === id)?.level ?? 0;
}

function normalizeEquipmentUpgrades(resources: QuestResources): QuestResources {
  return {
    ...resources,
    equipmentUpgrades: EQUIPMENT_UPGRADES.map((definition) => ({
      id: definition.id,
      level: getEquipmentUpgradeLevel(resources, definition.id),
    })),
  };
}

function canAfford(
  resources: QuestResources,
  costs: Readonly<Record<MaterialId, number>>,
): boolean {
  return (
    resources.materials.focusCrystal >= costs.focusCrystal &&
    resources.materials.repairShard >= costs.repairShard
  );
}

function setEquipmentUpgradeLevel(
  upgrades: readonly EquipmentUpgradeRecord[],
  id: EquipmentUpgradeId,
  level: number,
): readonly EquipmentUpgradeRecord[] {
  const nextUpgrades = upgrades.map((upgrade) =>
    upgrade.id === id ? { ...upgrade, level } : upgrade,
  );

  return nextUpgrades.some((upgrade) => upgrade.id === id)
    ? nextUpgrades
    : [...nextUpgrades, { id, level }];
}
