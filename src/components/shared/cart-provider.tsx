"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { cartApi } from "@/src/lib/api";
import type { CartLineItem, CartSummary } from "@/src/lib/api/cart";

const CART_POLL_MS = 0; // set >0 if you ever want periodic refresh

type CartState = {
  summary: CartSummary | null;
  isHydrated: boolean;
  isSyncing: boolean;
};

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(0, Math.floor(quantity));
}

type CartAction =
  | { type: "hydrate"; summary: CartSummary | null }
  | { type: "setSyncing"; isSyncing: boolean };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate": {
      return { summary: action.summary, isHydrated: true, isSyncing: false };
    }
    case "setSyncing": {
      return { ...state, isSyncing: action.isSyncing };
    }
    default: {
      return state;
    }
  }
}

export type CartContextValue = {
  summary: CartSummary | null;
  lineItems: CartLineItem[];
  count: number;
  subtotal: number;
  isHydrated: boolean;
  isSyncing: boolean;
  refresh: () => Promise<void>;
  addVariant: (input: { variantId: string; quantity?: number }) => Promise<void>;
  setItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    summary: null,
    isHydrated: false,
    isSyncing: false,
  });

  const syncingRef = useRef(false);
  const refresh = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    dispatch({ type: "setSyncing", isSyncing: true });
    try {
      const res = await cartApi.getCart();
      dispatch({ type: "hydrate", summary: res });
    } finally {
      syncingRef.current = false;
      dispatch({ type: "setSyncing", isSyncing: false });
    }
  }, []);

  // Initial hydrate
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Optional polling (off by default)
  useEffect(() => {
    if (!CART_POLL_MS) return;
    const t = window.setInterval(() => void refresh(), CART_POLL_MS);
    return () => window.clearInterval(t);
  }, [refresh]);

  const addVariant = useCallback(async (input: { variantId: string; quantity?: number }) => {
    const quantity = clampQuantity(input.quantity ?? 1);
    if (quantity <= 0) return;
    dispatch({ type: "setSyncing", isSyncing: true });
    try {
      await cartApi.addCartItem({ variant_id: input.variantId, quantity });
      await refresh();
    } finally {
      dispatch({ type: "setSyncing", isSyncing: false });
    }
  }, [refresh]);

  const setItemQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    const q = clampQuantity(quantity);
    dispatch({ type: "setSyncing", isSyncing: true });
    try {
      if (q <= 0) {
        await cartApi.removeCartItem(cartItemId);
      } else {
        await cartApi.updateCartItem(cartItemId, { quantity: q });
      }
      await refresh();
    } finally {
      dispatch({ type: "setSyncing", isSyncing: false });
    }
  }, [refresh]);

  const removeItem = useCallback(async (cartItemId: string) => {
    dispatch({ type: "setSyncing", isSyncing: true });
    try {
      await cartApi.removeCartItem(cartItemId);
      await refresh();
    } finally {
      dispatch({ type: "setSyncing", isSyncing: false });
    }
  }, [refresh]);

  const clear = useCallback(async () => {
    dispatch({ type: "setSyncing", isSyncing: true });
    try {
      await cartApi.clearCart();
      await refresh();
    } finally {
      dispatch({ type: "setSyncing", isSyncing: false });
    }
  }, [refresh]);

  const value = useMemo<CartContextValue>(() => {
    const summary = state.summary;
    const lineItems = summary?.line_items ?? [];
    const count = summary?.total_items ?? 0;
    const subtotal = summary?.subtotal_idr ?? 0;
    return {
      summary,
      lineItems,
      count,
      subtotal,
      isHydrated: state.isHydrated,
      isSyncing: state.isSyncing,
      refresh,
      addVariant,
      setItemQuantity,
      removeItem,
      clear,
    };
  }, [
    addVariant,
    clear,
    refresh,
    removeItem,
    setItemQuantity,
    state.isHydrated,
    state.isSyncing,
    state.summary,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within <CartProvider />");
  }
  return ctx;
}

