import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  addCartItem, CART_STORAGE_KEY, CartLine, countCartItems, LEGACY_CART_STORAGE_KEY,
  parseCart, parseLegacyCart, removeCartItem, serializeCart, setCartItemQuantity,
} from "@/lib/cart";
import { listProducts, reconcileCart, type CartIssue, type ReconciledCartItem } from "@/lib/api/products";
import { reconciledSubtotal } from "@/lib/cart-reconciliation";

type CommerceContextValue = {
  cart: CartLine[];
  cartDetails: ReconciledCartItem[];
  cartIssues: CartIssue[];
  cartCount: number;
  subtotal: number;
  reconciling: boolean;
  cartOpen: boolean;
  announcement: string;
  addToCart: (variantId: string, quantity?: number, productName?: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<{ items: ReconciledCartItem[]; issues: CartIssue[] }>;
  openCart: () => void;
  closeCart: () => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartDetails, setCartDetails] = useState<ReconciledCartItem[]>([]);
  const [cartIssues, setCartIssues] = useState<CartIssue[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const syncVersion = useRef(0);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const current = parseCart(window.localStorage.getItem(CART_STORAGE_KEY));
      if (current.length) {
        if (alive) setCart(current);
      } else {
        const legacy = parseLegacyCart(window.localStorage.getItem(LEGACY_CART_STORAGE_KEY));
        if (legacy.length) {
          try {
            const { items: products } = await listProducts({ limit: 100 });
            const variants = new Map(products.map((product) => [product.id, product.defaultVariantId]));
            const migrated = legacy.flatMap((line) => {
              const variantId = variants.get(line.productId);
              return variantId ? [{ variantId, quantity: line.quantity }] : [];
            });
            if (alive) setCart(migrated);
            window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
          } catch {
            if (alive) setAnnouncement("We couldn't restore the previous bag. Please try again.");
          }
        }
      }
      if (alive) setHydrated(true);
    })();
    return () => { alive = false; };
  }, []);

  const sync = useCallback(async (lines: CartLine[]) => {
    const version = ++syncVersion.current;
    if (!lines.length) {
      setCartDetails([]);
      setCartIssues([]);
      return { items: [] as ReconciledCartItem[], issues: [] as CartIssue[] };
    }
    setReconciling(true);
    try {
      const result = await reconcileCart(lines);
      if (version !== syncVersion.current) return { items: [] as ReconciledCartItem[], issues: [] as CartIssue[] };
      setCartDetails(result.items);
      setCartIssues(result.issues);
      return result;
    } catch {
      if (version !== syncVersion.current) return { items: [] as ReconciledCartItem[], issues: [] as CartIssue[] };
      const result = { items: [] as ReconciledCartItem[], issues: [{ variantId: "cart", type: "API_UNAVAILABLE", message: "Your bag could not be verified right now." } as CartIssue] };
      setCartIssues(result.issues);
      return result;
    } finally {
      if (version === syncVersion.current) setReconciling(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(cart));
    void sync(cart);
  }, [cart, hydrated, sync]);

  const addToCart = useCallback((variantId: string, quantity = 1, productName?: string) => {
    setCart((lines) => addCartItem(lines, variantId, quantity));
    setAnnouncement(`${productName ?? "Item"} added to your bag.`);
  }, []);
  const setQuantity = useCallback((variantId: string, quantity: number) => setCart((lines) => setCartItemQuantity(lines, variantId, quantity)), []);
  const removeFromCart = useCallback((variantId: string) => {
    const detail = cartDetails.find((item) => item.variantId === variantId);
    setCart((lines) => removeCartItem(lines, variantId));
    setAnnouncement(`${detail?.product.name ?? "Item"} removed from your bag.`);
  }, [cartDetails]);
  const clearCart = useCallback(() => {
    setCart([]); setCartDetails([]); setCartIssues([]); setAnnouncement("Your bag is now empty.");
  }, []);
  const refreshCart = useCallback(() => sync(cart), [cart, sync]);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo<CommerceContextValue>(() => ({
    cart,
    cartDetails,
    cartIssues,
    cartCount: countCartItems(cart),
    subtotal: reconciledSubtotal(cartDetails.map((item) => ({ quantity: item.requestedQuantity, variant: item.variant }))),
    reconciling,
    cartOpen,
    announcement,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    openCart,
    closeCart,
  }), [cart, cartDetails, cartIssues, reconciling, cartOpen, announcement, addToCart, setQuantity, removeFromCart, clearCart, refreshCart, openCart, closeCart]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used inside CommerceProvider");
  return context;
}
