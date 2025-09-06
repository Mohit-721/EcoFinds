
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { CartItem, Product, Purchase } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CartContextType {
    cartItems: CartItem[];
    purchases: Purchase[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    checkout: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    const getStorageKey = useCallback((type: 'cart' | 'purchases') => {
        if (!currentUser) return null;
        return `${type}_${currentUser.id}`;
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            const cartKey = getStorageKey('cart');
            const purchasesKey = getStorageKey('purchases');
            
            try {
                const storedCart = localStorage.getItem(cartKey!);
                if (storedCart) setCartItems(JSON.parse(storedCart));
                else setCartItems([]);
                
                const storedPurchases = localStorage.getItem(purchasesKey!);
                if (storedPurchases) setPurchases(JSON.parse(storedPurchases));
                else setPurchases([]);
            } catch (error) {
                console.error("Failed to parse data from localStorage", error);
            }
        } else {
            setCartItems([]);
            setPurchases([]);
        }
    }, [currentUser, getStorageKey]);

    const persistData = useCallback((key: string | null, data: any) => {
        if (key) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    }, []);

    const addToCart = useCallback((product: Product) => {
        const newCartItems = [...cartItems];
        const existingItem = newCartItems.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            newCartItems.push({ ...product, quantity: 1 });
        }
        setCartItems(newCartItems);
        persistData(getStorageKey('cart'), newCartItems);
    }, [cartItems, getStorageKey, persistData]);

    const removeFromCart = useCallback((productId: string) => {
        const newCartItems = cartItems.filter(item => item.id !== productId);
        setCartItems(newCartItems);
        persistData(getStorageKey('cart'), newCartItems);
    }, [cartItems, getStorageKey, persistData]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        persistData(getStorageKey('cart'), []);
    }, [getStorageKey, persistData]);

    const checkout = useCallback(() => {
        if (cartItems.length === 0) return;
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newPurchase: Purchase = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: cartItems.map(({quantity, ...item}) => item),
            total,
        };
        const updatedPurchases = [...purchases, newPurchase];
        setPurchases(updatedPurchases);
        persistData(getStorageKey('purchases'), updatedPurchases);
        clearCart();
    }, [cartItems, purchases, getStorageKey, persistData, clearCart]);

    const value = { cartItems, purchases, addToCart, removeFromCart, clearCart, checkout };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
