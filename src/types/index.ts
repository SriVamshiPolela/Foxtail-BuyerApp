export type ShipLevel = 'mandal' | 'district' | 'state' | 'national';
export type TrustType = 'verified' | 'local' | 'organic' | 'handmade';
export type OrderStatus = 'delivered' | 'in-transit' | 'processing';

export type Product = {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  location: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  badges: TrustType[];
  shippability: ShipLevel;
  category: string;
  description: string;
  inStock: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  qty: number;
};

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  vendor: string;
  expectedDelivery?: string;
};

export type Vendor = {
  id: string;
  name: string;
  type: string;
  distance: string;
  rating: number;
  image: string;
  description: string;
  productCount: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
};

export type Region = {
  id: ShipLevel;
  label: string;
  icon: string;
  count: number;
};

export type PlacedOrderItem = {
  productId: string;
  name: string;
  image: string;
  qty: number;
  price: number;
};

export type PlacedOrder = {
  id: string;
  date: string;
  status: OrderStatus;
  items: PlacedOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  vendor: string;
  paymentMethod: string;
  deliverySlot: string;
  address: string;
  expectedDelivery?: string;
};
