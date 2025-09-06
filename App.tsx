
import React, { useState, useEffect, useCallback } from 'react';
import { PageState, Product, Profile, CartItem, Purchase, Category, Page } from './types';
import { CATEGORIES, GENDERS } from './constants';
import { AuthModal } from './components/AuthModal';
import { LeafIcon, UserIcon, CartIcon, SearchIcon, PlusIcon, EditIcon, DeleteIcon, ChevronDownIcon, ArrowLeftIcon, CloseIcon } from './components/icons';
import { supabase } from './lib/supabaseClient';
// Fix: Use a type-only import for Session to correct module resolution issues that cause cascading type errors.
import type { Session } from '@supabase/supabase-js';

// --- HELPER & UI COMPONENTS ---

const RLS_POLICY_SQL = `
-- Run these in your Supabase SQL Editor

-- 1. Enable read access for products
CREATE POLICY "Products are viewable by everyone."
ON public.products FOR SELECT
USING (true);

-- 2. Enable read access for profiles
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
                        <p className="font-semibold mb-2">Suggested Fix:</p>
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
    const initials = username?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?';
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

// ... Placeholder pages for brevity. In a real app, these would be fully built out.
const ProductDetailPage: React.FC<{ productId: string; onNavigate: (page: PageState) => void }> = ({ productId, onNavigate }) => <div className="p-8"><button onClick={() => onNavigate({page: 'home'})} className="text-blue-500">&larr; Back</button><h1 className="text-2xl">Product Detail Page: {productId}</h1></div>;
const CartPage: React.FC = () => <div className="p-8"><h1 className="text-2xl">Cart Page</h1></div>;
const PurchasesPage: React.FC = () => <div className="p-8"><h1 className="text-2xl">Purchase History</h1></div>;
const MyListingsPage: React.FC = () => <div className="p-8"><h1 className="text-2xl">My Listings</h1></div>;
const ProductFormPage: React.FC<{ product?: Product; onNavigate: (page: PageState) => void }> = ({ product, onNavigate }) => <div className="p-8"><h1 className="text-2xl">{product ? 'Edit Product' : 'Add Product'}</h1></div>;


const DashboardPage: React.FC<{ profile: Profile | null; onProfileUpdate: (updatedProfile: Partial<Profile>) => Promise<void>; onNavigate: (page: PageState) => void; }> = ({ profile, onProfileUpdate, onNavigate }) => {
    const [formData, setFormData] = useState<Partial<Profile>>({ ...profile });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !profile) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setIsLoading(true);
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

        if (uploadError) {
            alert('Error uploading file.');
            console.error(uploadError);
        } else {
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const newAvatarUrl = data.publicUrl;
            setFormData(prev => ({...prev, avatar_url: newAvatarUrl}));
            await onProfileUpdate({ avatar_url: newAvatarUrl });
        }
        setIsLoading(false);
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onProfileUpdate(formData);
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
                        <Avatar url={formData.avatar_url} username={profile.username} size={24} />
                        <div>
                             <label htmlFor="avatar-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                {isLoading ? 'Uploading...' : 'Upload New Picture'}
                             </label>
                             <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isLoading} />
                             <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB.</p>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea name="bio" id="bio" rows={3} value={formData.bio || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select name="gender" id="gender" value={formData.gender || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select...</option>
                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="text-right">
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageState, setPageState] = useState<PageState>({ page: 'home' });
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (session?.user) {
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [session]);
    
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProfile = async () => {
        if(!session?.user) return;
        const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
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
        if(data.user) { // Create a profile entry
            // FIX: The Supabase client's `insert` method can be sensitive to the payload shape.
            // Passing the new profile record inside an array can help TypeScript correctly resolve
            // the method's overloads and avoid type inference issues.
            await supabase.from('profiles').insert([{ id: data.user.id, username }]);
        }
        setIsAuthModalOpen(false);
        handleNavigate({ page: 'home' });
        return null;
    };
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        handleNavigate({ page: 'home' });
    };

    const handleProfileUpdate = async (updatedProfile: Partial<Profile>) => {
        if(!profile) return;
        // FIX: The `id` property from the `Profile` (a `Row` type) is not allowed in an `update` operation.
        // Using object destructuring with a rest parameter (`...rest`) creates a new object `updateData`
        // that excludes `id`, ensuring the payload matches the expected `Update` type for the 'profiles' table.
        const { id, ...updateData } = updatedProfile;

        const { error } = await supabase.from('profiles').update(updateData).eq('id', profile.id);
        if(error) alert('Could not update profile.');
        else await fetchProfile();
    };

    const renderPage = () => {
        const { page, props } = pageState;
        switch (page) {
            case 'home': return <HomePage products={products} onNavigate={handleNavigate} isLoading={isLoading} error={error} />;
            case 'productDetail': return <ProductDetailPage productId={props?.productId} onNavigate={handleNavigate} />;
            case 'cart': return <CartPage />;
            case 'purchases': return <PurchasesPage />;
            case 'dashboard': return <DashboardPage profile={profile} onProfileUpdate={handleProfileUpdate} onNavigate={handleNavigate} />;
            case 'myListings': return <MyListingsPage />;
            case 'addProduct': return <ProductFormPage onNavigate={handleNavigate} />;
            case 'editProduct': return <ProductFormPage product={props?.product} onNavigate={handleNavigate} />;
            default: return <HomePage products={products} onNavigate={handleNavigate} isLoading={isLoading} error={error} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
            <Header profile={profile} cartItemCount={0} onNavigate={handleNavigate} onLoginClick={() => setIsAuthModalOpen(true)} onLogout={handleLogout} />
            <main className="flex-grow">{renderPage()}</main>
            <Footer />
            <AuthModal isOpen={isAuthModalOpen} mode={authMode} onClose={() => setIsAuthModalOpen(false)} onSwitchMode={setAuthMode} onLogin={handleLogin} onRegister={handleRegister} />
        </div>
    );
}
