
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const CartPage: React.FC = () => {
    const { cartItems, removeFromCart, checkout } = useCart();
    const navigate = useNavigate();
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = () => {
        checkout();
        alert("Thank you for your purchase!");
        navigate('/purchases');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-6">My Cart</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {cartItems.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-500 mb-4">Your cart is empty.</p>
                        <Link to="/" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 border-b">
                                    <div className="flex items-center gap-4">
                                        <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-md"/>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                                            <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-bold text-lg text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-right">
                            <h2 className="text-2xl font-bold">Subtotal: <span className="text-primary">${subtotal.toFixed(2)}</span></h2>
                            <button onClick={handleCheckout} className="mt-4 bg-accent text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartPage;
