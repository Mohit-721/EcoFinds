import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/ProductCard';

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
        <div className="max-w-6xl mx-auto relative">
            {/* Decorative background images */}
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="decorative-bg" className="absolute top-0 left-0 w-1/3 h-64 object-cover opacity-10 rounded-2xl pointer-events-none select-none z-0" />
            <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80" alt="decorative-bg2" className="absolute bottom-0 right-0 w-1/4 h-48 object-cover opacity-10 rounded-2xl pointer-events-none select-none z-0" />
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight">My Listings</h1>
                    <Link to="/add-product" className="bg-accent text-white px-5 py-3 rounded-lg shadow hover:bg-opacity-90 transition-colors flex items-center gap-2 font-semibold text-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Add New Product
                    </Link>
                </div>
                <div className="bg-white/90 p-8 rounded-2xl shadow-xl min-h-[300px]">
                    {userProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <img src="https://illustrations.popsy.co/gray/empty-box.svg" alt="No listings" className="w-40 mb-6 opacity-80" />
                            <p className="text-2xl text-gray-500 font-medium">You have not listed any products yet.</p>
                            <Link to="/add-product" className="mt-6 bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">Add Your First Listing</Link>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 w-full">
                            <p className="text-2xl text-gray-500 font-medium mb-6">All product photos have been removed for privacy.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyListingsPage;
