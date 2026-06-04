"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const DEBOUNCE_MS = Number(process.env.NEXT_PUBLIC_DEBOUNCE_TIME) || 1000;
const LOAD_TIMEOUT_MS = 20000;

function apiBase() {
  const isProd = process.env.NODE_ENV === "production";
  const configuredBasePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  const basePath =
    configuredBasePath &&
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith(`${configuredBasePath}/`) &&
    window.location.pathname !== configuredBasePath
      ? ""
      : configuredBasePath;
  return `${basePath}/api/files`;
}

function fileIdFromPathname(pathname) {
  const parts = pathname?.split("/").filter(Boolean) ?? [];
  const routeIndex = parts.findIndex((part) =>
    part === "document" || part === "sheet" || part === "slide"
  );
  return routeIndex >= 0 ? parts[routeIndex + 1] : null;
}

export function useOfficeFile(fileId) {
  const pathname = usePathname();
  const effectiveFileId = useMemo(
    () => fileId || fileIdFromPathname(pathname),
    [fileId, pathname],
  );
  const [file, setFile] = useState(null);
  const [initialContent, setInitialContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [role, setRole] = useState(null);
  const [starred, setStarred] = useState(false);

  const canEditRef = useRef(false);

  const pendingContentRef = useRef(undefined);
  const pendingNameRef = useRef(undefined);
  const dirtyRef = useRef(false);
  const timerRef = useRef(null);
  const inFlightRef = useRef(false);
  const missingFileId = !effectiveFileId;

  useEffect(() => {
    if (!effectiveFileId) return;
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);
    setIsLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const res = await fetch(`${apiBase()}/${effectiveFileId}`, {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (cancelled) return;
        const effectiveRole = data._role ?? "owner";
        canEditRef.current = effectiveRole === "owner" || effectiveRole === "editor";
        setRole(effectiveRole);
        setFile(data);
        setStarred(Boolean(data.starred));
        setInitialContent(data.content ?? {});
      } catch (err) {
        if (!cancelled) {
          const message = err.name === "AbortError" ? "File load timed out" : err.message;
          setLoadError(message || "Failed to load file");
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [effectiveFileId]);

  const flush = useCallback(async () => {
    if (!effectiveFileId || !dirtyRef.current || inFlightRef.current) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const payload = {};
    if (pendingContentRef.current !== undefined) payload.content = pendingContentRef.current;
    if (pendingNameRef.current !== undefined) payload.name = pendingNameRef.current;
    if (Object.keys(payload).length === 0) {
      dirtyRef.current = false;
      return;
    }

    dirtyRef.current = false;
    inFlightRef.current = true;
    setStatus("saving");
    try {
      const res = await fetch(`${apiBase()}/${effectiveFileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setStatus(dirtyRef.current ? "saving" : "saved");
    } catch {
      dirtyRef.current = true;
      setStatus("error");
    } finally {
      inFlightRef.current = false;
      if (dirtyRef.current && !timerRef.current) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          flush();
        }, DEBOUNCE_MS);
      }
    }
  }, [effectiveFileId]);

  const schedule = useCallback(() => {
    dirtyRef.current = true;
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      flush();
    }, DEBOUNCE_MS);
  }, [flush]);

  const saveContent = useCallback(
    (content) => {
      if (!canEditRef.current) return;
      pendingContentRef.current = content;
      schedule();
    },
    [schedule],
  );

  const rename = useCallback(
    (name) => {
      if (!canEditRef.current) return;
      pendingNameRef.current = name;
      setFile((prev) => (prev ? { ...prev, name } : prev));
      schedule();
    },
    [schedule],
  );

  const toggleStar = useCallback(async () => {
    if (!effectiveFileId) return;
    let next;
    setStarred((prev) => {
      next = !prev;
      return next;
    });
    setFile((prev) => (prev ? { ...prev, starred: next } : prev));
    try {
      const res = await fetch(`${apiBase()}/${effectiveFileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setStarred(!next);
      setFile((prev) => (prev ? { ...prev, starred: !next } : prev));
    }
  }, [effectiveFileId]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const onBeforeUnload = () => {
      flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      flush();
    };
  }, [flush]);

  return {
    file,
    initialContent,
    isLoading: missingFileId ? false : isLoading,
    loadError: missingFileId ? "Missing file id" : loadError,
    status,
    role,
    canEdit: role === "owner" || role === "editor",
    starred,
    toggleStar,
    saveContent,
    rename,
    flush,
  };
}
