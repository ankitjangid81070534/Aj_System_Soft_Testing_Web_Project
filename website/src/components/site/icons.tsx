import {
  AppWindow,
  Briefcase,
  ClipboardList,
  Cloud,
  Code2,
  Factory,
  GraduationCap,
  Globe,
  Hotel,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  MessageSquare,
  Monitor,
  Pill,
  Rocket,
  Server,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Stethoscope,
  Store,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

/**
 * CMS rows reference icons by stable string keys; this map resolves them to
 * lucide components with a safe fallback.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  code: Code2,
  globe: Globe,
  smartphone: Smartphone,
  "app-window": AppWindow,
  dashboard: LayoutDashboard,
  cart: ShoppingCart,
  cloud: Cloud,
  server: Server,
  monitor: Monitor,
  store: Store,
  stethoscope: Stethoscope,
  pill: Pill,
  hotel: Hotel,
  factory: Factory,
  education: GraduationCap,
  truck: Truck,
  briefcase: Briefcase,
};

export function iconFor(key?: string | null, fallback: LucideIcon = Code2): LucideIcon {
  if (key && ICON_MAP[key]) return ICON_MAP[key];
  return fallback;
}

/**
 * Render an icon directly as JSX (instead of assigning the component to a
 * local variable in render scope, which React's static-components lint
 * rejects).
 */
export function renderIcon(key: string | null | undefined, className = "h-5 w-5"): ReactNode {
  const Icon = iconFor(key);
  return <Icon aria-hidden="true" className={className} />;
}

export const TRUST_ICONS = { ClipboardList, KeyRound, LifeBuoy, MessageSquare } as const;
export const PROCESS_ICONS = { ListChecks, Rocket, Wrench, ShieldCheck } as const;
export const PLATFORM_ICONS = {
  Monitor,
  Cloud,
  Smartphone,
  AppWindow,
  LayoutDashboard,
  Stethoscope,
} as const;
