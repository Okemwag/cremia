import { createContext, useContext } from "react";
import type { AccountPositionEvent, AccountStreamStatus, AccountTransactionEvent } from "../services/accountStream";
import type { SynexAccount } from "../services/synexApi";

export type WorkspaceValue = {
  accounts: SynexAccount[];
  activeAccount?: SynexAccount;
  activeLoginID: string;
  setActiveLoginID: (loginID: string) => void;
  loadingAccounts: boolean;
  refreshAccounts: () => Promise<void>;
  accountStreamStatus: AccountStreamStatus;
  lastTransaction?: AccountTransactionEvent;
  positionUpdates: Record<number, AccountPositionEvent>;
};

export const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace context is unavailable");
  return value;
}
