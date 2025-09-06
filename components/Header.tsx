
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const CartIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const Header: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { cartItems } = useCart();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    
    const activeLinkStyle = {
        color: '#E6A457',
        textDecoration: 'underline',
    };

    const navLinkClass = "hover:text-accent transition-colors duration-200";

    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    const renderNavLinks = (isMobile: boolean) => (
         <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row items-center space-x-6'}`}>
            <NavLink to="/" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Home</NavLink>
            {currentUser && (
                <>
                    <NavLink to="/my-listings" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>My Listings</NavLink>
                    <NavLink to="/purchases" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>My Purchases</NavLink>
                    <NavLink to="/dashboard" className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                        <div className="flex items-center gap-2">
                           <UserIcon /> {currentUser.username}
                        </div>
                    </NavLink>
                    <NavLink to="/cart" className={`${navLinkClass} relative`} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                        <CartIcon />
                        {totalCartItems > 0 && <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalCartItems}</span>}
                    </NavLink>
                    <button onClick={logout} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors">Logout</button>
                </>
            )}
            {!currentUser && (
                <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row items-center space-x-4'}`}>
                     <Link to="/login" className="bg-transparent text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">Login</Link>
                     <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors">Sign Up</Link>
                </div>
            )}
         </div>
    );

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary">
                    <LeafIcon />
                    <span>EcoFinds</span>
                </Link>
                <nav className="hidden md:flex items-center space-x-6 font-medium">
                    {renderNavLinks(false)}
                </nav>
                 <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-primary">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>
            </div>
             {isMenuOpen && (
                <div className="md:hidden px-4 pt-2 pb-4 border-t border-gray-200">
                    <nav className="flex flex-col items-start space-y-4 font-medium">
                        {renderNavLinks(true)}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
