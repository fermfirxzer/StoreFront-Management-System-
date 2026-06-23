import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { logoutRequest } from "../../api/auth";
import type { AuthUser } from "../../types/auth";
import { useAuthStore } from "../../stores/authStore";

interface UserMenuProps {
  user: AuthUser;
}

export default function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const displayName = user.username?.trim() || user.email;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await logoutRequest();
    } finally {
      clearSession();
      navigate("/login");
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-white transition-colors duration-150 hover:bg-white/25"
        onClick={() => {
          setIsOpen((value) => !value);
        }}
        type="button"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-[12px] font-bold">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="max-w-[9rem] truncate text-[14px] font-medium">
          {displayName}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-white/75" />
      </button>

      <div
        className={[
          "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[#E0E7FF] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-200",
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible translate-y-1 opacity-0",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-[#1E1B4B]">{displayName}</p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            {user.role}
          </p>
        </div>
        <Link
          className="block w-full px-4 py-3 text-left text-[14px] font-medium text-[#1E1B4B] transition-colors duration-150 hover:bg-[#F8FAFF]"
          onClick={() => {
            setIsOpen(false);
          }}
          to="/history"
        >
          History
        </Link>
        <button
          className="w-full px-4 py-3 text-left text-[14px] font-medium text-[#FF3B30] transition-colors duration-150 hover:bg-[#FFF5F5]"
          onClick={() => {
            void handleSignOut();
          }}
          type="button"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
