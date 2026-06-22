import { useEffect } from "react";
import { refreshRequest } from "../api/auth";
import { useAuthStore } from "../stores/authStore";

export default function AuthBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const setSession = useAuthStore((state) => state.setSession);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (accessToken) {
        setBootstrapped();
        return;
      }

      try {
        const session = await refreshRequest();
        if (!cancelled) {
          setSession({
            accessToken: session.access,
            user: session.user,
          });
        }
      } catch {
        if (!cancelled) {
          // No refresh cookie or cookie expired. Stay signed out.
        }
      } finally {
        if (!cancelled) {
          setBootstrapped();
        }
      }
    }

    if (isBootstrapping) {
      void restoreSession();
    }

    return () => {
      cancelled = true;
    };
  }, [accessToken, isBootstrapping, setBootstrapped, setSession]);

  return null;
}

