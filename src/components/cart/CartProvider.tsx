"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";
import { MAX_ORDER_QTY } from "@/lib/checkout/config";

const STORAGE_KEY = "respak_cart_v1";

interface CartContextValue {
  items: CartItem[];
  /** True once the cart has been rehydrated from localStorage (client only). */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Unique key for a cart line (product + variant). */
export const cartLineKey = (item: Pick<CartItem, "productId" | "variantLabel">) =>
  `${item.productId}::${item.variantLabel ?? ""}`;

function readStored(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) =>
        i &&
        typeof i.productId === "string" &&
        typeof i.qty === "number" &&
        i.qty > 0 &&
        typeof i.unitPrice === "number"
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Rehydrate once on mount (client only — avoids SSR mismatch).
  useEffect(() => {
    setItems(readStored());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / private mode — ignore */
    }
  }, [items, ready]);

  const add = useCallback(
    (item: Omit<CartItem, "qty"> & { qty?: number }) => {
      const qty = Math.min(
        MAX_ORDER_QTY,
        Math.max(1, Math.round(item.qty ?? 1))
      );
      const key = cartLineKey(item);
      setItems((prev) => {
        const existing = prev.find((i) => cartLineKey(i) === key);
        if (existing) {
          return prev.map((i) =>
            cartLineKey(i) === key
              ? { ...i, qty: Math.min(MAX_ORDER_QTY, i.qty + qty) }
              : i
          );
        }
        return [...prev, { ...item, qty }];
      });
    },
    []
  );

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => {
      const next = qty < 1 ? qty : Math.min(MAX_ORDER_QTY, Math.round(qty));
      return next < 1
        ? prev.filter((i) => cartLineKey(i) !== key)
        : prev.map((i) => (cartLineKey(i) === key ? { ...i, qty: next } : i));
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => cartLineKey(i) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const i of items) {
      c += i.qty;
      s += i.unitPrice * i.qty;
    }
    return { count: c, subtotal: s };
  }, [items]);

  const value = useMemo(
    () => ({ items, ready, count, subtotal, add, setQty, remove, clear }),
    [items, ready, count, subtotal, add, setQty, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
