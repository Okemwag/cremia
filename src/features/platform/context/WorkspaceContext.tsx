import { createContext, useContext } from "react";
import type { SynexAccount } from "../services/synexApi";

export type WorkspaceValue = {
  accounts: SynexAccount[];
  activeAccount?: SynexAccount;
  activeLoginID: string;
  setActiveLoginID: (loginID: string) => void;
  loadingAccounts: boolean;
  previewMode: boolean;
  refreshAccounts: () => Promise<void>;
};

export const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace context is unavailable");
  return value;
}
