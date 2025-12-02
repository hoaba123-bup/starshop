import { Product } from "../types/product";

const CART_KEY = "cart";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AddToCartResult {
  success: boolean;
  cart: CartItem[];
  message?: string;
}

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(data: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(data));
}

export function getCart() {
  return read();
}

export function addToCart(product: Product, quantity: number): AddToCartResult {
  const cart = read();
  if (quantity <= 0) {
    return { success: false, cart, message: "So luong khong hop le" };
  }
  const idx = cart.findIndex((c) => String(c.product.id) === String(product.id));
  const currentQty = idx >= 0 ? cart[idx].quantity : 0;
  const stock = typeof product.stock === "number" ? product.stock : undefined;

  if (typeof stock === "number") {
    const remaining = stock - currentQty;
    if (remaining <= 0) {
      return { success: false, cart, message: "San pham da het hang" };
    }
    if (quantity > remaining) {
      return {
        success: false,
        cart,
        message: `Chi con ${remaining} san pham trong kho`,
      };
    }
  }

  if (idx >= 0) {
    cart[idx].quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  write(cart);
  return { success: true, cart };
}

export function updateQuantity(productId: string | number, quantity: number) {
  const cart = read();
  const idx = cart.findIndex((c) => String(c.product.id) === String(productId));
  if (idx >= 0) {
    cart[idx].quantity = quantity;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  }
  write(cart);
  return cart;
}

export function removeFromCart(productId: string | number) {
  const cart = read().filter((c) => String(c.product.id) !== String(productId));
  write(cart);
  return cart;
}

export function cartTotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function clearCart() {
  write([]);
}
