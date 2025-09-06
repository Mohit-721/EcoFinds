
import type { Product } from './types';

export const CATEGORIES = [
  'All',
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Home Goods',
  'Other'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Vintage Leather Sofa',
    description: 'A beautiful and comfortable vintage leather sofa, perfect for any living room. Minor wear consistent with age.',
    price: 450,
    category: 'Furniture',
    imageUrl: 'https://picsum.photos/seed/sofa/600/400',
    sellerId: 'system',
    sellerUsername: 'EcoFindsDemo'
  },
  {
    id: '2',
    title: 'Retro Polaroid Camera',
    description: 'Classic Polaroid 600 instant camera. Tested and working. A great item for photography enthusiasts.',
    price: 75,
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/seed/camera/600/400',
    sellerId: 'system',
    sellerUsername: 'EcoFindsDemo'
  },
  {
    id: '3',
    title: 'Classic Denim Jacket',
    description: 'A timeless denim jacket in great condition. Size Medium. No stains or tears.',
    price: 40,
    category: 'Clothing',
    imageUrl: 'https://picsum.photos/seed/jacket/600/400',
    sellerId: 'system',
    sellerUsername: 'EcoFindsDemo'
  },
  {
    id: '4',
    title: 'Hardcover Novel Set',
    description: 'A collection of 5 popular hardcover novels. All in excellent, like-new condition.',
    price: 25,
    category: 'Books',
    imageUrl: 'https://picsum.photos/seed/books/600/400',
    sellerId: 'system',
    sellerUsername: 'EcoFindsDemo'
  },
  {
    id: '5',
    title: 'Antique Wooden Chair',
    description: 'Hand-carved wooden chair with intricate details. A stunning accent piece. Structurally sound.',
    price: 120,
    category: 'Furniture',
    imageUrl: 'https://picsum.photos/seed/chair/600/400',
    sellerId: 'system',
    sellerUsername: 'EcoFindsDemo'
  },
  {
    id: '6',
    title: 'Modern Coffee Maker',
    description: 'Barely used drip coffee maker with a thermal carafe. Makes great coffee. Clean and descaled.',
    price: 35,
    category: 'Home Goods',
    imageUrl: 'https://picsum.photos/seed/coffee/600/400',
    sellerId: 'system',
    sellerUsername: 'EcoFindsDemo'
  },
];
