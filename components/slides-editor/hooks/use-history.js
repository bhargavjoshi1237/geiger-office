"use client";

import { useState } from "react";

// Generic undo/redo state container (keeps up to 40 past snapshots).
export function useHistory(initialSlides) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialSlides);
  const [future, setFuture] = useState([]);

  const commit = (updater) => {
    setPresent((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      if (next === current) return current;
      setPast((items) => [...items.slice(-40), current]);
      setFuture([]);
      return next;
    });
  };

  const undo = () => {
    setPast((items) => {
      if (!items.length) return items;
      const previous = items[items.length - 1];
      setFuture((futureItems) => [present, ...futureItems]);
      setPresent(previous);
      return items.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((items) => {
      if (!items.length) return items;
      const next = items[0];
      setPast((pastItems) => [...pastItems, present]);
      setPresent(next);
      return items.slice(1);
    });
  };

  const reset = (next) => {
    setPast([]);
    setFuture([]);
    setPresent(next);
  };

  return { canRedo: future.length > 0, canUndo: past.length > 0, commit, present, redo, reset, undo };
}
