import type { CSSProperties } from "react";

export function Skeleton({ width, height, radius, style }: { width?: string | number; height?: string | number; radius?: string; style?: CSSProperties }) {
  return <span className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return <article className={`${className} skeleton-card`} aria-hidden="true">
    <Skeleton width="35%" height={11}/>
    <Skeleton width="65%" height={22} style={{ marginTop: 16 }}/>
    <Skeleton width="90%" height={11} style={{ marginTop: 20 }}/>
    <Skeleton width="55%" height={11} style={{ marginTop: 8 }}/>
  </article>;
}

export function RowSkeleton() {
  return <div className="data-row skeleton-row" aria-hidden="true">
    <Skeleton width={22} height={22} radius="7px"/>
    <div style={{ display: "grid", gap: 6, minWidth: 0 }}><Skeleton width="70%" height={14}/><Skeleton width="45%" height={11}/></div>
    <Skeleton width={72} height={20} radius="100px"/>
    <Skeleton width={54} height={12}/>
    <Skeleton width={56} height={16}/>
  </div>;
}

export function ListRowsSkeleton({ count = 4 }: { count?: number }) {
  return <>{Array.from({ length: count }).map((_, index) => <RowSkeleton key={index}/>)}</>;
}

export function CardGridSkeleton({ count = 4, className = "" }: { count?: number; className?: string }) {
  return <>{Array.from({ length: count }).map((_, index) => <CardSkeleton key={index} className={className}/>)}</>;
}
