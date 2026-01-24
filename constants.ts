
import { OrderType, OrderStatus, Role, User, Zone, Order } from './types';

export const APP_NAME = "Al-Tayyar";
export const CURRENCY = "EGP";

export const SUPPORT_PHONES = [
    "01015259314",
    "01060901989",
    "01001817673"
];

export const HQ_ADDRESS = "مشتل كرم عاشور أمام صيدلية الحداد";

export const INITIAL_ZONES: Zone[] = [
  { id: 'z1', name: 'المنطقة الأولى (وسط البلد)', price: 20 },
  { id: 'z2', name: 'المنطقة الثانية (أطراف المدينة)', price: 30 },
  { id: 'z3', name: 'المنطقة الثالثة (قرى مجاورة)', price: 45 },
  { id: 'z4', name: 'المنطقة الرابعة (مراكز بعيدة)', price: 60 },
];

// Workflow: Defines the Next Status, Label, and if Photo is required
export const WORKFLOW_CONFIG = {
  [OrderType.RESTAURANT]: {
    [OrderStatus.ACCEPTED]: { next: OrderStatus.PICKED_UP, requireProof: true, label: "تم الاستلام" },
    [OrderStatus.PICKED_UP]: { next: OrderStatus.ON_THE_WAY, requireProof: false, label: "بدء التوصيل" },
    [OrderStatus.ON_THE_WAY]: { next: OrderStatus.DELIVERED, requireProof: true, label: "تم التوصيل" },
  },
  [OrderType.SEND_PACKAGE]: {
    [OrderStatus.ACCEPTED]: { next: OrderStatus.PICKED_UP, requireProof: true, label: "استلام الطرد من المرسل" },
    [OrderStatus.PICKED_UP]: { next: OrderStatus.ON_THE_WAY, requireProof: false, label: "بدء التحرك" },
    [OrderStatus.ON_THE_WAY]: { next: OrderStatus.DELIVERED, requireProof: true, label: "تسليم الطرد للمستلم" },
  },
  [OrderType.RECEIVE_PACKAGE]: {
    [OrderStatus.ACCEPTED]: { next: OrderStatus.PICKED_UP, requireProof: true, label: "استلام الطرد من المصدر" },
    [OrderStatus.PICKED_UP]: { next: OrderStatus.ON_THE_WAY, requireProof: false, label: "بدء التوصيل إليك" },
    [OrderStatus.ON_THE_WAY]: { next: OrderStatus.DELIVERED, requireProof: true, label: "تسليم الطرد إليك" },
  },
};

// CLEARED FOR PRODUCTION - USERS LOADED FROM DB
export const MOCK_USERS: User[] = [];

// CLEARED FOR PRODUCTION - ORDERS LOADED FROM DB
export const INITIAL_ORDERS: Order[] = [];
