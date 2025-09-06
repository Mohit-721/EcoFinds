
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SignUpPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }
        setError('');
        setLoading(true);
        try {
            const user = await register(username, email, password);
            if (user) {
                navigate('/');
            } else {
                setError('An account with this email already exists.');
            }
        } catch (err) {
            setError('Failed to create an account. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">Join EcoFinds</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-accent">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;
