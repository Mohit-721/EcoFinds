
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
    const { currentUser, updateUser } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username);
            setEmail(currentUser.email);
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        const updated = await updateUser({ username, email });
        if (updated) {
            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } else {
            setMessage('Failed to update profile.');
        }
         setTimeout(() => setMessage(''), 3000);
    };

    if (!currentUser) {
        return <p>Loading...</p>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-6">User Dashboard</h1>
            {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-center">{message}</p>}
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center gap-6 mb-8">
                     <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-primary text-4xl font-bold">
                        {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{currentUser.username}</h2>
                        <p className="text-gray-500">{currentUser.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100" />
                    </div>

                    {isEditing ? (
                         <div className="flex gap-4">
                            <button type="submit" className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90">Save Changes</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                        </div>
                    ) : (
                         <button type="button" onClick={() => setIsEditing(true)} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-opacity-90">
                            Edit Profile
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default DashboardPage;
