
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

interface ProductContextType {
    products: Product[];
    getProductById: (id: string) => Product | undefined;
    addProduct: (productData: Omit<Product, 'id'>) => Promise<Product>;
    updateProduct: (id: string, productData: Partial<Product>) => Promise<Product | null>;
    deleteProduct: (id: string) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        try {
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            } else {
                localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
                setProducts(INITIAL_PRODUCTS);
            }
        } catch (error) {
            console.error("Failed to parse products from localStorage", error);
            localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
            setProducts(INITIAL_PRODUCTS);
        }
    }, []);

    const getProductById = useCallback((id: string) => {
        return products.find(p => p.id === id);
    }, [products]);

    const addProduct = useCallback(async (productData: Omit<Product, 'id'>): Promise<Product> => {
        const newProduct: Product = { ...productData, id: Date.now().toString() };
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        return newProduct;
    }, [products]);

    const updateProduct = useCallback(async (id: string, productData: Partial<Product>): Promise<Product | null> => {
        let updatedProduct: Product | null = null;
        const updatedProducts = products.map(p => {
            if (p.id === id) {
                updatedProduct = { ...p, ...productData };
                return updatedProduct;
            }
            return p;
        });
        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        return updatedProduct;
    }, [products]);

    const deleteProduct = useCallback(async (id: string): Promise<void> => {
        const updatedProducts = products.filter(p => p.id !== id);
        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
    }, [products]);

    const value = { products, getProductById, addProduct, updateProduct, deleteProduct };

    return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
