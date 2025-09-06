
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddProductPage from './pages/AddProductPage';
import MyListingsPage from './pages/MyListingsPage';
import EditProductPage from './pages/EditProductPage';
import CartPage from './pages/CartPage';
import PurchasesPage from './pages/PurchasesPage';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <HashRouter>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  
                  <Route path="/add-product" element={<ProtectedRoute><AddProductPage /></ProtectedRoute>} />
                  <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
                  <Route path="/edit-product/:id" element={<ProtectedRoute><EditProductPage /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/purchases" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                </Routes>
              </main>
              <Footer />
            </div>
          </HashRouter>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;
