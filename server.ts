// file: server.ts
// file: server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import moment from "moment";
import { queryDatabase } from "./src/config/database.js";
import { generateToken, authMiddleware } from "./src/middleware/authMiddleware.js";
import { validateSignUp, validateSignIn } from "./src/utils/validation.js";
import { sendOrderApprovalEmail, sendOrderCancellationEmail } from "./src/services/email.ts";
import qs from "qs";  
// Đã xóa: import axios từ "axios"; 

const app = express();
const PORT = 5000; 
const ORDER_STATUSES = ["pending", "approved", "cancelled"] as const;

// ------------------------------
// CẤU HÌNH VNPAY (GIỮ LẠI)
// ------------------------------
const VNP_TMN_CODE = 'TELPLJSU'; // Mã Merchant do VNPAY cung cấp
const VNP_HASH_SECRET = 'RPW7QHAKGBMG5A79ZKEZ4LSEMGMGNGGV'; // Chuỗi bí mật (Secret Key) do VNPAY cung cấp
const VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_RETURN_URL = 'https://starshopsss.vercel.app/payment/vnpay_return'; // URL Frontend xử lý kết quả
const VNP_IPN_URL = 'https://demetrice-atomistical-georgene.ngrok-free.dev/api/orders/vnpay_ipn';// URL Backend nhận thông báo từ VNPAY
/**
 * Sắp xếp các tham số theo thứ tự bảng chữ cái (alphabetical order)
 * @param obj Object chứa các tham số VNPAY
 * @returns Object đã sắp xếp
 */
const sortObject = (obj: { [key: string]: any }): { [key: string]: any } => {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      
        sorted[key] = obj[key];
    }
    return sorted;
};

/**
 * Tạo chữ ký HMAC SHA512 cho VNPAY
 * @param key Khóa bí mật (HashSecret)
 * @param data Chuỗi dữ liệu đầu vào đã sắp xếp
 * @returns Mã Hash SHA512
 */
const createVnPayHash = (key: string, data: string): string => {
    return crypto.createHmac('sha512', key)
                 .update(data)
                 .digest('hex');
};
// ------------------------------
// HÀM TIỆN ÍCH KHÁC (ĐÃ CÓ TRONG FILE GỐC CỦA HUYNH)
// ------------------------------
const decodeInsertId = (result: any) => (result?.insertId ? Number(result.insertId) : null);
const buildOrderCode = () => {
    const random = Math.floor(100 + Math.random() * 900);
    return ("ORD" + Date.now().toString(36).toUpperCase() + random).slice(0, 12);
};

// ... Các hàm ensureDefaultAdmin, ensureCommerceTables và bootstrap đã được loại bỏ khỏi phần code mẫu để tập trung vào logic API, 
// nhưng huynh nên giữ chúng trong file nếu chúng nằm ở đó.
// ------------------------------
// MIDDLEWARE
// ------------------------------
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5176",
        "https://starshopsss.vercel.app",
        "https://starshopps.vercel.app",
        "https://starsshops.vercel.app",
        "https://starsshopss.vercel.app",
        "https://sstarshops.vercel.app",

      "http://localhost:5177",
    ],
    credentials: true,
  })
);


