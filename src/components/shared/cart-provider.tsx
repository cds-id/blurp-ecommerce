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
import { products } from "@/src/data/products";

export const CART_STORAGE_KEY = "sorastore.cart.v1" as const;

const productById = new Map(products.map((p) => [p.id, p] as const));

export type CartLine = {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
};

type CartState = {
  lines: CartLine[];
  isHydrated: boolean;
};

type AddItemInput = {
  productId: string;
  quantity?: number;
  color?: string;
  size?: string;
};

type LineKey = string;

function makeLineKey(line: Pick<CartLine, "productId" | "color" | "size">): LineKey {
  return `${line.productId}::${line.color ?? ""}::${line.size ?? ""}`;
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(0, Math.floor(quantity));
}

function readStoredCart(): CartLine[] {
  // SSR-safe: only call this in an effect.
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const normalized: CartLine[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const maybe = item as Partial<CartLine>;
      if (typeof maybe.productId !== "string") continue;
      const qty = clampQuantity(typeof maybe.quantity === "number" ? maybe.quantity : 1);
      if (qty <= 0) continue;
      normalized.push({
        productId: maybe.productId,
        quantity: qty,
        color: typeof maybe.color === "string" ? maybe.color : undefined,
        size: typeof maybe.size === "string" ? maybe.size : undefined,
      });
    }
    return normalized;
  } catch {
    return [];
  }
}

type CartAction =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "addItem"; input: AddItemInput }
  | { type: "removeItem"; key: LineKey }
  | { type: "setQuantity"; key: LineKey; quantity: number }
  | { type: "clear" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate": {
      return { lines: action.lines, isHydrated: true };
    }
    case "addItem": {
      const quantity = clampQuantity(action.input.quantity ?? 1);
      if (quantity <= 0) return state;

      const nextLine: CartLine = {
        productId: action.input.productId,
        quantity,
        color: action.input.color,
        size: action.input.size,
      };
      const nextKey = makeLineKey(nextLine);

      const idx = state.lines.findIndex((l) => makeLineKey(l) === nextKey);
      if (idx === -1) return { ...state, lines: [...state.lines, nextLine] };

      const existing = state.lines[idx]!;
      const updated: CartLine = { ...existing, quantity: existing.quantity + quantity };
      const nextLines = state.lines.slice();
      nextLines[idx] = updated;
      return { ...state, lines: nextLines };
    }
    case "removeItem": {
      return { ...state, lines: state.lines.filter((l) => makeLineKey(l) !== action.key) };
    }
    case "setQuantity": {
      const quantity = clampQuantity(action.quantity);
      if (quantity <= 0) {
        return { ...state, lines: state.lines.filter((l) => makeLineKey(l) !== action.key) };
      }
      return {
        ...state,
        lines: state.lines.map((l) => (makeLineKey(l) === action.key ? { ...l, quantity } : l)),
      };
    }
    case "clear": {
      return { ...state, lines: [] };
    }
    default: {
      return state;
    }
  }
}

export type CartContextValue = {
  lines: CartLine[];
  items: Array<{ line: CartLine; product: (typeof products)[number] | null }>;
  count: number;
  subtotal: number;
  isHydrated: boolean;
  addItem: (input: AddItemInput) => void;
  removeItem: (productId: string, variant?: { color?: string; size?: string }) => void;
  setQuantity: (productId: string, quantity: number, variant?: { color?: string; size?: string }) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [], isHydrated: false });

  // Hydrate from localStorage on client only
  useEffect(() => {
    const stored = readStoredCart();
    dispatch({ type: "hydrate", lines: stored });
  }, []);

  // Persist after hydration (avoid clobbering stored cart with empty SSR state)
  const lastPersisted = useRef<string | null>(null);
  useEffect(() => {
    if (!state.isHydrated) return;
    try {
      const payload = JSON.stringify(state.lines);
      if (payload === lastPersisted.current) return;
      localStorage.setItem(CART_STORAGE_KEY, payload);
      lastPersisted.current = payload;
    } catch {
      // ignore quota/security errors
    }
  }, [state.isHydrated, state.lines]);

  const derived = useMemo(() => {
    const count = state.lines.reduce((sum, l) => sum + l.quantity, 0);

    const items = state.lines.map((line) => ({ line, product: productById.get(line.productId) ?? null }));
    const subtotal = items.reduce((sum, it) => sum + (it.product?.price ?? 0) * it.line.quantity, 0);

    return { count, subtotal, items };
  }, [state.lines]);

  const addItem = useCallback((input: AddItemInput) => {
    dispatch({ type: "addItem", input });
  }, []);

  const removeItem = useCallback((productId: string, variant?: { color?: string; size?: string }) => {
    dispatch({ type: "removeItem", key: makeLineKey({ productId, color: variant?.color, size: variant?.size }) });
  }, []);

  const setQuantity = useCallback(
    (productId: string, quantity: number, variant?: { color?: string; size?: string }) => {
      dispatch({
        type: "setQuantity",
        key: makeLineKey({ productId, color: variant?.color, size: variant?.size }),
        quantity,
      });
    },
    []
  );

  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartContextValue>(() => {
    return {
      lines: state.lines,
      items: derived.items,
      count: derived.count,
      subtotal: derived.subtotal,
      isHydrated: state.isHydrated,
      addItem,
      removeItem,
      setQuantity,
      clear,
    };
  }, [
    addItem,
    clear,
    derived.count,
    derived.items,
    derived.subtotal,
    removeItem,
    setQuantity,
    state.isHydrated,
    state.lines,
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

