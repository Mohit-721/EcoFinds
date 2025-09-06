
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getProductById } = useProducts();
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const product = getProductById(id || '');

    if (!product) {
        return <div className="text-center py-10">Product not found.</div>;
    }

    const handleAddToCart = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        addToCart(product);
        alert(`${product.title} added to cart!`);
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
            <button onClick={() => navigate(-1)} className="mb-6 text-primary hover:text-accent font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to listings
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img src={product.imageUrl} alt={product.title} className="w-full h-auto rounded-lg shadow-md object-cover max-h-[500px]" />
                </div>
                <div className="flex flex-col justify-between">
                    <div>
                        <span className="inline-block bg-secondary text-primary text-sm font-semibold px-3 py-1 rounded-full mb-2">{product.category}</span>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.title}</h1>
                        <p className="text-gray-600 text-lg mb-6">{product.description}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-4">Sold by: {product.sellerUsername}</p>
                         <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                            <p className="text-4xl font-extrabold text-primary">${product.price.toFixed(2)}</p>
                            <button onClick={handleAddToCart} className="px-8 py-3 bg-accent text-white font-bold rounded-lg shadow-md hover:bg-opacity-90 transition-transform transform hover:scale-105">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
