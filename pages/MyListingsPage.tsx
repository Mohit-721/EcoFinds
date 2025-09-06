
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';

const MyListingsPage: React.FC = () => {
    const { products, deleteProduct } = useProducts();
    const { currentUser } = useAuth();

    const userProducts = useMemo(() => {
        return products.filter(p => p.sellerId === currentUser?.id);
    }, [products, currentUser]);
    
    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            await deleteProduct(id);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary">My Listings</h1>
                <Link to="/add-product" className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add New Product
                </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {userProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">You have not listed any products yet.</p>
                ) : (
                    <div className="space-y-4">
                        {userProducts.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <img src={product.imageUrl} alt={product.title} className="w-20 h-20 object-cover rounded-md"/>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{product.title}</h3>
                                        <p className="text-primary font-semibold">${product.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Link to={`/edit-product/${product.id}`} className="text-blue-600 hover:underline">Edit</Link>
                                    <button onClick={() => handleDelete(product.id, product.title)} className="text-red-600 hover:underline">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyListingsPage;