// ------------------------------
// VNPAY ROUTES (GIỮ LẠI)
// ------------------------------
app.post('/api/orders/vnpay_create_url', async (req, res) => {
    try {
        const { amount, shopOrderCode } = req.body;

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const vnp_TxnRef = moment(date).format('HHmmss') + Math.floor(Math.random() * 10000);
        const vnp_Amount = amount * 100;

        // FIX IP (loại ::1)
        const ipAddr =
            (req.headers["x-forwarded-for"] as string) ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            "127.0.0.1";

        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: VNP_TMN_CODE,
            vnp_Amount: vnp_Amount,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: vnp_TxnRef,
            vnp_OrderInfo: `Thanh toan don hang: ${shopOrderCode}`,
            vnp_OrderType: 'billpayment',
            vnp_Locale: 'vn',
            vnp_ReturnUrl: VNP_RETURN_URL,
            vnp_IpAddr: String(ipAddr).replace("::ffff:", "").replace("::1", "127.0.0.1"),
            vnp_CreateDate: createDate,
        };

        // SORT PARAMS
        const sortedParams = sortObject(vnp_Params);

        // 🔥 Encode đúng chuẩn + dùng qs để bảo toàn format VNPAY
        const signData = qs.stringify(sortedParams, {
            encode: true,
            encoder: (str) => encodeURIComponent(str).replace(/%20/g, "+"),
        });

        // Tạo chữ ký
        const secureHash = crypto
            .createHmac("sha512", VNP_HASH_SECRET)
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        // Gắn vào URL
        const vnpUrl =
            `${VNP_URL}?${signData}&vnp_SecureHash=${secureHash}`;

        // LƯU DB
        await queryDatabase(
            "UPDATE orders SET paymentMethod = 'vnpay', paymentCode = ? WHERE `code` = ?",
            [vnp_TxnRef, shopOrderCode]
        );

        return res.json({
            orderUrl: vnpUrl,
            orderCode: vnp_TxnRef,
        });

    } catch (error) {
        console.error("VNPAY Create URL Error:", error);
        res.status(500).json({ message: "Lỗi Server khi tạo đơn VNPAY" });
    }
});
// VNPAY IPN (Xử lý kết quả trả về từ VNPAY)
app.get('/api/orders/vnpay_ipn', async (req, res) => {
    try {
        const vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash']; 

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_HashType']; 

        // 1. Sắp xếp lại params và tạo Hash của mình
        // @ts-ignore
        const sortedParams = sortObject(vnp_Params);
const signData = qs.stringify(sortedParams, { encode: false });
const myHash = createVnPayHash(VNP_HASH_SECRET, signData);


        // 2. Kiểm tra chữ ký bảo mật
        if (myHash === secureHash) {
            const orderCode = vnp_Params['vnp_TxnRef']; 
            const rspCode = vnp_Params['vnp_ResponseCode']; 
            const vnp_TransactionStatus = vnp_Params['vnp_TransactionStatus']; 
            const amount = Number(vnp_Params['vnp_Amount']) / 100; 

            // Kiểm tra đơn hàng trong DB
            const [order] = (await queryDatabase("SELECT status, totalAmount FROM orders WHERE paymentCode = ?", [orderCode])) as any[];

            if (!order) {
                return res.json({ RspCode: '01', Message: 'Order not found' });
            }

            if (Number(order.totalAmount) !== amount) {
                return res.json({ RspCode: '04', Message: 'Invalid Amount' });
            }

            if (order.status !== 'pending') {
                return res.json({ RspCode: '02', Message: 'Order already confirmed' });
            }

            // 3. Xử lý trạng thái giao dịch
            if (rspCode === '00' && vnp_TransactionStatus === '00') {
                // Giao dịch thành công
                await queryDatabase(
                    "UPDATE orders SET status = 'approved', paymentTime = ? WHERE paymentCode = ?",
                    [moment().format('YYYY-MM-DD HH:mm:ss'), orderCode]
                );
                return res.json({ RspCode: '00', Message: 'Success' });
            } else {
                // Giao dịch thất bại/Hủy
                await queryDatabase(
                    "UPDATE orders SET status = 'cancelled' WHERE paymentCode = ?",
                    [orderCode]
                );
                return res.json({ RspCode: '00', Message: 'Success' });
            }
        } else {
            // Sai chữ ký
            return res.json({ RspCode: '97', Message: 'Invalid Checksum' });
        }
    } catch (error) {
        console.error("VNPAY IPN Error:", error);
        return res.json({ RspCode: '99', Message: 'Unknown error' });
    }
});


