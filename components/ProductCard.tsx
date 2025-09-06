
import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out group">
            <Link to={`/product/${product.id}`}>
                <div className="relative">
                    <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-cover" />
                    <div className="absolute top-0 right-0 bg-accent text-white px-3 py-1 m-2 rounded-full text-sm font-semibold">{product.category}</div>
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-primary transition-colors">{product.title}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">${product.price.toFixed(2)}</p>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
