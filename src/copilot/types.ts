/* ════════════════════════════════════════════════════════════════════
   Copilot — shared types
   A "reference" is anything a user can hover/pin on either review
   surface (onboarding review step or Knowledge Center). Each page
   registers one adapter slice per id prefix so the floating widget
   never needs to know the concrete data shape it's pointing at.
══════════════════════════════════════════════════════════════════════ */

export interface CopilotReference {
  id: string;
  label: string;
}

export type ResolvedValue = string | string[] | { label: string; value: string | string[] }[];

export interface ResolvedReference extends CopilotReference {
  value: ResolvedValue;
}

export interface CopilotAdapterSlice {
  resolve(id: string): ResolvedReference | null;
  applyEdit(id: string, instruction: string): Promise<{ changedSummary: string } | null>;
}
