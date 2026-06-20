export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface Owner {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  plan: 'free' | 'basic' | 'premium';
  planExpiresAt?: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  logo: string;
  location: string;
  phone: string;
  paymentInfo?: string;
  themeColor?: string;
  suspended: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  createdAt: string;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Order {
  id: string;
  restaurantId: string;
  restaurantSlug: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'cash' | 'online';
  items: CartItem[];
  total: number;
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  reviewSubmitted?: boolean;
}

export interface Review {
  id: string;
  restaurantId: string;
  orderId: string;
  reviewerName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  supportPhone: string;
  supportEmail: string;
  logo: string;
  maintenanceMode: boolean;
}
