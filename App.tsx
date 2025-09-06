
import React, { useState, useEffect, useCallback } from 'react';
import { PageState, Product, Profile, CartItem, Purchase, Category, Page } from './types';
import { CATEGORIES, GENDERS } from './constants';
import { AuthModal } from './components/AuthModal';
import { LeafIcon, UserIcon, CartIcon, SearchIcon, PlusIcon, EditIcon, DeleteIcon, ChevronDownIcon, ArrowLeftIcon, CloseIcon, CheckCircleIcon } from './components/icons';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

// --- HELPER & UI COMPONENTS ---

const RLS_POLICY_SQL = `
-- Run these in your Supabase SQL Editor to allow read access

CREATE POLICY "Products are viewable by everyone."
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);
`;

const ErrorDisplay: React.FC<{ error: string | null; sqlFix?: string }> = ({ error, sqlFix }) => {
    if (!error) return null;
    return (
        <div className="container mx-auto px-4 my-8">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-lg shadow-md" role="alert">
                <p className="font-bold text-lg mb-2">Error: Could Not Fetch Data</p>
                <p className="mb-4 text-sm">{error.split('(Original error:')[0]}</p>
                {sqlFix && (
                    <div className="mt-4">
                        <p className="font-semibold mb-2">Suggested Fix: Enable Row Level Security (RLS)</p>
                        <pre className="bg-gray-800 text-white p-4 rounded-md text-xs overflow-x-auto">
                            <code>{sqlFix}</code>
                        </pre>
                    </div>
                )}
                {error.includes('Original error:') && <p className="text-xs text-red-600 mt-4">Details: {error.split('(Original error:')[1]}</p>}
            </div>
        </div>
    );
};

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
);

const Avatar: React.FC<{ url: string | null | undefined, username: string, size?: number }> = ({ url, username, size = 10 }) => {
    const initials = username?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
    const sizeClasses = `h-${size} w-${size}`;
    
    return url ? (
        <img src={url} alt={username} className={`${sizeClasses} rounded-full object-cover`} />
    ) : (
        <div className={`${sizeClasses} rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg`}>
            {initials}
        </div>
    );
};

const ProductCard: React.FC<{ product: Product, onNavigate: (page: PageState) => void }> = ({ product, onNavigate }) => (
    <div className="bg-white rounded-lg overflow-hidden group border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
        <div className="relative">
            <img src={product.image_urls?.[0] || 'https://placehold.co/600x600/e2e8f0/e2e8f0'} alt={product.name} className="w-full h-56 object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button onClick={() => onNavigate({ page: 'productDetail', props: { productId: product.id } })} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                View Details
            </button>
        </div>
        <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{product.category}</p>
            <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">by {product.profiles?.username || 'Unknown'}</p>
            </div>
        </div>
    </div>
);

