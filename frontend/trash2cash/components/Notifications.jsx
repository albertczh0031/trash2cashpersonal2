"use client";

import React from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const API_URL = "http://trash2cashpersonal.onrender.com/api/notifications/"; // trailing slash
const API_REFRESH_TOKEN = "http://trash2cashpersonal.onrender.com/api/token/refresh/";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  const tryKeys = [
    ["localStorage", "accessToken"],
    ["localStorage", "access"],
    ["localStorage", "token"],
    ["sessionStorage", "accessToken"],
    ["sessionStorage", "access"],
    ["sessionStorage", "token"],
  ];
  for (const [where, key] of tryKeys) {
    const store = where === "localStorage" ? localStorage : sessionStorage;
    const v = store.getItem(key);
    if (v) return v;
  }
  return null;
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  const tryKeys = [
    ["localStorage", "refresh"],
    ["sessionStorage", "refresh"],
  ];
  for (const [where, key] of tryKeys) {
    const store = where === "localStorage" ? localStorage : sessionStorage;
    const v = store.getItem(key);
    if (v) return v;
  }
  return null;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.floor(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell({
  className = "",
  pollMs = 15000,
  listMaxHeight = "max-h-[28rem]",
  width = "w-96",
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [error, setError] = React.useState("");

  const unreadCount = items.length;

  const fetchNotifs = React.useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const token = getAccessToken();
      if (!token) {
        console.warn("[notifications] No access token in storage (checked accessToken/access/token)");
        setItems([]);
      }

      const masked = token.length > 8 ? token.slice(0, 4) + "…" + token.slice(-4) : "<short>";
      console.log(`[notifications] using token: ${masked}`);

      const res = await fetch(API_URL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.warn("[notifications] Fetch failed:", res.status, res.statusText);
        const txt = await res.text().catch(() => "");
        setItems([]);

        // Only refresh if unauthorized
        if (res.status === 401) {
          console.warn("[notifications] Access expired, refreshing...");
          try {
            // get the refresh token from localStorage
            const refresh = getRefreshToken();
            console.log(`[notifications] refresh token: ${refresh ? "<present>" : "<missing>"}`);

            // If refresh token is missing, clear storage and redirect to login
            // This is a fallback; ideally the user should not reach here without a refresh token
            try {
              if (!refresh)  {
                console.warn("[notifications] Refresh token non-existent, clearing storage and redirecting to login.");
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = "/login";
                throw new Error("Session expired, redirecting to login.");
              }
            } catch (e) {
              console.error("Error during session cleanup or redirect:", e);
            }

            // Attempt to refresh the access token using the refresh token
            const refreshRes = await fetch(API_REFRESH_TOKEN, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh }),
            });

            // If refresh fails, clear storage and redirect to login
            if (!refreshRes.ok) {
                localStorage.clear();
                sessionStorage.clear();
                const rtxt = await refreshRes.text().catch(() => "");
                throw new Error(`Token refresh failed: ${refreshRes.status} ${rtxt}`);
            }

            const refreshData = await refreshRes.json();
            const newToken = refreshData.access;

            console.log("[notifications] Refresh token:", refreshRes.status);
            console.log(`[notifications] new access token: ${newToken ? "<present)" : "<missing>"}`);

            // Remove old access tokens from all possible keys and storages
            // Ideally we should only use "access" in localStorage,
            // but we clean up all possible keys for safety because legacy code might have used them
            const accessKeys = ["accessToken", "access", "token"];
            for (const key of accessKeys) {
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
            }
            localStorage.setItem("access", newToken);


            // Retry notifications fetch with new token
            const retryRes = await fetch(API_URL, {
              method: "GET",
              headers: { Authorization: `Bearer ${newToken}` },
            });
            console.log("[notifications] Retry Notification Retrievel: ", refreshRes.status);

            if (retryRes.ok) {
              const data = await retryRes.json();
              setItems(Array.isArray(data) ? data : []);
            } else {
              setItems([]);
            }
          } catch (refreshError) {
            console.error("[notifications] Refresh or retry failed:", refreshError);
          }
        }
      }
      else {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("notifications fetch failed", e);
      setItems([]);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchNotifs(); }, [fetchNotifs]);
  React.useEffect(() => {
    const id = setInterval(fetchNotifs, pollMs);
    return () => clearInterval(id);
  }, [fetchNotifs, pollMs]);

  return (
    <DropdownMenu open={open} onOpenChange={(v) => { setOpen(v); if (v) fetchNotifs(); }}>
      <DropdownMenuTrigger asChild>
        <div className={`relative cursor-pointer ${className}`} aria-label="Notifications" role="button">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1.5 text-center text-[11px] font-semibold leading-5 text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={`${width} p-0`}>
        <div className="p-3">
          <DropdownMenuLabel className="text-base">Notifications</DropdownMenuLabel>
          <p className="mt-1 text-xs text-muted-foreground">
            {loading ? "Loading…" : unreadCount === 0 ? "You’re all caught up." : "Unread only"}
          </p>
        </div>
        <DropdownMenuSeparator />

        <div className={`overflow-y-auto ${listMaxHeight}`}>
          {error && <div className="px-4 py-3 text-xs text-red-600">{error}</div>}

          {!error && items.length === 0 && !loading && (
            <div className="px-4 py-6 text-sm text-muted-foreground">No new notifications.</div>
          )}

          {!error && items.length > 0 && (
            <div className="py-1">
              {items.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="text-sm">{n.message}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{timeAgo(n.created_at)}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