// ------------------------------
// ROUTE TẠO ĐƠN HÀNG GỐC (/api/orders)
// ------------------------------
app.post("/api/orders", authMiddleware, async (req, res) => {
    try {
        const session = (req as any).user;
        const { items, shipping, paymentMethod = "cod", notes } = req.body || {}; 
        
        // CHỈ CHẤP NHẬN COD HOẶC VNPAY
        if (!["cod", "vnpay"].includes(paymentMethod)) {
            return res.status(400).json({ error: "Phương thức thanh toán không hợp lệ. Chỉ chấp nhận COD hoặc VNPAY." });
        }

        if (!Array.isArray(items) || !items.length) {
            return res.status(400).json({ error: "Items are required" });
        }
        
        const normalizedItems = items
            .map((item: any) => ({ productId: Number(item.productId), quantity: Number(item.quantity || 0), }))
            .filter((item: any) => item.productId && item.quantity > 0); 
        
        if (!normalizedItems.length) {
            return res.status(400).json({ error: "Invalid items" });
        } 
        if (!shipping?.name || !shipping?.phone || !shipping?.email || !shipping?.address) {
            return res.status(400).json({ error: "Shipping info is incomplete" });
        }

        const ids = normalizedItems.map((item: any) => item.productId);
        const placeholders = ids.map(() => "?").join(",");
        const dbProducts = (await queryDatabase(
            `SELECT id, name, price, stock FROM products WHERE id IN (${placeholders})`,
            ids
        )) as any[];
        if (dbProducts.length !== ids.length) {
            return res.status(404).json({ error: "One or more products not found" });
        }
        
        let totalAmount = 0;
        const detailedItems = normalizedItems.map((item: any) => {
            const product = dbProducts.find((p: any) => Number(p.id) === item.productId);
            const price = typeof item.price === "number" ? item.price : Number(product.price);
            const lineTotal = price * item.quantity;
            totalAmount += lineTotal;
            return { productId: product.id, productName: product.name, quantity: item.quantity, price, };
        });

        // Trạng thái ban đầu: 'pending' cho cả COD và VNPAY, sau đó COD sẽ được cập nhật ngay lập tức.
        const status = "pending"; 
        
        const orderCode = buildOrderCode(); 

        const insertResult = (await queryDatabase(
            "INSERT INTO orders (code, userId, customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, status, totalAmount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                orderCode,
                session?.userId ?? null, 
                shipping.name ?? " Khách Hàng",
                shipping.email ?? "",
                shipping.phone ?? "",
                shipping.address ?? "",
                paymentMethod ?? "cod",
                status ?? "pending",
                totalAmount ?? 0,
                notes ?? null,
            ]
        )) as any;
        const orderId = decodeInsertId(insertResult); 

        for (const item of detailedItems) {
            await queryDatabase(
                "INSERT INTO order_items (orderId, productId, productName, quantity, price) VALUES (?, ?, ?, ?, ?)",
                [orderId, item.productId, item.productName, item.quantity, item.price]
            );
        }
        
        // Nếu là COD, cập nhật trạng thái thành 'approved' ngay lập tức
        // Keep order status as pending until admin processes it
        
        res.json({ code: orderCode });

    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ error: "Lỗi Server khi tạo đơn hàng." });
    }
});


// ------------------------------
// KHỞI ĐỘNG SERVER (HTTP MẶC ĐỊNH)
// ------------------------------
app.listen(PORT, () => {
  console.log(`Server chạy ổn định tại http://localhost:${PORT}`);
});



async function ensureDefaultAdmin() {
  try {
    const existing = (await queryDatabase("SELECT id FROM users WHERE email = ?", ["admin@gmail.com"])) as any[];
    if (!existing?.length) {
      const hashed = await bcrypt.hash("Admin1", 10);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      await queryDatabase(
        "INSERT INTO users (fullName, email, password, role, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        ["Administrator", "admin@gmail.com", hashed, "admin", "active", now]
      );
      console.log("Default admin created: admin@gmail.com / Admin1");
    }
  } catch (error) {
    console.error("Failed to ensure default admin", error);
  }
}