const CheckoutSuccessModal: React.FC<{ isOpen: boolean; onClose: () => void; onNavigate: (page: PageState) => void; }> = ({ isOpen, onClose, onNavigate }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl p-8 text-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Your Purchase!</h2>
                <p className="text-gray-600 mb-6">Your order has been successfully processed.</p>
                <button
                    onClick={() => {
                        onClose();
                        onNavigate({ page: 'purchases' });
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    View My Purchases
                </button>
            </div>
        </div>
    );
};


// --- PAGE COMPONENTS ---

const Header: React.FC<{ profile: Profile | null; cartItemCount: number; onNavigate: (page: PageState) => void; onLoginClick: () => void; onLogout: () => void; }> = ({ profile, cartItemCount, onNavigate, onLoginClick, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <button onClick={() => onNavigate({ page: 'home' })} className="flex items-center space-x-2 text-gray-800">
                            <LeafIcon className="h-8 w-8 text-blue-500" />
                            <span className="text-2xl font-bold">EcoFinds</span>
                        </button>
                        <nav className="hidden md:flex space-x-6">
                            {['home', 'myListings', 'purchases'].map((page) => (
                                <button key={page} onClick={() => onNavigate({ page: page as Page })} className="text-gray-600 hover:text-blue-500 transition-colors duration-200 capitalize font-medium">
                                    {page === 'myListings' ? 'My Listings' : page}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                         <button onClick={() => onNavigate({ page: 'cart' })} className="relative text-gray-600 hover:text-blue-500 transition-colors duration-200">
                            <CartIcon className="h-6 w-6" />
                            {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>}
                        </button>
                        {profile ? (
                            <div className="relative">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                                    <Avatar url={profile.avatar_url} username={profile.username} size={8} />
                                    <span className="font-medium hidden sm:inline">{profile.username}</span>
                                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        <button onClick={() => { onNavigate({ page: 'dashboard' }); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">Dashboard</button>
                                        <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={onLoginClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                                Login / Sign Up
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

const HomePage: React.FC<{ products: Product[]; onNavigate: (page: PageState) => void; isLoading: boolean; error: string | null; }> = ({ products, onNavigate, isLoading, error }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200">
                 <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Find Your Next Treasure</h1>
                <p className="text-lg text-blue-500 mb-6">Sustainable choices, exceptional finds. Join the circular economy.</p>
                <div className="relative">
                    <input type="text" placeholder="Search for items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 pl-12 pr-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>
            
            {error && <ErrorDisplay error={error} sqlFix={RLS_POLICY_SQL} />}

            <div className="mb-8 flex flex-wrap gap-2">
                <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}>All</button>
                {CATEGORIES.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}>{cat}</button>)}
            </div>
            {isLoading ? <Spinner /> : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
                    </div>
                    {filteredProducts.length === 0 && !error && <div className="col-span-full text-center py-16"><p className="text-gray-500 text-xl">No products found. Try adjusting your search or filters!</p></div>}
                </>
            )}
        </div>
    );
};

const ProductDetailPage: React.FC<{ productId: string; onNavigate: (page: PageState) => void; onAddToCart: (productId: string, quantity: number) => void }> = ({ productId, onNavigate, onAddToCart }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('products').select('*, profiles(*)').eq('id', productId).single();
            if (error) console.error("Error fetching product", error);
            else setProduct(data as Product);
            setIsLoading(false);
        };
        fetchProduct();
    }, [productId]);

    if (isLoading) return <Spinner />;
    if (!product) return <div className="p-8 text-center text-red-500">Product not found.</div>;
    
    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={() => onNavigate({ page: 'home' })} className="flex items-center text-blue-600 hover:underline mb-6">
                <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to all products
            </button>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
                <div className="md:w-1/2">
                    <img src={product.image_urls?.[0] || 'https://placehold.co/800x800/e2e8f0/e2e8f0'} alt={product.name} className="w-full h-full object-cover"/>
                </div>
                <div className="md:w-1/2 p-8">
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-6">{product.description}</p>
                    <div className="flex items-center mb-6">
                        <Avatar url={product.profiles?.avatar_url} username={product.profiles?.username || 'Unknown'} size={12} />
                        <span className="ml-4 text-gray-700 font-semibold">Sold by {product.profiles?.username}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-4xl font-extrabold text-blue-600">${product.price.toFixed(2)}</p>
                        <button onClick={() => onAddToCart(product.id, 1)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center">
                            <CartIcon className="h-5 w-5 mr-2" /> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CartPage: React.FC<{ items: CartItem[]; onUpdateQuantity: (itemId: number, newQuantity: number) => void; onRemoveItem: (itemId: number) => void; onCheckout: () => void; }> = ({ items, onUpdateQuantity, onRemoveItem, onCheckout }) => {
    const subtotal = items.reduce((acc, item) => acc + (item.products?.price || 0) * item.quantity, 0);
    
    if (items.length === 0) {
        return <div className="p-8 text-center"><h1 className="text-2xl mb-4">Your cart is empty</h1><p className="text-gray-500">Looks like you haven't added anything yet.</p></div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
                    {items.map(item => item.products && (
                        <div key={item.id} className="flex items-center border-b pb-4 last:border-b-0">
                            <img src={item.products.image_urls?.[0] || ''} alt={item.products.name} className="w-24 h-24 rounded-lg object-cover mr-4" />
                            <div className="flex-grow">
                                <h2 className="font-bold">{item.products.name}</h2>
                                <p className="text-sm text-gray-500">${item.products.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input type="number" value={item.quantity} onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)} min="1" className="w-16 text-center border rounded-md py-1" />
                                <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700"><DeleteIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
                    <h2 className="text-xl font-bold border-b pb-4 mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-2"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between mb-4"><span>Shipping</span><span>Free</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
                    <button onClick={onCheckout} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Checkout</button>
                </div>
            </div>
        </div>
    );
};

const PurchasesPage: React.FC<{ purchases: Purchase[] }> = ({ purchases }) => {
    if (purchases.length === 0) {
        return <div className="p-8 text-center"><h1 className="text-2xl mb-4">No Purchase History</h1><p className="text-gray-500">You haven't made any purchases yet.</p></div>
    }

    return (
         <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Purchases</h1>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="space-y-4">
                    {purchases.map(p => p.products && (
                        <div key={p.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                            <div className="flex items-center">
                                <img src={p.products.image_urls?.[0] || ''} alt={p.products.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                                <div>
                                    <p className="font-bold">{p.products.name}</p>
                                    <p className="text-sm text-gray-500">Purchased on {new Date(p.purchased_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className="font-semibold">${(p.price * p.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MyListingsPage: React.FC<{ listings: Product[]; onNavigate: (page: PageState) => void; onDeleteProduct: (productId: string) => Promise<void>; }> = ({ listings, onNavigate, onDeleteProduct }) => {
    
    const handleDelete = async (productId: string) => {
        if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
            await onDeleteProduct(productId);
            alert('Product deleted successfully!');
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>
                <button onClick={() => onNavigate({ page: 'addProduct' })} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add New Product
                </button>
            </div>
            {listings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-200">
                    <p className="text-xl text-gray-500">You haven't listed any items yet.</p>
                    <button onClick={() => onNavigate({ page: 'addProduct' })} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        List Your First Item
                    </button>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="space-y-4">
                        {listings.map(product => (
                            <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                <div className="flex items-center">
                                    <img src={product.image_urls?.[0] || 'https://placehold.co/100x100/e2e8f0/e2e8f0'} alt={product.name} className="w-20 h-20 rounded-lg object-cover mr-4"/>
                                    <div>
                                        <p className="font-bold">{product.name}</p>
                                        <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => onNavigate({ page: 'editProduct', props: { product } })} className="p-2 text-gray-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600"><DeleteIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: Category;
    id?: string;
}

const ProductFormPage: React.FC<{ product?: Product; onSave: (productData: ProductFormData, newFiles: File[], removedImageUrls: string[]) => Promise<void>; onNavigate: (page: PageState) => void }> = ({ product, onSave, onNavigate }) => {
    const [formData, setFormData] = useState<ProductFormData>({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        category: product?.category || CATEGORIES[0],
    });
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>(product?.image_urls || []);
    const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>(product?.image_urls || []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newSelectedFiles = Array.from(e.target.files);
            setNewFiles(prev => [...prev, ...newSelectedFiles]);
            const newPreviews = newSelectedFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };
    
    const handleRemoveImage = (index: number, url: string) => {
        if (existingImageUrls.includes(url)) {
            setRemovedImageUrls(prev => [...prev, url]);
            setExistingImageUrls(prev => prev.filter(u => u !== url));
        } else {
            // It's a new file, find its index in the newFiles array
            const fileIndexToRemove = imagePreviews.slice(0, index).filter(p => !existingImageUrls.includes(p)).length;
            setNewFiles(prev => prev.filter((_, i) => i !== fileIndexToRemove));
        }
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        if (!formData.name || !formData.description || !formData.category) return "Please fill out all fields.";
        if (formData.price <= 0) return "Price must be a positive number.";
        if (imagePreviews.length === 0) return "Please upload at least one image.";
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) { setError(validationError); return; }
        setError('');
        setIsLoading(true);

        const productData: ProductFormData = { ...formData, id: product?.id };
        
        await onSave(productData, newFiles, removedImageUrls);
        setIsLoading(false);
        alert('Product saved successfully!');
        onNavigate({ page: 'myListings' });
    };

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{product ? 'Edit Product' : 'Add a New Product'}</h1>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" id="description" rows={4} value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                             <input type="number" name="price" id="price" value={formData.price} onChange={handleInputChange} step="0.01" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                         <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select name="category" id="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className="flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"><span>Upload files</span><input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*" /></label><p className="pl-1">or drag and drop</p></div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                        {imagePreviews.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {imagePreviews.map((src, index) => (
                                    <div key={src} className="relative">
                                        <img src={src} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                                        <button type="button" onClick={() => handleRemoveImage(index, src)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none shadow-md"><CloseIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => onNavigate({ page: 'myListings' })} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors duration-300">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 disabled:bg-blue-300">
                            {isLoading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DashboardPage: React.FC<{ profile: Profile | null, onProfileUpdate: (p: Partial<Profile>, file?: File) => Promise<void> }> = ({ profile, onProfileUpdate }) => {
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [avatarFile, setAvatarFile] = useState<File | undefined>();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username,
                bio: profile.bio,
                gender: profile.gender,
                address: profile.address,
            });
            setAvatarPreview(profile.avatar_url);
        }
    }, [profile]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onProfileUpdate(formData, avatarFile);
        setIsLoading(false);
        alert('Profile updated successfully!');
    };

    if (!profile) return <Spinner />;

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Dashboard</h1>
             <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <Avatar url={avatarPreview} username={profile.username} size={24} />
                        <div>
                            <label htmlFor="avatar-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <span>Change</span>
                                <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea name="bio" id="bio" rows={3} value={formData.bio || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select name="gender" id="gender" value={formData.gender || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                         <div>
                             <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                             <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 disabled:bg-blue-300">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-white text-gray-600 mt-12 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
                <p>&copy; {new Date().getFullYear()} EcoFinds. All rights reserved.</p>
                <p className="text-sm">A platform for a sustainable future.</p>
            </div>
        </div>
    </footer>
);

// --- MAIN APP COMPONENT ---

export default function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [myListings, setMyListings] = useState<Product[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageState, setPageState] = useState<PageState>({ page: 'home' });
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const fetchAllUserData = useCallback(async (userId: string) => {
        setIsLoading(true);
        await Promise.all([
            fetchProfile(userId),
            fetchCart(userId),
            fetchMyListings(userId),
            fetchPurchases(userId)
        ]);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
        
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchAllUserData(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchAllUserData(session.user.id);
            } else {
                setProfile(null);
                setCartItems([]);
                setMyListings([]);
                setPurchases([]);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchAllUserData]);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error) console.error('Error fetching profile:', error);
        else setProfile(data);
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase.from('products').select('*, profiles(*)');
        if(error) {
            console.error('Error fetching products:', error);
            setError(`Failed to load products. This is often due to missing Row Level Security (RLS) policies. (Original error: ${error.message})`);
            setProducts([]);
        }
        else {
            setProducts(data as Product[] || []);
        }
        setIsLoading(false);
    };

    const fetchCart = async (userId: string) => {
        const { data, error } = await supabase.from('cart_items').select('*, products(*, profiles(*))').eq('user_id', userId);
        if (error) console.error('Error fetching cart:', error);
        else setCartItems(data as CartItem[] || []);
    };
    
    const fetchMyListings = async (userId: string) => {
        const { data, error } = await supabase.from('products').select('*, profiles(*)').eq('seller_id', userId);
        if (error) console.error('Error fetching my listings:', error);
        else setMyListings(data as Product[] || []);
    };

    const fetchPurchases = async (userId: string) => {
        const { data, error } = await supabase.from('purchases').select('*, products(*, profiles(*))').eq('user_id', userId);
        if (error) console.error('Error fetching purchases:', error);
        else setPurchases(data as Purchase[] || []);
    };
    
    const handleNavigate = useCallback((newPageState: PageState) => {
        const protectedPages: Page[] = ['myListings', 'addProduct', 'editProduct', 'purchases', 'dashboard', 'cart'];
        if (protectedPages.includes(newPageState.page) && !session) {
            setAuthMode('login');
            setIsAuthModalOpen(true);
            return;
        }
        setPageState(newPageState);
        window.scrollTo(0, 0);
    }, [session]);

    const handleLogin = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) return error.message;
        setIsAuthModalOpen(false);
        handleNavigate({ page: 'home' });
        return null;
    };

    const handleRegister = async (email: string, username: string, pass: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { data: { username } } });
        if (error) return error.message;
        setIsAuthModalOpen(false);
        alert("Registration successful! Check your email to confirm your account (if enabled in Supabase).");
        handleNavigate({ page: 'home' });
        return null;
    };
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        handleNavigate({ page: 'home' });
    };

    const handleProfileUpdate = async (updateData: Partial<Profile>, file?: File) => {
        if (!profile) return;
    
        let avatar_url = profile.avatar_url;
    
        if (file) {
            const filePath = `${profile.id}/${Date.now()}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
            if (uploadError) {
                alert('Error uploading avatar: ' + uploadError.message);
                return;
            }
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatar_url = data.publicUrl;
        }
    
        const { id, ...profileData } = updateData;
        const finalUpdateData = { ...profileData, avatar_url };
    
        const { error } = await supabase.from('profiles').update(finalUpdateData).eq('id', profile.id);
        if (error) {
            alert('Could not update profile: ' + error.message);
        } else {
            await fetchProfile(profile.id);
        }
    };
    
    const handleSaveProduct = async (productData: ProductFormData, newFiles: File[], removedImageUrls: string[]) => {
        if (!profile) return;
        // Fix: Define `product` to get existing `image_urls` for updates.
        const product = productData.id ? products.find(p => p.id === productData.id) : undefined;

        // 1. Remove images from storage if needed
        if (removedImageUrls.length > 0) {
            const filePaths = removedImageUrls.map(url => url.split('/product_images/')[1]);
            await supabase.storage.from('product_images').remove(filePaths);
        }
    
        // 2. Upload new images
        let newImageUrls: string[] = [];
        if (newFiles.length > 0) {
            const uploadPromises = newFiles.map(file => {
                const filePath = `${profile.id}/${productData.id || Date.now()}/${file.name}`;
                return supabase.storage.from('product_images').upload(filePath, file);
            });
            const uploadResults = await Promise.all(uploadPromises);
    
            const failedUploads = uploadResults.filter(res => res.error);
            if (failedUploads.length > 0) {
                alert(`Error uploading images: ${failedUploads.map(f => f.error?.message).join(', ')}`);
                // Consider how to handle partial failure
                return;
            }
            newImageUrls = uploadResults.map(res => supabase.storage.from('product_images').getPublicUrl(res.data!.path).data.publicUrl);
        }

        // 3. Consolidate image URLs
        const existingUrls = product?.image_urls?.filter(url => !removedImageUrls.includes(url)) || [];
        const finalImageUrls = [...existingUrls, ...newImageUrls];

        const dataToSave = {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            image_urls: finalImageUrls,
            seller_id: profile.id,
        };

        // 4. Save to database
        if (productData.id) { // Update
            const { seller_id, ...updatePayload } = dataToSave;
            const { error } = await supabase.from('products').update(updatePayload).eq('id', productData.id);
            if (error) alert(`Error updating product: ${error.message}`);
        } else { // Create
            const { error } = await supabase.from('products').insert(dataToSave);
            if (error) alert(`Error creating product: ${error.message}`);
        }
        await fetchMyListings(profile.id);
        await fetchProducts();
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!profile) return;
        
        const productToDelete = myListings.find(p => p.id === productId);
        if (productToDelete?.image_urls && productToDelete.image_urls.length > 0) {
            const filePaths = productToDelete.image_urls.map(url => url.split('/product_images/')[1]);
            await supabase.storage.from('product_images').remove(filePaths);
        }

        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) alert(`Error deleting product: ${error.message}`);
        else {
            await fetchMyListings(profile.id);
            await fetchProducts();
        }
    };

    const handleAddToCart = async (productId: string, quantity: number) => {
        if (!profile) { handleNavigate({ page: 'home' }); return; }
        const existingItem = cartItems.find(item => item.products?.id === productId);
        if (existingItem) {
            await handleUpdateCartQuantity(existingItem.id, existingItem.quantity + quantity);
        } else {
            const { error } = await supabase.from('cart_items').insert({ product_id: productId, user_id: profile.id, quantity });
            if (error) alert('Error adding to cart');
            else await fetchCart(profile.id);
        }
        alert('Item added to cart!');
    };
    
    const handleUpdateCartQuantity = async (itemId: number, newQuantity: number) => {
        if (!profile) return;
        if (newQuantity < 1) { await handleRemoveFromCart(itemId); return; }
        const { error } = await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', itemId);
        if (error) alert('Error updating cart');
        else await fetchCart(profile.id);
    };

    const handleRemoveFromCart = async (itemId: number) => {
        if (!profile) return;
        const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
        if (error) alert('Error removing from cart');
        else await fetchCart(profile.id);
    };
    
    const handleCheckout = async () => {
        if (!profile || cartItems.length === 0) return;
        const purchaseItems = cartItems.map(item => ({
            user_id: profile.id,
            product_id: item.products!.id,
            price: item.products!.price,
            quantity: item.quantity,
        }));

        const { error: purchaseError } = await supabase.from('purchases').insert(purchaseItems);
        if (purchaseError) {
            alert("Error processing your order. Please try again.");
            return;
        }

        const itemIds = cartItems.map(item => item.id);
        const { error: clearCartError } = await supabase.from('cart_items').delete().in('id', itemIds);
        if (clearCartError) {
            alert("Could not clear your cart. Please contact support.");
            // Even if cart clear fails, the purchase went through, so we should still update state.
        }
        
        await fetchCart(profile.id);
        await fetchPurchases(profile.id);
        setIsCheckoutModalOpen(true);
    };

    const renderPage = () => {
        const { page, props } = pageState;
        switch (page) {
            case 'home': return <HomePage products={products} onNavigate={handleNavigate} isLoading={isLoading} error={error} />;
            case 'productDetail': return <ProductDetailPage productId={props?.productId} onNavigate={handleNavigate} onAddToCart={handleAddToCart} />;
            case 'cart': return <CartPage items={cartItems} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveFromCart} onCheckout={handleCheckout} />;
            case 'purchases': return <PurchasesPage purchases={purchases} />;
            case 'dashboard': return <DashboardPage profile={profile} onProfileUpdate={handleProfileUpdate} />;
            case 'myListings': return <MyListingsPage listings={myListings} onNavigate={handleNavigate} onDeleteProduct={handleDeleteProduct} />;
            case 'addProduct': return <ProductFormPage onSave={handleSaveProduct} onNavigate={handleNavigate} />;
            case 'editProduct': return <ProductFormPage product={props?.product} onSave={handleSaveProduct} onNavigate={handleNavigate} />;
            default: return <HomePage products={products} onNavigate={handleNavigate} isLoading={isLoading} error={error} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
            <Header profile={profile} cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} onNavigate={handleNavigate} onLoginClick={() => setIsAuthModalOpen(true)} onLogout={handleLogout} />
            <main className="flex-grow">{renderPage()}</main>
            <Footer />
            <AuthModal isOpen={isAuthModalOpen} mode={authMode} onClose={() => setIsAuthModalOpen(false)} onSwitchMode={setAuthMode} onLogin={handleLogin} onRegister={handleRegister} />
            <CheckoutSuccessModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} onNavigate={handleNavigate} />
        </div>
    );
}