import React, { useState, useRef } from 'react';

const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const CATEGORIES = [
    'Electronics',
    'Furniture',
    'Clothing',
    'Books',
    'Home Goods',
    'Other',
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Product Title is required.';
    if (!price || Number(price) <= 0) newErrors.price = 'Price must be greater than 0.';
    if (images.length === 0) newErrors.images = 'At least one image is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate async
    setTimeout(() => {
      const formData = {
        title,
        category,
        description,
        price,
        images,
      };
      console.log('Submitted:', formData);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <h2 className="text-3xl font-bold text-center text-primary mb-2">Add New Product</h2>
        {/* Images Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-4 mb-3">
            {images.length > 0 ? (
              images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-lg border shadow"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-gray-100 border rounded-lg text-gray-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7M16 3H8a4 4 0 00-4 4v0a4 4 0 004 4h8a4 4 0 004-4v0a4 4 0 00-4-4z" /></svg>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Upload Images
          </button>
          {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
        </div>
        {/* Product Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Vintage Lamp"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your product..."
          />
        </div>
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) <span className="text-red-500">*</span></label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
