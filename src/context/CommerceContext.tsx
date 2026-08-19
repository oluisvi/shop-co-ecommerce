import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { allProducts } from "@/data/catalog";
import {
  addCartItem,
  calculateCartSubtotal,
  CART_STORAGE_KEY,
  CartLine,
  countCartItems,
  parseCart,
  removeCartItem,
  serializeCart,
  setCartItemQuantity,
} from "@/lib/cart";
import { getProductById } from "@/lib/catalog";

type CommerceContextValue = {
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  cartOpen: boolean;
  announcement: string;
  addToCart: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setCart(parseCart(window.localStorage.getItem(CART_STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(cart));
  }, [cart, hydrated]);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    setCart((lines) => addCartItem(lines, productId, quantity));
    const product = getProductById(allProducts, productId);
    setAnnouncement(
      product ? `${product.name} added to your bag.` : "Item added to your bag.",
    );
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((lines) => setCartItemQuantity(lines, productId, quantity));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    const product = getProductById(allProducts, productId);
    setCart((lines) => removeCartItem(lines, productId));
    setAnnouncement(
      product ? `${product.name} removed from your bag.` : "Item removed from your bag.",
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAnnouncement("Your bag is now empty.");
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo<CommerceContextValue>(
    () => ({
      cart,
      cartCount: countCartItems(cart),
      subtotal: calculateCartSubtotal(cart, allProducts),
      cartOpen,
      announcement,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      openCart,
      closeCart,
    }),
    [
      addToCart,
      announcement,
      cart,
      cartOpen,
      clearCart,
      closeCart,
      openCart,
      removeFromCart,
      setQuantity,
    ],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used inside CommerceProvider");
  return context;
}
