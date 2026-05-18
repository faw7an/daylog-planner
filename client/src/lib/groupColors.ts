export type GroupColor = "purple" | "teal" | "amber" | "blue" | "coral";

export const GROUP_COLORS: { key: GroupColor; hex: string; varName: string }[] = [
  { key: "purple", hex: "#7c3aed", varName: "var(--color-group-purple)" },
  { key: "teal", hex: "#14b8a6", varName: "var(--color-group-teal)" },
  { key: "amber", hex: "#f59e0b", varName: "var(--color-group-amber)" },
  { key: "blue", hex: "#3b82f6", varName: "var(--color-group-blue)" },
  { key: "coral", hex: "#f97316", varName: "var(--color-group-coral)" },
];

export function colorVar(color: string): string {
  const found = GROUP_COLORS.find((c) => c.key === color);
  return found ? found.varName : GROUP_COLORS[0].varName;
}