async function ensureCommerceTables() {
  try {
    const stockColumn = await queryDatabase(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stock'"
    ) as any[];
    if (!Array.isArray(stockColumn) || !stockColumn.length) {
      await queryDatabase("ALTER TABLE products ADD COLUMN stock INT DEFAULT 0 AFTER price");
      console.log("Added stock column to products table.");
    }
  } catch (error) {
    console.warn("Stock column check failed", error);
  }

  // BỔ SUNG LƯỢNG LÀM THÊM: KIỂM TRA VÀ THÊM CỘT paymentCode CHO ORDERS
  try {
    const paymentCodeColumn = await queryDatabase(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'paymentCode'"
    ) as any[];
    if (!Array.isArray(paymentCodeColumn) || !paymentCodeColumn.length) {
      // Thêm cột paymentCode (VARCHAR 50) để lưu mã giao dịch PayOS/VNPAY
      await queryDatabase("ALTER TABLE orders ADD COLUMN paymentCode VARCHAR(50) NULL AFTER paymentMethod");
      console.log("Added paymentCode column to orders table.");
    }
  } catch (error) {
    console.warn("Payment code column check failed", error);
  }
  
  // Đảm bảo lệnh CREATE TABLE này không bị thay đổi (giữ nguyên so với file huynh gửi)
  await queryDatabase("CREATE TABLE IF NOT EXISTS orders (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    code VARCHAR(20) NOT NULL UNIQUE,\n    userId INT NULL,\n    customerName VARCHAR(255),\n    customerEmail VARCHAR(255),\n    customerPhone VARCHAR(50),\n    shippingAddress VARCHAR(500),\n    paymentMethod VARCHAR(50) DEFAULT 'cod',\n    status ENUM('pending','approved','cancelled') DEFAULT 'pending',\n    totalAmount DECIMAL(12,2) DEFAULT 0,\n    notes TEXT,\n    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL\n  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  await queryDatabase("CREATE TABLE IF NOT EXISTS order_items (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    orderId INT NOT NULL,\n    productId INT NULL,\n    productName VARCHAR(255),\n    quantity INT NOT NULL,\n    price DECIMAL(12,2) NOT NULL,\n    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,\n    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL\n  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

async function bootstrap() {
  await ensureDefaultAdmin();
  await ensureCommerceTables();
}

bootstrap().catch((error) => console.error("Bootstrap error", error));

const requireRoles = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    const session = req.user;
    if (!session || !roles.includes(session.role)) {
      return res.status(403).json({ error: "Permission denied" });
    }
    next();
  };
};

const requireAdmin = requireRoles(["admin"]);
const requireAdminOrStaff = requireRoles(["admin", "staff"]);





app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    const errors = validateSignUp({ fullName, email, password, confirmPassword });
    if (errors.length) return res.status(400).json({ errors });

    const existing = (await queryDatabase("SELECT id FROM users WHERE email = ?", [email])) as any[];
    if (existing?.length) {
      return res.status(400).json({ errors: [{ field: "email", message: "Email đã tồn tại" }] });
    }

    const hashed = await bcrypt.hash(password, 10);
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    await queryDatabase(
      "INSERT INTO users (fullName, email, password, role, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [fullName, email, hashed, "user", "active", now]
    );

    const token = generateToken(0, email, "user");
    res.status(201).json({ message: "Đăng ký thành công", token, user: { fullName, email, role: "user" } });
  } catch (error) {
    console.error("Register error", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validateSignIn({ email, password });
    if (errors.length) return res.status(400).json({ errors });

    const rows = (await queryDatabase("SELECT * FROM users WHERE email = ?", [email])) as any[];
    if (!rows?.length) return res.status(401).json({ errors: [{ field: "email", message: "Tài khoản không tồn tại" }] });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ errors: [{ field: "password", message: "Mật khẩu không đúng" }] });

    if (user.status && user.status !== "active") {
      return res.status(403).json({ errors: [{ field: "email", message: "Tài khoản đang bị khóa" }] });
    }

    const token = generateToken(user.id, user.email, user.role);
    res.json({
      message: "Đăng nhập thành công",
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validateSignIn({ email, password });
    if (errors.length) return res.status(400).json({ errors });

    const rows = (await queryDatabase("SELECT * FROM users WHERE email = ?", [email])) as any[];
    if (!rows?.length) return res.status(401).json({ errors: [{ field: "email", message: "Tài khoản không tồn tại" }] });

    const admin = rows[0];
    if (!["admin", "staff"].includes(admin.role)) {
      return res.status(403).json({ errors: [{ field: "email", message: "Tài khoản không có quyền" }] });
    }

    if (admin.status && admin.status !== "active") {
      return res.status(403).json({ errors: [{ field: "email", message: "Tài khoản đang bị khóa" }] });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ errors: [{ field: "password", message: "Mật khẩu không đúng" }] });

    const token = generateToken(admin.id, admin.email, admin.role);
    res.json({ message: "Đăng nhập quản trị thành công", token, user: { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role } });
  } catch (error) {
    console.error("Admin login error", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const session = (req as any).user;
    const rows = (await queryDatabase("SELECT id, fullName, email, phone, role FROM users WHERE id = ?", [session.userId])) as any[];
    if (!rows?.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Get profile error", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const session = (req as any).user;
    const { fullName, phone } = req.body;
    if (!fullName?.trim()) return res.status(400).json({ error: "Full name is required" });

    await queryDatabase("UPDATE users SET fullName = ?, phone = ? WHERE id = ?", [
      fullName.trim(),
      phone ?? null,
      session.userId,
    ]);
    const rows = (await queryDatabase("SELECT id, fullName, email, phone, role FROM users WHERE id = ?", [
      session.userId,
    ])) as any[];
    if (!rows?.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = rows[0];
    await queryDatabase(
      "UPDATE orders SET customerName = ?, customerEmail = ?, customerPhone = ? WHERE userId = ?",
      [updatedUser.fullName, updatedUser.email, updatedUser.phone ?? null, session.userId]
    );
    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/orders", authMiddleware, async (req, res) => {
  try {
    const session = (req as any).user;
    const { items, shipping, paymentMethod = "cod", notes } = req.body || {};

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "Items are required" });
    }

    const normalizedItems = items
      .map((item: any) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity || 0),
      }))
      .filter((item: any) => item.productId && item.quantity > 0);

    if (!normalizedItems.length) {
      return res.status(400).json({ error: "Invalid items" });
    }

    if (!shipping?.name || !shipping?.phone || !shipping?.email || !shipping?.address) {
      return res.status(400).json({ error: "Shipping info is incomplete" });
    }

    const ids = normalizedItems.map((item: any) => item.productId);
    const placeholders = ids.map(() => "?").join(",");
    const dbProducts = (await queryDatabase(
      `SELECT id, name, price, stock FROM products WHERE id IN (${placeholders})`,
      ids
    )) as any[];

    if (dbProducts.length !== ids.length) {
      return res.status(404).json({ error: "One or more products not found" });
    }

    let totalAmount = 0;
    const detailedItems = normalizedItems.map((item: any) => {
      const product = dbProducts.find((p: any) => Number(p.id) === item.productId);
      const lineTotal = Number(product.price) * item.quantity;
      totalAmount += lineTotal;
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const code = buildOrderCode();
    const insertResult = (await queryDatabase(
      `INSERT INTO orders (code, userId, customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, status, totalAmount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        code,
        session.userId,
        shipping.name,
        shipping.email,
        shipping.phone,
        shipping.address,
        paymentMethod,
        totalAmount,
        notes ?? null,
      ]
    )) as any;

    const orderId = decodeInsertId(insertResult);

    for (const item of detailedItems) {
      await queryDatabase(
        `INSERT INTO order_items (orderId, productId, productName, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.productName, item.quantity, item.price]
      );
      await queryDatabase(`UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?`, [item.quantity, item.productId]);
    }

    const [orderRow] = (await queryDatabase("SELECT * FROM orders WHERE id = ?", [orderId])) as any[];

    res.status(201).json({ ...orderRow, items: detailedItems });
  } catch (error) {
    console.error("Create order error", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/orders/me", authMiddleware, async (req, res) => {
  try {
    const session = (req as any).user;
    const orders = (await queryDatabase("SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC", [session.userId])) as any[];
    const ids = orders.map((o) => o.id);
    let items: any[] = [];
    if (ids.length) {
      const placeholders = ids.map(() => "?").join(",");
      items = (await queryDatabase(`SELECT * FROM order_items WHERE orderId IN (${placeholders})`, ids)) as any[];
    }
    const mapped = orders.map((order) => ({
      ...order,
      items: items.filter((item) => Number(item.orderId) === Number(order.id)),
    }));
    res.json(mapped);
  } catch (error) {
    console.error("Fetch user orders error", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/categories", async (_req, res) => {
  try {
    const rows = await queryDatabase("SELECT id, name, status FROM categories ORDER BY name");
    res.json(rows);
  } catch (error) {
    console.error("Categories error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { q = "", categoryId, minPrice, maxPrice } = req.query as any;
    let sql = `SELECT p.*, c.name AS categoryName FROM products p LEFT JOIN categories c ON c.id = p.categoryId WHERE p.status = 'active'`;
    const params: any[] = [];
    if (categoryId) {
      sql += " AND p.categoryId = ?";
      params.push(categoryId);
    }
    if (minPrice) {
      sql += " AND p.price >= ?";
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += " AND p.price <= ?";
      params.push(Number(maxPrice));
    }
    if (q) {
      sql += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY p.createdAt DESC";
    const rows = await queryDatabase(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Products error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rows = (await queryDatabase(
      "SELECT p.*, c.name AS categoryName FROM products p LEFT JOIN categories c ON c.id = p.categoryId WHERE p.id = ?",
      [id]
    )) as any[];
    if (!rows?.length) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Product detail error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/admin/products", authMiddleware, requireAdminOrStaff, async (req, res) => {
  try {
    const { q = "", status, categoryId, minPrice, maxPrice } = req.query as any;
    let sql = `SELECT p.*, c.name AS categoryName FROM products p LEFT JOIN categories c ON c.id = p.categoryId WHERE 1=1`;
    const params: any[] = [];
    if (q) {
      sql += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }
    if (status) {
      sql += " AND p.status = ?";
      params.push(status);
    }
    if (categoryId) {
      sql += " AND p.categoryId = ?";
      params.push(categoryId);
    }
    if (minPrice) {
      sql += " AND p.price >= ?";
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += " AND p.price <= ?";
      params.push(Number(maxPrice));
    }
    sql += " ORDER BY p.createdAt DESC";
    const rows = await queryDatabase(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Admin products error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/admin/products", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, price, stock = 0, categoryId, description, imageUrl, status = "active" } = req.body;
    if (!name || typeof price === "undefined") {
      return res.status(400).json({ error: "Name and price are required" });
    }
    const result = (await queryDatabase(
      "INSERT INTO products (name, price, stock, categoryId, description, imageUrl, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, Number(price), Number(stock) || 0, categoryId || null, description || null, imageUrl || null, status]
    )) as any;
    const id = decodeInsertId(result);
    const [row] = (await queryDatabase("SELECT * FROM products WHERE id = ?", [id])) as any[];
    res.status(201).json(row);
  } catch (error) {
    console.error("Create product error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/admin/products/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, categoryId, description, imageUrl, status } = req.body;
    const exists = (await queryDatabase("SELECT id FROM products WHERE id = ?", [id])) as any[];
    if (!exists?.length) return res.status(404).json({ error: "Product not found" });

    await queryDatabase(
      "UPDATE products SET name = ?, price = ?, stock = ?, categoryId = ?, description = ?, imageUrl = ?, status = ? WHERE id = ?",
      [name, Number(price), Number(stock) || 0, categoryId || null, description || null, imageUrl || null, status, id]
    );
    const [row] = (await queryDatabase("SELECT * FROM products WHERE id = ?", [id])) as any[];
    res.json(row);
  } catch (error) {
    console.error("Update product error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/admin/products/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await queryDatabase("DELETE FROM products WHERE id = ?", [id]);
    await queryDatabase("DELETE FROM order_items WHERE productId = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete product error", error);
    res.status(500).json({ error: "Database error" });
  }
});


app.post("/api/admin/products/import", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) {
      return res.status(400).json({ error: "Danh sách items không hợp lệ" });
    }
    let inserted = 0;
    let updated = 0;
    for (const item of items) {
      const { id, name, price } = item || {};
      if (!name || typeof price === "undefined") continue;
      const payload = {
        stock: Number(item.stock) || 0,
        categoryId: item.categoryId || null,
        description: item.description || null,
        imageUrl: item.imageUrl || null,
        status: item.status === "inactive" ? "inactive" : "active",
      };
      if (id) {
        const exists = await queryDatabase("SELECT id FROM products WHERE id = ?", [id]);
        if (Array.isArray(exists) && exists.length) {
          await queryDatabase(
            "UPDATE products SET name = ?, price = ?, stock = ?, categoryId = ?, description = ?, imageUrl = ?, status = ? WHERE id = ?",
            [name, Number(price), payload.stock, payload.categoryId, payload.description, payload.imageUrl, payload.status, id]
          );
          updated += 1;
          continue;
        }
      }
      await queryDatabase(
        "INSERT INTO products (name, price, stock, categoryId, description, imageUrl, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, Number(price), payload.stock, payload.categoryId, payload.description, payload.imageUrl, payload.status]
      );
      inserted += 1;
    }
    res.json({ inserted, updated });
  } catch (error) {
    console.error("Import products error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/admin/orders", authMiddleware, requireAdminOrStaff, async (req, res) => {
  try {
    const { status, q } = req.query as any;
    let sql = `SELECT o.*, u.fullName AS accountName, u.email AS accountEmail FROM orders o LEFT JOIN users u ON u.id = o.userId WHERE 1=1`;
    const params: any[] = [];
    if (status) {
      sql += " AND o.status = ?";
      params.push(status);
    }
    if (q) {
      sql += " AND (o.code LIKE ? OR o.customerName LIKE ? OR o.customerEmail LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY o.createdAt DESC";
    const rows = await queryDatabase(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Admin orders error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/admin/orders/:id", authMiddleware, requireAdminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const [order] = (await queryDatabase("SELECT * FROM orders WHERE id = ?", [id])) as any[];
    if (!order) return res.status(404).json({ error: "Order not found" });
    const items = await queryDatabase("SELECT * FROM order_items WHERE orderId = ?", [id]);
    res.json({ ...order, items });
  } catch (error) {
    console.error("Order detail error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.patch("/api/admin/orders/:id/status", authMiddleware, requireAdminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    await queryDatabase("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    const [row] = (await queryDatabase("SELECT * FROM orders WHERE id = ?", [id])) as any[];
    if (!row) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderItems = (await queryDatabase(
      "SELECT productName AS name, quantity, price FROM order_items WHERE orderId = ?",
      [id]
    )) as any[];
    const items = orderItems.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    const recipient = row.customerEmail || row.accountEmail;
    const customerName = row.customerName || row.accountName || "Customer";
    const total = Number(row.totalAmount || 0);

    if (recipient && row.code) {
      try {
        if (status === "approved") {
          await sendOrderApprovalEmail(recipient, {
            customerName,
            orderId: row.code,
            items,
            total,
          });
        } else if (status === "cancelled") {
          await sendOrderCancellationEmail(recipient, {
            customerName,
            orderId: row.code,
            items,
            total,
            reason: reason || row.notes || null,
          });
        }
      } catch (emailError) {
        console.error("Send status email failed", emailError);
      }
    }

    res.json({ ...row, items });
  } catch (error) {
    console.error("Update order status error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/admin/orders/import", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const orders = Array.isArray(req.body?.orders) ? req.body.orders : [];
    if (!orders.length) {
      return res.status(400).json({ error: "Danh sách đơn hàng không hợp lệ" });
    }
    let imported = 0;
    for (const orderInput of orders) {
      try {
        const items = Array.isArray(orderInput.items) ? orderInput.items : [];
        const normalizedItems = items
          .map((item: any) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity || 0),
            price: typeof item.price === "number" ? Number(item.price) : undefined,
          }))
          .filter((item: any) => item.productId && item.quantity > 0);
        if (!normalizedItems.length) continue;
        const ids = normalizedItems.map((item: any) => item.productId);
        const placeholders = ids.map(() => "?").join(",");
        const dbProducts = (await queryDatabase(
          `SELECT id, name, price FROM products WHERE id IN (${placeholders})`,
          ids
        )) as any[];
        if (dbProducts.length !== ids.length) continue;
        let totalAmount = 0;
        const detailedItems = normalizedItems.map((item: any) => {
          const product = dbProducts.find((p: any) => Number(p.id) === item.productId);
          const price = typeof item.price === "number" ? item.price : Number(product.price);
          const lineTotal = price * item.quantity;
          totalAmount += lineTotal;
          return {
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            price,
          };
        });
        const status = ORDER_STATUSES.includes(orderInput.status) ? orderInput.status : "pending";
        const insertResult = (await queryDatabase(
          "INSERT INTO orders (code, userId, customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, status, totalAmount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            orderInput.code || buildOrderCode(),
            orderInput.userId || null,
            orderInput.customerName || "Khách hàng",
            orderInput.customerEmail || "",
            orderInput.customerPhone || "",
            orderInput.shippingAddress || "",
            orderInput.paymentMethod || "cod",
            status?? "pending",
            totalAmount?? 0,
            orderInput.notes || null,
          ]
        )) as any;
        const orderId = decodeInsertId(insertResult);
        for (const item of detailedItems) {
          await queryDatabase(
            "INSERT INTO order_items (orderId, productId, productName, quantity, price) VALUES (?, ?, ?, ?, ?)",
            [orderId, item.productId, item.productName, item.quantity, item.price]
          );
          await queryDatabase("UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [
            item.quantity,
            item.productId,
          ]);
        }
        imported += 1;
      } catch (innerError) {
        console.error("Skip order import", innerError);
      }
    }
    res.json({ imported });
  } catch (error) {
    console.error("Import orders error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/admin/customers", authMiddleware, requireAdminOrStaff, async (req, res) => {
  try {
    const { q } = req.query as any;
    let sql = `SELECT u.id, u.fullName, u.email, u.phone, u.role, u.status, u.createdAt,\n      COUNT(o.id) AS totalOrders,\n      COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.totalAmount ELSE 0 END), 0) AS totalSpent\n      FROM users u\n      LEFT JOIN orders o ON o.userId = u.id\n      WHERE u.role IN ('user','staff')`;
    const params: any[] = [];
    if (q) {
      sql += " AND (u.fullName LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += " GROUP BY u.id ORDER BY u.createdAt DESC";
    const rows = await queryDatabase(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Customers error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.patch("/api/admin/users/:id/role", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["user", "staff", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    await queryDatabase("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    const [row] = (await queryDatabase("SELECT id, fullName, email, role, status FROM users WHERE id = ?", [id])) as any[];
    res.json(row);
  } catch (error) {
    console.error("Update role error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/admin/stats", authMiddleware, requireAdminOrStaff, async (_req, res) => {
  try {
    const [orderRow] = (await queryDatabase(
      `SELECT
        COALESCE(SUM(CASE WHEN status = 'approved' THEN totalAmount ELSE 0 END), 0) AS revenue,
        COUNT(*) AS totalOrders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingOrders,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approvedOrders
      FROM orders`
    )) as any[];
    const [productRow] = (await queryDatabase("SELECT COUNT(*) AS totalProducts FROM products")) as any[];
    const [customerRow] = (await queryDatabase("SELECT COUNT(*) AS totalCustomers FROM users WHERE role IN ('user','staff')")) as any[];
    const monthly = await queryDatabase(
      "SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, SUM(totalAmount) AS revenue FROM orders WHERE status = 'approved' AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH) GROUP BY DATE_FORMAT(createdAt, '%Y-%m') ORDER BY month"
    );

    res.json({
      revenue: Number(orderRow?.revenue || 0),
      orders: Number(orderRow?.totalOrders || 0),
      approvedOrders: Number(orderRow?.approvedOrders || 0),
      pendingOrders: Number(orderRow?.pendingOrders || 0),
      products: Number(productRow?.totalProducts || 0),
      customers: Number(customerRow?.totalCustomers || 0),
      monthly,
    });
  } catch (error) {
    console.error("Stats error", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
