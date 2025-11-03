# 🚀 Quick Start - WebSocket Stock Events

## ⚡ TL;DR

WebSocket real-time monitoring untuk perubahan stock produk dan material di setiap outlet.

---

## 📡 Event Types

| Event | Triggered By | Data |
|-------|-------------|------|
| `outlet:product:stock:changed` | Order dibuat / Product request approved | Product stock data |
| `outlet:material:stock:changed` | Material request approved | Material stock data |

---

## 🎯 Quick Test

### 1. Buka Monitor UI
```
http://localhost:8080/stock-monitor.html
```

### 2. Connect & Join Room
```javascript
const socket = io('http://localhost:8080');

// Join outlet 1
socket.emit('join:outlet', 1);

// Or join all (admin)
socket.emit('join:product:stocks');
socket.emit('join:material:stocks');
```

### 3. Listen Events
```javascript
socket.on('outlet:product:stock:changed', (data) => {
  console.log(data);
  // {
  //   date: "2024-11-04",
  //   outlet_id: 1,
  //   product_id: 5,
  //   product_name: "Corndog Cheese",
  //   first_stock: 100,
  //   stock_in: 50,
  //   sold_stock: 30,
  //   remaining_stock: 120
  // }
});
```

### 4. Trigger Event
```bash
# Create order
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_method":"CASH","items":[{"product_id":1,"qty":5}]}'
```

---

## 📁 Files

- **UI Test:** `public/stock-monitor.html`
- **Docs:** `docs/WEBSOCKET_STOCK_EVENTS.md`
- **Summary:** `docs/WEBSOCKET_STOCK_IMPLEMENTATION.md`
- **Test Script:** `scripts/test-websocket-stock.sh`

---

## 🎨 Response Format

### Product Stock
```json
{
  "date": "2024-11-04",
  "outlet_id": 1,
  "product_id": 1,
  "product_name": "Corndog Original",
  "first_stock": 100,
  "stock_in": 50,
  "sold_stock": 30,
  "remaining_stock": 120
}
```

### Material Stock
```json
{
  "date": "2024-11-04",
  "outlet_id": 1,
  "material_id": 1,
  "material_name": "Tepung Terigu",
  "first_stock": 100,
  "stock_in": 50,
  "used_stock": 30,
  "remaining_stock": 120
}
```

---

## 🏪 Rooms

- `outlet:{id}` - Specific outlet only
- `product:stocks` - All product changes (admin)
- `material:stocks` - All material changes (admin)

---

## ✅ Status

**READY FOR USE** ✨

Created: November 4, 2024
