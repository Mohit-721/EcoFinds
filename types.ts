
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          price: number
          image_urls: string[] | null
          category: Category
          seller_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          price: number
          image_urls?: string[] | null
          category: Category
          seller_id: string
        }
        Update: {
          name?: string
          description?: string
          price?: number
          image_urls?: string[] | null
          category?: Category
        }
      }
      profiles: {
        Row: {
          id: string // user_id from auth.users
          updated_at: string | null
          username: string
          avatar_url: string | null
          bio: string | null
          gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | null
          address: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username: string
          avatar_url?: string | null
          bio?: string | null
          gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | null
          address?: string | null
        }
        Update: {
          updated_at?: string | null
          username?: string
          avatar_url?: string | null
          bio?: string | null
          gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | null
          address?: string | null
        }
      }
      cart_items: {
          Row: {
              id: number
              user_id: string
              product_id: string
              quantity: number
              created_at: string
          }
          Insert: {
              id?: number
              user_id: string
              product_id: string
              quantity?: number
              created_at?: string
          }
          Update: {
              quantity?: number
          }
      }
      purchases: {
          Row: {
              id: number
              user_id: string
              product_id: string
              purchased_at: string
              price: number
              quantity: number
          }
          Insert: {
              id?: number
              user_id: string
              product_id: string
              purchased_at?: string
              price: number
              quantity: number
          }
          Update: {}
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export enum Category {
  ELECTRONICS = 'Electronics',
  FURNITURE = 'Furniture',
  CLOTHING = 'Clothing',
  BOOKS = 'Books',
  HOME_GOODS = 'Home Goods',
  OTHER = 'Other',
}

// Client-side hydrated types
export type Product = Database['public']['Tables']['products']['Row'] & {
  profiles: Profile | null // Joined profile data
};
export type Profile = Database['public']['Tables']['profiles']['Row'];

export type CartItem = Omit<Database['public']['Tables']['cart_items']['Row'], 'product_id'> & {
    products: Product | null // Joined product data
};

export type Purchase = Omit<Database['public']['Tables']['purchases']['Row'], 'product_id'> & {
    products: Product | null // Joined product data
};

export type Page = 
  | 'home' 
  | 'productDetail' 
  | 'myListings' 
  | 'addProduct' 
  | 'editProduct' 
  | 'cart' 
  | 'purchases' 
  | 'dashboard';

export interface PageState {
  page: Page;
  props?: Record<string, any>;
}
