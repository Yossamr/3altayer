
import { createClient } from "@libsql/client";
import { User, Role, Order, OrderType, OrderStatus } from "../types";

// URL & Token for Remote DB
const url = "libsql://3altayer-yossamr.aws-us-east-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjkyNjU2NDUsImlkIjoiYTRmNTBkZDQtZDNjNS00ZDcxLTg2MmItMWIyMjgzMGNhOWUxIiwicmlkIjoiMWNjMDI1MjktOTVkYy00NDI2LWI4ZGUtNzliOTgyOGU2YmY2In0.mi6ZfhIZdOed6e6K-kOgvhOZiL_PTHHixER9jA4GhgrKTPzYhWQgAtWzHyWNU6YaybYAqYLwkBFFWs2nUEjzDg";

export const db = createClient({
  url: url.replace("libsql://", "https://"),
  authToken,
});

// --- MAPPERS (Convert DB Snake_Case to App CamelCase) ---
const mapRowToUser = (row: any): User => ({
  id: String(row.id),
  name: String(row.name),
  phone: String(row.phone),
  password: String(row.password),
  role: row.role as Role,
  walletBalance: Number(row.wallet_balance || 0),
  cashCollected: Number(row.cash_collected || 0),
  cashLimit: Number(row.cash_limit || 2000),
  score: Number(row.score || 5.0),
  isOnline: Boolean(row.is_online),
  savedAddresses: row.address_details ? [{
      id: 'default-addr',
      title: 'العنوان الأساسي',
      details: row.address_details,
      zoneId: row.zone_id || 'z1'
  }] : [] 
});

const mapRowToOrder = (row: any): Order => {
  return {
    id: String(row.id),
    type: row.type as OrderType,
    status: row.status as OrderStatus,
    customerId: String(row.customer_id),
    driverId: row.driver_id ? String(row.driver_id) : undefined,
    storeId: row.store_id ? String(row.store_id) : undefined,
    pickupAddress: row.pickup_address,
    deliveryAddress: typeof row.delivery_address_json === 'string' ? JSON.parse(row.delivery_address_json) : row.delivery_address_json,
    items: row.items,
    price: Number(row.price),
    recipientPhone: row.recipient_phone || undefined,
    timeline: typeof row.timeline_json === 'string' ? JSON.parse(row.timeline_json) : (row.timeline_json || []),
    issues: typeof row.issues_json === 'string' ? JSON.parse(row.issues_json) : (row.issues_json || []),
    createdAt: Number(row.created_at),
    isLiveTrackingAllowed: Boolean(row.is_tracking),
    deliveryCode: row.delivery_code,
    notes: row.notes,
    rating: row.rating ? Number(row.rating) : undefined,
    ratingComment: row.rating_comment
  };
};

// --- INITIALIZATION ---
export const initializeDatabase = async () => {
  console.log("🚀 Initializing Remote Database...");
  
  // Create Tables if not exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      wallet_balance REAL DEFAULT 0,
      cash_collected REAL DEFAULT 0,
      cash_limit REAL DEFAULT 2000,
      score REAL DEFAULT 5.0,
      is_online BOOLEAN DEFAULT 0
    )
  `);

  // Migrations
  try { await db.execute("ALTER TABLE users ADD COLUMN address_details TEXT"); } catch (e) {}
  try { await db.execute("ALTER TABLE users ADD COLUMN zone_id TEXT"); } catch (e) {}

  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      driver_id TEXT,
      store_id TEXT,
      pickup_address TEXT,
      delivery_address_json TEXT,
      items TEXT,
      price REAL,
      recipient_phone TEXT,
      timeline_json TEXT,
      issues_json TEXT,
      created_at INTEGER,
      is_tracking BOOLEAN DEFAULT 0,
      delivery_code TEXT,
      notes TEXT,
      rating INTEGER,
      rating_comment TEXT
    )
  `);

  // Seed Remote Admin
  const checkAdmin = await db.execute({ sql: "SELECT id FROM users WHERE phone = ?", args: ["00000000000"] });
  if (checkAdmin.rows.length === 0) {
    await db.execute({
        sql: "INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)",
        args: ["Admin HQ", "00000000000", "5276", "ADMIN"]
    });
  }
};

// --- CRUD OPERATIONS (REMOTE ONLY) ---

export const getAllUsersFromDB = async (): Promise<User[]> => {
    const rs = await db.execute("SELECT * FROM users");
    return rs.rows.map(mapRowToUser);
};

export const loginUserFromDB = async (phone: string, password: string): Promise<User | null> => {
    const cleanPhone = phone.trim();
    const rs = await db.execute({
        sql: "SELECT * FROM users WHERE phone = ?",
        args: [cleanPhone]
    });
    if (rs.rows.length === 0) return null;
    const user = mapRowToUser(rs.rows[0]);
    return user.password === password ? user : null;
};

export const registerUserInDB = async (name: string, phone: string, password: string, address: string, zoneId: string): Promise<{ success: boolean; message?: string }> => {
    const cleanPhone = phone.trim();
    
    // Check existence first
    const check = await db.execute({ sql: "SELECT id FROM users WHERE phone = ?", args: [cleanPhone] });
    if (check.rows.length > 0) return { success: false, message: "هذا الرقم مسجل بالفعل" };

    await db.execute({
        sql: "INSERT INTO users (name, phone, password, role, address_details, zone_id) VALUES (?, ?, ?, ?, ?, ?)",
        args: [name, cleanPhone, password, 'CUSTOMER', address, zoneId] 
    });
    return { success: true };
};

export const createUserWithRoleInDB = async (name: string, phone: string, password: string, role: Role): Promise<boolean> => {
    const cleanPhone = phone.trim();
    try {
        await db.execute({
            sql: "INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)",
            args: [name, cleanPhone, password, role] 
        });
        return true;
    } catch (e) {
        console.error("Create User Error", e);
        return false;
    }
};

export const createOrderInDB = async (order: Order): Promise<boolean> => {
    await db.execute({
        sql: `INSERT INTO orders (
            id, type, status, customer_id, pickup_address, delivery_address_json, 
            items, price, recipient_phone, timeline_json, issues_json, created_at, 
            delivery_code, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            order.id, order.type, order.status, order.customerId, order.pickupAddress,
            JSON.stringify(order.deliveryAddress), order.items, order.price, order.recipientPhone || null,
            JSON.stringify(order.timeline), JSON.stringify(order.issues), order.createdAt,
            order.deliveryCode || null, order.notes || null
        ]
    });
    return true;
};

export const getAllOrdersFromDB = async (): Promise<Order[]> => {
    const rs = await db.execute("SELECT * FROM orders ORDER BY created_at DESC");
    return rs.rows.map(mapRowToOrder);
};

export const updateOrderStatusInDB = async (orderId: string, status: string, timeline: any[], driverId?: string, rating?: number, comment?: string): Promise<boolean> => {
    let sql = "UPDATE orders SET status = ?, timeline_json = ?";
    const args: any[] = [status, JSON.stringify(timeline)];
    if (driverId) { sql += ", driver_id = ?"; args.push(driverId); }
    if (rating !== undefined) { sql += ", rating = ?, rating_comment = ?"; args.push(rating, comment || null); }
    sql += " WHERE id = ?";
    args.push(orderId);
    await db.execute({ sql, args });
    return true;
};

export const updateDriverCashInDB = async (driverId: string, amount: number) => {
    await db.execute({
        sql: "UPDATE users SET cash_collected = cash_collected + ? WHERE id = ?",
        args: [amount, driverId]
    });
};
