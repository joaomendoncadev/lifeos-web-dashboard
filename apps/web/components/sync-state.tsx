import { AlertTriangle, Cloud, LoaderCircle, RefreshCw } from "lucide-react";

export function SyncState({ loading, error, onRetry }: { loading: boolean; source?: "api"; warning?: string; error?: string; onRetry: () => void }) {
  if (loading) return <div className="sync-state"><LoaderCircle className="spin" size={15} /> Sincronizando</div>;
  if (error) return <button className="sync-state danger" onClick={onRetry}><AlertTriangle size={15} /> {error} <RefreshCw size={14} /></button>;
  return <div className="sync-state success"><Cloud size={15} /> Sincronizado com LifeOS API</div>;
}
