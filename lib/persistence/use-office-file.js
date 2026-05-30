"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = Number(process.env.NEXT_PUBLIC_DEBOUNCE_TIME) || 1000;

function apiBase() {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api/files`;
}

export function useOfficeFile(fileId) {
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

  useEffect(() => {
    if (!fileId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const res = await fetch(`${apiBase()}/${fileId}`, {
          headers: { "Content-Type": "application/json" },
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
        if (!cancelled) setLoadError(err.message || "Failed to load file");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileId]);

  const flush = useCallback(async () => {
    if (!fileId || !dirtyRef.current || inFlightRef.current) return;
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
      const res = await fetch(`${apiBase()}/${fileId}`, {
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
  }, [fileId]);

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
    if (!fileId) return;
    let next;
    setStarred((prev) => {
      next = !prev;
      return next;
    });
    setFile((prev) => (prev ? { ...prev, starred: next } : prev));
    try {
      const res = await fetch(`${apiBase()}/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setStarred(!next);
      setFile((prev) => (prev ? { ...prev, starred: !next } : prev));
    }
  }, [fileId]);

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
    isLoading,
    loadError,
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
