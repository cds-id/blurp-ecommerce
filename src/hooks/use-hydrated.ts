"use client";

import { useSyncExternalStore } from "react";

/** True after client hydration. Use to avoid showing the wrong responsive branch before mount. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
