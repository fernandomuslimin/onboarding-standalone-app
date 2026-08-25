import { Dispatch, SetStateAction, createContext, useContext, useEffect, useRef, useState } from "react";
import { CopilotAdapterSlice, CopilotReference, ResolvedReference } from "./types";

/* ════════════════════════════════════════════════════════════════════
   Copilot — shared context
   The one deliberate exception to this codebase's plain useState-per-
   page convention: the floating widget must be reachable from data
   owners that sit 2-3 component layers deep (Explorer, Company.tsx's
   CompanySection) without threading callbacks through every
   intermediate pane. Holds only UI state (pinned refs, hover, open) —
   actual data lives wherever it already did, reached through a small
   prefix-keyed adapter map.
══════════════════════════════════════════════════════════════════════ */

interface CopilotContextValue {
  pinned: CopilotReference[];
  pin: (ref: CopilotReference) => void;
  unpin: (id: string) => void;
  hoveredId: string | null;
  setHoveredId: Dispatch<SetStateAction<string | null>>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  resolve: (id: string) => ResolvedReference | null;
  applyEdit: (id: string, instruction: string) => Promise<{ changedSummary: string } | null>;
  registerAdapter: (prefix: string, slice: CopilotAdapterSlice) => void;
  unregisterAdapter: (prefix: string) => void;
}

const CopilotContext = createContext<CopilotContextValue | null>(null);

function prefixOf(id: string): string {
  return id.split(":")[0];
}

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState<CopilotReference[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const adaptersRef = useRef(new Map<string, CopilotAdapterSlice>());

  function pin(ref: CopilotReference) {
    setPinned((current) => (current.some((r) => r.id === ref.id) ? current : [...current, ref]));
  }
  function unpin(id: string) {
    setPinned((current) => current.filter((r) => r.id !== id));
  }
  function resolve(id: string): ResolvedReference | null {
    const slice = adaptersRef.current.get(prefixOf(id));
    return slice ? slice.resolve(id) : null;
  }
  async function applyEdit(id: string, instruction: string) {
    const slice = adaptersRef.current.get(prefixOf(id));
    return slice ? slice.applyEdit(id, instruction) : null;
  }
  function registerAdapter(prefix: string, slice: CopilotAdapterSlice) {
    adaptersRef.current.set(prefix, slice);
  }
  function unregisterAdapter(prefix: string) {
    adaptersRef.current.delete(prefix);
  }

  const value: CopilotContextValue = {
    pinned, pin, unpin, hoveredId, setHoveredId,
    isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), toggle: () => setIsOpen((o) => !o),
    resolve, applyEdit, registerAdapter, unregisterAdapter,
  };

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot(): CopilotContextValue {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within a CopilotProvider");
  return ctx;
}

/* Registers (and keeps fresh) the adapter slice for one id prefix.
   Runs every render so the slice's closures always see current state,
   not whatever was captured at mount. */
export function useRegisterCopilotAdapter(prefix: string, slice: CopilotAdapterSlice) {
  const { registerAdapter, unregisterAdapter } = useCopilot();
  registerAdapter(prefix, slice);
  useEffect(() => () => unregisterAdapter(prefix), [prefix]);
}
