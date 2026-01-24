
export enum Role {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN'
}

export enum OrderType {
  RESTAURANT = 'RESTAURANT',     // Restaurant/Store order
  SEND_PACKAGE = 'SEND_PACKAGE', // User sending something to someone
  RECEIVE_PACKAGE = 'RECEIVE_PACKAGE' // User receiving something from elsewhere
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  // Purchase specific (legacy support or mapped to Receive)
  RECEIPT_PAID = 'RECEIPT_PAID',
  WAITING_PREP = 'WAITING_PREP',
  // General
  PICKED_UP = 'PICKED_UP',
  ON_THE_WAY = 'ON_THE_WAY',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED'
}

export interface Zone {
  id: string;
  name: string;
  price: number;
}

export interface Address {
  id: string;
  title: string;
  details: string;
  zoneId: string;
}

export interface TimelineEvent {
  status: OrderStatus;
  timestamp: number;
  imageUrl?: string;
  driverId?: string;
}

export interface Issue {
  id: string;
  orderId: string;
  reporterId: string;
  reason: string;
  timestamp: number;
  resolved: boolean;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  customerId: string;
  recipientPhone?: string; 
  driverId?: string;
  storeId?: string;
  pickupAddress: string;
  deliveryAddress: Address;
  items: string;
  price: number;
  itemCost?: number;
  timeline: TimelineEvent[]; 
  issues: Issue[];
  createdAt: number;
  isLiveTrackingAllowed: boolean;
  notes?: string;
  deliveryCode?: string; // The secret code for QR
  rating?: number; // Driver rating for this order
  ratingComment?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;     
  password: string;  
  role: Role;
  walletBalance: number;
  cashCollected?: number; // For drivers
  cashLimit?: number;     // For drivers
  score?: number; 
  isOnline?: boolean;
  savedAddresses?: Address[]; // For customers
}
