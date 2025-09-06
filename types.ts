
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Not stored in currentUser object for security
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sellerId: string;
  sellerUsername: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type Purchase = {
    id: string;
    date: string;
    items: Product[];
    total: number;
}
