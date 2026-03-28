type AppIconName =
  | "dashboard"
  | "users"
  | "book"
  | "clock"
  | "shield"
  | "search"
  | "logout"
  | "menu"
  | "calendar"
  | "team"
  | "verify"
  | "activity"
  | "log"
  | "progress"
  | "chevron"
  | "spark"
  | "mail"
  | "bell"
  | "plus"
  | "pencil"
  | "x"
  | "inbox"
  | "filter"
  | "more"
  | "arrow-left"
  | "arrow-right"
  | "check"
  | "chevron-down"
  | "chevron-right"
  | "trash";

type AppIconProps = {
  name: AppIconName;
  className?: string;
};

export function AppIcon({ name, className = "h-5 w-5" }: AppIconProps) {
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <rect x="3" y="3" width="5.5" height="5.5" rx="1.2" />
          <rect x="11.5" y="3" width="5.5" height="5.5" rx="1.2" />
          <rect x="3" y="11.5" width="5.5" height="5.5" rx="1.2" />
          <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.2" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M7 7.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
          <path d="M13.5 8.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" />
          <path d="M2.75 16.25a4.25 4.25 0 0 1 8.5 0" />
          <path d="M11.5 15.75a3.5 3.5 0 0 1 5.75-2.7" />
        </svg>
      );
    case "book":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M5 3.25h9A1.75 1.75 0 0 1 15.75 5v11.75H6.75A2.75 2.75 0 0 0 4 19.5V4.25A1 1 0 0 1 5 3.25Z" />
          <path d="M6.75 16.75h9" />
          <path d="M7.5 7h5" />
          <path d="M7.5 10h5" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <circle cx="10" cy="10" r="6.75" />
          <path d="M10 6.5v4l2.75 1.75" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M10 2.75 4.5 5v4.5c0 3.74 2.33 6.37 5.5 7.75 3.17-1.38 5.5-4.01 5.5-7.75V5L10 2.75Z" />
          <path d="m7.75 10 1.5 1.5 3-3.5" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <circle cx="8.75" cy="8.75" r="4.75" />
          <path d="m12.5 12.5 4 4" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M8 3.5H5.75A1.75 1.75 0 0 0 4 5.25v9.5c0 .97.78 1.75 1.75 1.75H8" />
          <path d="M11 13.75 14.75 10 11 6.25" />
          <path d="M7 10h7.5" />
        </svg>
      );
    case "menu":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M3.5 5.75h13" />
          <path d="M3.5 10h13" />
          <path d="M3.5 14.25h13" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <rect x="3.25" y="4.5" width="13.5" height="12.25" rx="2" />
          <path d="M6.5 2.75v3.5" />
          <path d="M13.5 2.75v3.5" />
          <path d="M3.25 8h13.5" />
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M6.75 8A2.25 2.25 0 1 0 6.75 3.5 2.25 2.25 0 0 0 6.75 8Z" />
          <path d="M13.25 8A2.25 2.25 0 1 0 13.25 3.5 2.25 2.25 0 0 0 13.25 8Z" />
          <path d="M2.75 15a4 4 0 0 1 8 0" />
          <path d="M9.25 15a4 4 0 0 1 8 0" />
        </svg>
      );
    case "verify":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M10 2.75 4.5 5v4.5c0 3.74 2.33 6.37 5.5 7.75 3.17-1.38 5.5-4.01 5.5-7.75V5L10 2.75Z" />
          <path d="m7.75 10 1.5 1.5 3-3.5" />
        </svg>
      );
    case "activity":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M3 10h3l1.5-4 3 8 2-4h4.5" />
        </svg>
      );
    case "log":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M4.75 3.5h10.5A1.75 1.75 0 0 1 17 5.25v9.5A1.75 1.75 0 0 1 15.25 16.5H4.75A1.75 1.75 0 0 1 3 14.75v-9.5A1.75 1.75 0 0 1 4.75 3.5Z" />
          <path d="M6.5 7.25h7" />
          <path d="M6.5 10h7" />
          <path d="M6.5 12.75h4.5" />
        </svg>
      );
    case "progress":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M4 15.25h12" />
          <path d="M6.5 13V8.5" />
          <path d="M10 13V5.5" />
          <path d="M13.5 13v-3.75" />
        </svg>
      );
    case "chevron":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="m7 6 4 4-4 4" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 2.5 11.7 7 16.5 8.8l-4.8 1.8-1.7 4.4-1.7-4.4L3.5 8.8 8.3 7 10 2.5Z" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <rect x="3" y="4.5" width="14" height="11" rx="2" />
          <path d="m4.5 6 5.5 4.5L15.5 6" />
        </svg>
      );
    case "bell":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M10 3.5a4 4 0 0 0-4 4v2.1c0 .8-.26 1.58-.74 2.23L4 13.5h12l-1.26-1.67A3.7 3.7 0 0 1 14 9.6V7.5a4 4 0 0 0-4-4Z" />
          <path d="M8 15.25a2 2 0 0 0 4 0" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M10 4v12" />
          <path d="M4 10h12" />
        </svg>
      );
    case "pencil":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="m13.5 4.5 2 2a1.4 1.4 0 0 1 0 2l-7.75 7.75-3.25.75.75-3.25L13.5 4.5Z" />
          <path d="m12.5 5.5 2 2" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="m5 5 10 10" />
          <path d="M15 5 5 15" />
        </svg>
      );
    case "inbox":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M4.5 6.25 6 4.5h8l1.5 1.75v8A1.75 1.75 0 0 1 13.75 16H6.25A1.75 1.75 0 0 1 4.5 14.25v-8Z" />
          <path d="M4.5 10.5h3l1 1.75h3l1-1.75h3" />
        </svg>
      );
    case "filter":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M4 5h12" />
          <path d="M7 10h6" />
          <path d="M9 15h2" />
        </svg>
      );
    case "more":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
          <circle cx="4" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="16" cy="10" r="1.5" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="m8 5-5 5 5 5" />
          <path d="M4 10h13" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="m12 5 5 5-5 5" />
          <path d="M16 10H3" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="m4.5 10 3.25 3.25L15.5 5.5" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="m5 7 5 6 5-6" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="m7 5 6 5-6 5" />
        </svg>
      );
    case "trash":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M4.75 6h10.5" />
          <path d="M7.25 6V4.5h5.5V6" />
          <path d="m6.25 6 .5 9.25A1.5 1.5 0 0 0 8.24 16.5h3.52a1.5 1.5 0 0 0 1.5-1.25L13.75 6" />
          <path d="M8.5 8.5v5" />
          <path d="M11.5 8.5v5" />
        </svg>
      );
    default:
      return null;
  }
}
