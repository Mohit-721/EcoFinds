
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

interface AuthContextType {
    currentUser: User | null;
    login: (email: string, pass: string) => Promise<User | null>;
    logout: () => void;
    register: (username: string, email: string, pass: string) => Promise<User | null>;
    updateUser: (updatedInfo: Partial<User>) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('currentUser');
        }
    }, []);

    const login = useCallback(async (email: string, pass: string): Promise<User | null> => {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === pass);
        if (user) {
            const { password, ...userToStore } = user;
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            setCurrentUser(userToStore);
            return userToStore;
        }
        return null;
    }, []);

    const register = useCallback(async (username: string, email: string, pass: string): Promise<User | null> => {
        let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            return null; // Email already exists
        }
        const newUser: User = { id: Date.now().toString(), username, email, password: pass };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        const { password, ...userToStore } = newUser;
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
        setCurrentUser(userToStore);
        return userToStore;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
    }, []);
    
    const updateUser = useCallback(async (updatedInfo: Partial<User>): Promise<User | null> => {
        if (!currentUser) return null;
        let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        let updatedUser: User | null = null;
        const newUsers = users.map(u => {
            if (u.id === currentUser.id) {
                updatedUser = { ...u, ...updatedInfo };
                return updatedUser;
            }
            return u;
        });

        if (updatedUser) {
             localStorage.setItem('users', JSON.stringify(newUsers));
             const { password, ...userToStore } = updatedUser;
             localStorage.setItem('currentUser', JSON.stringify(userToStore));
             setCurrentUser(userToStore);
             return userToStore;
        }
        return null;
    }, [currentUser]);

    const value = { currentUser, login, logout, register, updateUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
