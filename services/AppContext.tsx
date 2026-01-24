
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Order, Zone, Role, OrderType, OrderStatus, TimelineEvent, Address, Issue } from '../types';
import { INITIAL_ZONES } from '../constants';
import { 
  initializeDatabase, 
  loginUserFromDB, 
  registerUserInDB, 
  createUserWithRoleInDB,
  getAllUsersFromDB,
  createOrderInDB,
  getAllOrdersFromDB,
  updateOrderStatusInDB,
  updateDriverCashInDB,
  db
} from './db';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  orders: Order[];
  zones: Zone[];
  isNetworkAvailable: boolean; // Renamed to accurately reflect state
  login: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, phone: string, password: string, address: string, zoneId: string) => Promise<{ success: boolean; message?: string }>;
  adminCreateUser: (name: string, phone: string, password: string, role: Role) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  createOrder: (order: Partial<Order>) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, proof?: { imageUrl?: string; isQrScan?: boolean }) => void;
  acceptOrder: (orderId: string, driverId: string, allowTracking: boolean) => void;
  addAddress: (userId: string, address: Address) => void;
  deleteAddress: (userId: string, addressId: string) => void;
  reportIssue: (orderId: string, reason: string) => void;
  updateZonePrice: (zoneId: string, newPrice: number) => void;
  addDriver: (name: string, phone: string, password: string) => void;
  verifyDeliveryCode: (code: string) => { success: boolean; orderId?: string };
  rateDriver: (orderId: string, rating: number, comment?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); 
  const [orders, setOrders] = useState<Order[]>([]); 
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(navigator.onLine);

  // Network Monitoring
  useEffect(() => {
    const handleOnline = () => { setIsNetworkAvailable(true); refreshData(); };
    const handleOffline = () => setIsNetworkAvailable(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    const checkConnection = async () => {
        try {
            await db.execute("SELECT 1"); // Ping DB
            setIsNetworkAvailable(true);
        } catch {
            setIsNetworkAvailable(false);
        }
    };
    checkConnection();

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Init DB and Fetch Data on Mount
  useEffect(() => {
    if (isNetworkAvailable) {
        initializeDatabase().then(refreshData).catch(() => setIsNetworkAvailable(false));
    }
  }, [isNetworkAvailable]);

  const refreshData = async () => {
      try {
        const dbUsers = await getAllUsersFromDB();
        setUsers(dbUsers);
        const dbOrders = await getAllOrdersFromDB();
        setOrders(dbOrders);
      } catch (e) {
        console.error("Failed to refresh data (Offline?)", e);
        setIsNetworkAvailable(false);
      }
  };

  const validatePhone = (phone: string) => {
    return phone.trim().length === 11;
  };

  const login = async (phone: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!isNetworkAvailable) return { success: false, message: "لا يوجد اتصال بالإنترنت" };

    const cleanPhone = phone.trim();
    if (!validatePhone(cleanPhone)) return { success: false, message: "الرقم لازم يبقا 11 رقم" };

    try {
      const user = await loginUserFromDB(cleanPhone, password);
      if (user) {
        setCurrentUser(user);
        refreshData(); 
        return { success: true };
      } else {
        return { success: false, message: "الرقم مش متسجل أو كلمة المرور خطأ" };
      }
    } catch (error) {
       console.error(error);
       return { success: false, message: "حدث خطأ أثناء الاتصال بالخادم" };
    }
  };

  const register = async (name: string, phone: string, password: string, address: string, zoneId: string): Promise<{ success: boolean; message?: string }> => {
      if (!isNetworkAvailable) return { success: false, message: "لا يوجد اتصال بالإنترنت" };

      const cleanPhone = phone.trim();
      if (!validatePhone(cleanPhone)) return { success: false, message: "الرقم لازم يبقا 11 رقم" };
      if (password.length < 4) return { success: false, message: "كلمة المرور قصيرة جداً" };
      
      try {
          const result = await registerUserInDB(name, cleanPhone, password, address, zoneId);
          if (result.success) {
              await refreshData();
              const user = await loginUserFromDB(cleanPhone, password);
              if (user) setCurrentUser(user);
              return { success: true };
          } else {
              return { success: false, message: result.message || "حدث خطأ" };
          }
      } catch (e) {
          return { success: false, message: "فشل الاتصال بالخادم" };
      }
  };

  const adminCreateUser = async (name: string, phone: string, password: string, role: Role): Promise<{ success: boolean; message?: string }> => {
      if (!isNetworkAvailable) return { success: false, message: "لا يوجد اتصال بالإنترنت" };
      
      const cleanPhone = phone.trim();
      const success = await createUserWithRoleInDB(name, cleanPhone, password, role);
      if (success) {
          await refreshData();
          return { success: true };
      } else {
          return { success: false, message: "فشل إنشاء المستخدم" };
      }
  };

  const logout = () => setCurrentUser(null);

  const addAddress = (userId: string, address: Address) => {
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? ({ ...prev, savedAddresses: [...(prev.savedAddresses || []), address] }) : null);
    }
  };

  const deleteAddress = (userId: string, addressId: string) => {
    if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? ({ ...prev, savedAddresses: (prev.savedAddresses || []).filter(a => a.id !== addressId) }) : null);
    }
  }

  const reportIssue = (orderId: string, reason: string) => {
    // Ideally update in DB too
    setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
            const newIssue: Issue = {
                id: `iss-${Date.now()}`,
                orderId,
                reporterId: currentUser?.id || 'unknown',
                reason,
                timestamp: Date.now(),
                resolved: false
            };
            return { ...o, issues: [...o.issues, newIssue] };
        }
        return o;
    }));
  };

  const updateZonePrice = (zoneId: string, newPrice: number) => {
      setZones(prev => prev.map(z => z.id === zoneId ? { ...z, price: newPrice } : z));
  };

  const addDriver = (name: string, phone: string, password: string) => {
      alert("Deprecated");
  };

  const createOrder = async (orderData: Partial<Order>) => {
    if (!isNetworkAvailable) { alert("لا يوجد اتصال بالإنترنت!"); return; }

    const deliveryCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newId = `ORD-${Date.now().toString().slice(-6)}`;

    const newOrder: Order = {
      id: newId,
      type: orderData.type || OrderType.RESTAURANT,
      status: OrderStatus.PENDING,
      customerId: currentUser?.id || 'guest',
      pickupAddress: orderData.pickupAddress || '',
      deliveryAddress: orderData.deliveryAddress!,
      items: orderData.items || '',
      price: orderData.price || 0,
      itemCost: orderData.itemCost || 0,
      timeline: [{ status: OrderStatus.PENDING, timestamp: Date.now() }],
      issues: [],
      createdAt: Date.now(),
      isLiveTrackingAllowed: false,
      notes: orderData.notes,
      recipientPhone: orderData.recipientPhone,
      deliveryCode, 
      ...orderData
    };

    try {
        const success = await createOrderInDB(newOrder);
        if (success) {
            setOrders(prev => [newOrder, ...prev]);
        } else {
            alert("فشل في إنشاء الطلب.");
        }
    } catch {
        alert("خطأ في الاتصال بالخادم");
    }
  };

  const acceptOrder = async (orderId: string, driverId: string, allowTracking: boolean) => {
    if (!isNetworkAvailable) { alert("لا يوجد اتصال بالإنترنت!"); return; }

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newTimeline = [...order.timeline, { status: OrderStatus.ACCEPTED, timestamp: Date.now(), driverId }];
    
    try {
        const success = await updateOrderStatusInDB(orderId, OrderStatus.ACCEPTED, newTimeline, driverId);
        if (success) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.ACCEPTED, driverId, timeline: newTimeline } : o));
        }
    } catch { alert("خطأ في الاتصال"); }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, proof?: { imageUrl?: string; isQrScan?: boolean }) => {
    if (!isNetworkAvailable) { alert("لا يوجد اتصال بالإنترنت!"); return; }

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newEvent: TimelineEvent = {
        status: newStatus,
        timestamp: Date.now(),
        imageUrl: proof?.imageUrl,
        driverId: currentUser?.id
    };
    const newTimeline = [...order.timeline, newEvent];

    try {
        const success = await updateOrderStatusInDB(orderId, newStatus, newTimeline);
        if (success) {
            if (newStatus === OrderStatus.DELIVERED && order.driverId) {
                if(currentUser?.id === order.driverId) {
                    await updateDriverCashInDB(order.driverId, order.price + (order.itemCost || 0));
                    setCurrentUser(cur => cur ? ({ ...cur, cashCollected: (cur.cashCollected || 0) + order.price + (order.itemCost || 0) }) : null);
                }
            }
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, timeline: newTimeline } : o));
        }
    } catch { alert("خطأ في الاتصال"); }
  };

  const verifyDeliveryCode = (code: string) => {
      const order = orders.find(o => o.deliveryCode === code && o.status !== OrderStatus.DELIVERED);
      if (order) {
          return { success: true, orderId: order.id };
      }
      return { success: false };
  };

  const rateDriver = async (orderId: string, rating: number, comment?: string) => {
      if (!isNetworkAvailable) { alert("لا يوجد اتصال بالإنترنت!"); return; }
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      try {
          const success = await updateOrderStatusInDB(orderId, order.status, order.timeline, order.driverId, rating, comment);
          if (success) {
              setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rating, ratingComment: comment } : o));
              refreshData();
          }
      } catch { alert("خطأ في الاتصال"); }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      orders,
      zones,
      isNetworkAvailable,
      login,
      register,
      adminCreateUser,
      logout,
      createOrder,
      updateOrderStatus,
      acceptOrder,
      addAddress,
      deleteAddress,
      reportIssue,
      updateZonePrice,
      addDriver,
      verifyDeliveryCode,
      rateDriver
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
