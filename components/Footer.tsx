
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-primary text-white mt-auto">
            <div className="container mx-auto px-4 py-6 text-center">
                <p>&copy; {new Date().getFullYear()} EcoFinds. All rights reserved.</p>
                <p className="text-sm text-secondary">Promoting a sustainable future, one pre-loved item at a time.</p>
            </div>
        </footer>
    );
};

export default Footer;
