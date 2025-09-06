
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { CATEGORIES } from '../constants';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const HomePage: React.FC = () => {
    const { products } = useProducts();
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredProducts = useMemo(() => {
        return products
            .filter(product =>
                selectedCategory === 'All' || product.category === selectedCategory
            )
            .filter(product =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [products, searchTerm, selectedCategory]);

    return (
        <div className="space-y-8">
            <div className="text-center p-8 bg-secondary rounded-lg shadow-inner">
                <h1 className="text-4xl font-bold text-white">Find Your Next Treasure</h1>
                <p className="text-lg text-primary mt-2">Sustainable choices, unique finds. Welcome to our community.</p>
            </div>
            
            <div className="sticky top-[80px] z-40 bg-background/90 backdrop-blur-sm py-4 rounded-lg shadow">
                <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                 <div className="text-center py-16">
                    <p className="text-xl text-gray-500">No products found. Try adjusting your search or filters!</p>
                </div>
            )}
            
            {currentUser && (
                <Link to="/add-product" className="fixed bottom-8 right-8 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transform hover:scale-110 transition-all duration-300 z-50">
                    <PlusIcon />
                </Link>
            )}
        </div>
    );
};

export default HomePage;
