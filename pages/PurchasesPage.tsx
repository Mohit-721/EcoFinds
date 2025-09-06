
import React from 'react';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';

const PurchasesPage: React.FC = () => {
    const { purchases } = useCart();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-6">My Purchase History</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {purchases.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-500 mb-4">You have no past purchases.</p>
                         <Link to="/" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(purchase => (
                            <div key={purchase.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                                    <div>
                                        <p className="font-bold">Order #{purchase.id.slice(-6)}</p>
                                        <p className="text-sm text-gray-500">Date: {new Date(purchase.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="font-bold text-lg text-primary">Total: ${purchase.total.toFixed(2)}</p>
                                </div>
                                <div className="space-y-2">
                                    {purchase.items.map(item => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-md"/>
                                            <div>
                                                <h4 className="font-semibold">{item.title}</h4>
                                                <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchasesPage;
