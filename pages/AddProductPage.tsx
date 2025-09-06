
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { CATEGORIES } from '../constants';

const AddProductPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(CATEGORIES[1]);
    const { addProduct } = useProducts();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            alert("You must be logged in to add a product.");
            return;
        }
        await addProduct({
            title,
            description,
            price: parseFloat(price),
            category,
            imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`, // Placeholder image
            sellerId: currentUser.id,
            sellerUsername: currentUser.username,
        });
        navigate('/my-listings');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 text-primary hover:text-accent font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back
            </button>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">Add New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Product Title</label>
                        <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                               <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input id="price" type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="0.00" step="0.01" min="0"/>
                        </div>
                    </div>
                     <p className="text-sm text-gray-500">Image upload is not available in this demo. A placeholder image will be used.</p>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Submit Listing
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductPage;
