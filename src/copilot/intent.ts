import { ResolvedValue } from "./types";

/* Question vs. edit-instruction heuristic. Every edit verb the revise*
   functions already key off (shorter/formal/casual/"set X to Y"/etc.)
   is phrased as a statement, never a question — so a cheap wh-word/"?"
   check is enough to separate the two, without duplicating that verb
   vocabulary here. */
export function classifyIntent(instruction: string): "edit" | "question" {
  const s = instruction.trim();
  if (!s) return "edit";
  if (s.endsWith("?")) return "question";
  if (/^(what|why|how|who|which|when|where|is|are|does|do|can|could|should)\b/i.test(s)) return "question";
  return "edit";
}

function formatOne(value: string | string[]): string {
  return Array.isArray(value) ? value.join(", ") : value;
}

/* Pure prose formatter for the Q&A fallback — reads a resolved
   reference back to the user, no heuristics of its own. */
export function describeValue(label: string, value: ResolvedValue): string {
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
    const fields = value as { label: string; value: string | string[] }[];
    return fields.map((f) => `${f.label}: ${formatOne(f.value)}`).join("\n");
  }
  return `${label}: ${formatOne(value as string | string[])}`;
}
