import { useEffect, useRef, useState, type PropsWithChildren, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { AuthUser } from "@/shared/types/auth";
import type { DashboardNavItem } from "@/shared/types/dashboard";
import { AppIcon } from "@/shared/ui/AppIcon";

type AppShellProps = PropsWithChildren<{
  user: AuthUser;
  navigation: DashboardNavItem[];
  onLogout: () => Promise<void>;
  sidebarCaption?: string;
  contentPanelClassName?: string;
}>;

export function AppShell({
  children,
  user,
  navigation,
  onLogout,
  sidebarCaption,
  contentPanelClassName,
}: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [manualActiveItemKey, setManualActiveItemKey] = useState(() => getInitialActiveKey(navigation));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["data-santri"]));
  const matchedRouteKey = findNavigationKeyByPath(navigation, location.pathname);
  const activeItemKey = matchedRouteKey ?? manualActiveItemKey;

  const toggleExpanded = (key: string) => {
    setExpandedItems((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  useEffect(() => {
    if (!matchedRouteKey) {
      return;
    }

    const parentKeys = findParentKeysByPath(navigation, location.pathname);
    if (parentKeys.length === 0) {
      return;
    }

    setExpandedItems((current) => new Set([...current, ...parentKeys]));
  }, [location.pathname, matchedRouteKey, navigation]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="min-h-screen p-3 lg:p-5">
        <header className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.5)] backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm"
            aria-label="Buka menu"
          >
            <AppIcon name="menu" className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">PPM KH2</p>
            <p className="truncate text-sm font-semibold text-gray-900">Dashboard</p>
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-sm font-semibold text-emerald-700">
            {user.fullName.slice(0, 1).toUpperCase()}
          </div>
        </header>

        {isSidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-slate-900/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Tutup menu"
          />
        ) : null}

        <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className={`fixed bottom-2 left-2 top-2 z-[70] flex w-[min(88vw,320px)] flex-col overflow-hidden rounded-[1.25rem] border border-gray-100 bg-white shadow-lg transition-transform duration-300 lg:sticky lg:top-5 lg:z-auto lg:h-[calc(100vh-40px)] lg:w-[280px] lg:min-w-[280px] lg:translate-x-0 lg:rounded-[1.5rem] ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"
            }`}
          >
            <SidebarContent
              user={user}
              navigation={navigation}
              sidebarCaption={sidebarCaption}
              onLogout={onLogout}
              onNavigate={() => setIsSidebarOpen(false)}
              expandedItems={expandedItems}
              activeItemKey={activeItemKey}
              onActivate={setManualActiveItemKey}
              onToggleExpanded={toggleExpanded}
              onRouteNavigate={navigate}
            />
          </aside>

          <section className="min-w-0">
            <div
              className={`rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-lg lg:rounded-[1.5rem] lg:p-5 ${contentPanelClassName ?? ""}`}
            >
              {children}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

type SidebarContentProps = {
  user: AuthUser;
  navigation: DashboardNavItem[];
  sidebarCaption?: string;
  onLogout: () => Promise<void>;
  onNavigate: () => void;
  expandedItems: Set<string>;
  activeItemKey: string;
  onActivate: (key: string) => void;
  onToggleExpanded: (key: string) => void;
  onRouteNavigate: (href: string) => void;
};

function SidebarContent({
  user,
  navigation,
  sidebarCaption,
  onLogout,
  onNavigate,
  expandedItems,
  activeItemKey,
  onActivate,
  onToggleExpanded,
  onRouteNavigate,
}: SidebarContentProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationItem = navigation.find((item) => item.key === "notifikasi");
  const primaryNavigation = navigation.filter((item) => item.key !== "notifikasi");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderNavItem = (item: DashboardNavItem, depth: number = 0): ReactNode => {
    const hasChildren = Boolean(item.children?.length);
    const isExpanded = expandedItems.has(item.key);
    const isTopLevel = depth === 0;
    const isActive = activeItemKey === item.key;
    const isParentActive = hasChildren && itemContainsKey(item, activeItemKey);

    return (
      <li key={item.key}>
        <button
          type="button"
          onClick={() => {
            if (hasChildren) {
              onToggleExpanded(item.key);
              return;
            }

            onActivate(item.key);
            setIsProfileMenuOpen(false);
            if (item.href) {
              onRouteNavigate(item.href);
            }
            onNavigate();
          }}
          className={`flex w-full items-center gap-3 text-sm transition ${
            isTopLevel
              ? `rounded-lg px-4 py-2.5 ${
                  isActive || isParentActive
                    ? "bg-emerald-50 font-medium text-emerald-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              : `rounded-lg px-3 py-2 ${
                  isActive ? "bg-emerald-50 font-medium text-emerald-700" : "text-gray-600 hover:bg-gray-50"
                }`
          }`}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {isTopLevel ? (
            <AppIcon
              name={item.icon}
              className={`h-5 w-5 shrink-0 ${isActive || isParentActive ? "text-emerald-700" : "text-current"}`}
            />
          ) : null}

          <span className={isTopLevel ? "flex-1 text-left" : "flex-1 text-left leading-6"}>{item.label}</span>

          {item.badge ? (
            <span className="ml-2 inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700">
              {item.badge}
            </span>
          ) : null}

          {hasChildren ? (
            <AppIcon
              name="chevron"
              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          ) : null}
        </button>

        {hasChildren && isExpanded ? (
          <div className="space-y-0.5 pb-1 pl-12 pr-4 pt-1">
            {item.children!.map((child) => renderNavItem(child, depth + 1))}
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <>
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-2.5">
          <img className="h-8 w-8 object-contain" src="/assets/images/logo_ppm.png" alt="PPM KH2" />
          <span className="whitespace-nowrap text-sm font-semibold text-gray-900">KH2 - Management System</span>
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-5 py-5 text-sm">
        <div className="mb-4">
          <label className="relative block">
            <AppIcon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
            />
          </label>
        </div>

        <ul className="space-y-1 text-gray-700">{primaryNavigation.map((item) => renderNavItem(item))}</ul>
      </nav>

      <div className="mt-auto space-y-3 border-t border-gray-100 px-5 py-4">
        {notificationItem ? (
          <button
            type="button"
            onClick={() => {
              onActivate(notificationItem.key);
              setIsProfileMenuOpen(false);
              onNavigate();
            }}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left transition ${
              activeItemKey === notificationItem.key ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <AppIcon name="bell" className="h-5 w-5" />
              <span className="text-sm">Notifikasi</span>
            </div>
            {notificationItem.badge ? (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                {notificationItem.badge}
              </span>
            ) : null}
          </button>
        ) : null}

        <div className="relative" ref={profileMenuRef}>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
              {user.fullName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold leading-tight text-gray-900">{user.fullName}</div>
              <div className="text-xs text-gray-500">{sidebarCaption ?? getDefaultSidebarCaption(user.role)}</div>
            </div>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((current) => !current)}
              className="text-gray-500 transition hover:text-gray-700"
              aria-label="Buka menu profil"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="4" cy="10" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="16" cy="10" r="1.5" />
              </svg>
            </button>
          </div>

          {isProfileMenuOpen ? (
            <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-400"
                disabled
              >
                <AppIcon name="users" className="h-4 w-4" />
                <span>Profil</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-400"
                disabled
              >
                <AppIcon name="log" className="h-4 w-4" />
                <span>Pengaturan</span>
              </button>
              <div className="my-1 h-px bg-gray-200" />
              <button
                type="button"
                onClick={() => void onLogout()}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
              >
                <AppIcon name="logout" className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function getInitialActiveKey(navigation: DashboardNavItem[]) {
  return (
    navigation.find((item) => item.key === "dashboard")?.key ??
    navigation.find((item) => !item.children?.length && item.key !== "notifikasi")?.key ??
    navigation[0]?.key ??
    ""
  );
}

function itemContainsKey(item: DashboardNavItem, key: string): boolean {
  if (item.key === key) {
    return true;
  }

  return item.children?.some((child) => itemContainsKey(child, key)) ?? false;
}

function findNavigationKeyByPath(items: DashboardNavItem[], path: string): string | null {
  for (const item of items) {
    if (item.href === path) {
      return item.key;
    }

    if (item.children?.length) {
      const matchedChildKey = findNavigationKeyByPath(item.children, path);
      if (matchedChildKey) {
        return matchedChildKey;
      }
    }
  }

  return null;
}

function findParentKeysByPath(
  items: DashboardNavItem[],
  path: string,
  trail: string[] = []
): string[] {
  for (const item of items) {
    const nextTrail = item.children?.length ? [...trail, item.key] : trail;

    if (item.href === path) {
      return trail;
    }

    if (item.children?.length) {
      const childTrail = findParentKeysByPath(item.children, path, nextTrail);
      if (childTrail.length > 0) {
        return childTrail;
      }
    }
  }

  return [];
}

function getDefaultSidebarCaption(role: string) {
  switch (role) {
    case "DewanGuru":
      return "Dewan Guru KH2";
    case "Pengurus":
      return "Pengurus KH2";
    case "WaliSantri":
      return "Wali Santri KH2";
    case "Admin":
      return "Admin KH2";
    default:
      return "Tim: -";
  }
}
