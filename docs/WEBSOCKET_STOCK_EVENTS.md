# WebSocket Real-time Stock Events

## Overview

Sistem WebSocket untuk monitoring perubahan stock produk dan material secara real-time di setiap outlet.

## Event Types

### 1. Product Stock Change Event
**Event Name:** `outlet:product:stock:changed`

**Triggered When:**
- Outlet product request di-approve (stock masuk)
- Order dibuat (produk terjual)

**Event Data:**
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

**Field Description:**
- `date`: Tanggal perubahan stock (YYYY-MM-DD)
- `outlet_id`: ID outlet
- `product_id`: ID produk
- `product_name`: Nama produk
- `first_stock`: Stock awal hari ini (remaining stock kemarin)
- `stock_in`: Jumlah produk yang masuk hari ini
- `sold_stock`: Jumlah produk terjual hari ini
- `remaining_stock`: Stock tersisa (first_stock + stock_in - sold_stock)

---

### 2. Material Stock Change Event
**Event Name:** `outlet:material:stock:changed`

**Triggered When:**
- Outlet material request di-approve (material masuk)

**Event Data:**
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

**Field Description:**
- `date`: Tanggal perubahan stock (YYYY-MM-DD)
- `outlet_id`: ID outlet
- `material_id`: ID material
- `material_name`: Nama material
- `first_stock`: Stock awal hari ini
- `stock_in`: Jumlah material yang masuk hari ini
- `used_stock`: Jumlah material terpakai hari ini
- `remaining_stock`: Stock tersisa (first_stock + stock_in - used_stock)

---

## WebSocket Rooms

### Outlet-Specific Room
**Room Name:** `outlet:{outletId}`

**Purpose:** Menerima event untuk outlet tertentu saja

**Join Room:**
```javascript
socket.emit('join:outlet', outletId);
```

**Leave Room:**
```javascript
socket.emit('leave:outlet', outletId);
```

**Use Case:** Client outlet yang hanya ingin monitoring stock outlet mereka sendiri

---

### Product Stocks Monitoring Room
**Room Name:** `product:stocks`

**Purpose:** Menerima semua product stock change events dari semua outlet

**Join Room:**
```javascript
socket.emit('join:product:stocks');
```

**Leave Room:**
```javascript
socket.emit('leave:product:stocks');
```

**Use Case:** Dashboard admin untuk monitoring semua perubahan product stock

---

### Material Stocks Monitoring Room
**Room Name:** `material:stocks`

**Purpose:** Menerima semua material stock change events dari semua outlet

**Join Room:**
```javascript
socket.emit('join:material:stocks');
```

**Leave Room:**
```javascript
socket.emit('leave:material:stocks');
```

**Use Case:** Dashboard admin untuk monitoring semua perubahan material stock

---

## Client Implementation

### 1. Connect to WebSocket Server

```javascript
const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### 2. Listen to Product Stock Changes

```javascript
socket.on('outlet:product:stock:changed', (data) => {
  console.log('Product stock changed:', data);
  // {
  //   date: "2024-11-04",
  //   outlet_id: 1,
  //   product_id: 5,
  //   product_name: "Corndog Cheese",
  //   first_stock: 50,
  //   stock_in: 20,
  //   sold_stock: 15,
  //   remaining_stock: 55
  // }
});
```

### 3. Listen to Material Stock Changes

```javascript
socket.on('outlet:material:stock:changed', (data) => {
  console.log('Material stock changed:', data);
  // {
  //   date: "2024-11-04",
  //   outlet_id: 1,
  //   material_id: 3,
  //   material_name: "Sosis",
  //   first_stock: 100,
  //   stock_in: 50,
  //   used_stock: 30,
  //   remaining_stock: 120
  // }
});
```

### 4. Join Specific Outlet Room

```javascript
const outletId = 1;
socket.emit('join:outlet', outletId);
console.log(`Joined outlet room: ${outletId}`);
```

### 5. Join Monitoring Rooms (Admin)

```javascript
// Monitor all product stock changes
socket.emit('join:product:stocks');

// Monitor all material stock changes
socket.emit('join:material:stocks');
```

---

## Complete Client Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Stock Monitor</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>Stock Monitor</h1>
  <div id="events"></div>

  <script>
    const socket = io('http://localhost:8080');
    
    socket.on('connect', () => {
      console.log('Connected!');
      
      // Join outlet room
      socket.emit('join:outlet', 1);
      
      // Or join monitoring rooms (admin)
      socket.emit('join:product:stocks');
      socket.emit('join:material:stocks');
    });
    
    socket.on('outlet:product:stock:changed', (data) => {
      const div = document.getElementById('events');
      div.innerHTML += `
        <div class="event">
          <h3>Product Stock Changed</h3>
          <p>Outlet: ${data.outlet_id} - ${data.product_name}</p>
          <p>Remaining: ${data.remaining_stock}</p>
          <p>Date: ${data.date}</p>
        </div>
      `;
    });
    
    socket.on('outlet:material:stock:changed', (data) => {
      const div = document.getElementById('events');
      div.innerHTML += `
        <div class="event">
          <h3>Material Stock Changed</h3>
          <p>Outlet: ${data.outlet_id} - ${data.material_name}</p>
          <p>Remaining: ${data.remaining_stock}</p>
          <p>Date: ${data.date}</p>
        </div>
      `;
    });
  </script>
</body>
</html>
```

---

## Testing

### 1. Open Stock Monitor UI
Buka browser dan akses:
```
http://localhost:8080/stock-monitor.html
```

### 2. Test Product Stock Change
```bash
# Create order (akan trigger product stock change event)
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payment_method": "CASH",
    "items": [
      {
        "product_id": 1,
        "qty": 5
      }
    ]
  }'
```

### 3. Test Material Stock Change
```bash
# Approve material request (akan trigger material stock change event)
curl -X POST http://localhost:8080/api/v1/outlet-requests/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "outlet_id": 1,
    "material_requests": [
      {
        "request_id": "uuid",
        "approval_quantity": 50
      }
    ]
  }'
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          WebSocket Flow                          │
└─────────────────────────────────────────────────────────────────┘

1. Client connects to WebSocket server
   └─> socket.io connection established

2. Client joins rooms
   ├─> join:outlet (specific outlet)
   ├─> join:product:stocks (all product changes)
   └─> join:material:stocks (all material changes)

3. Stock change happens (API endpoint called)
   ├─> Order created → product sold
   └─> Request approved → stock in

4. Stock Calculation Service calculates current stock
   └─> Queries database for today's stock data

5. Stock Event Emitter emits event
   ├─> Emit to outlet:{outletId} room
   └─> Emit to product:stocks or material:stocks room

6. Client receives event
   └─> Update UI with new stock data
```

---

## Related Files

- **Event Types:** `src/core/entities/websocket/events.ts`
- **Event Emitter:** `src/transports/websocket/events/StockEventEmitter.ts`
- **Stock Calculation:** `src/transports/websocket/services/StockCalculationService.ts`
- **WebSocket Server:** `src/transports/websocket/index.ts`
- **Controllers:**
  - `src/transports/api/controllers/OrderController.ts`
  - `src/transports/api/controllers/OutletRequestController.ts`
- **Test Client:** `public/stock-monitor.html`

---

## Notes

1. **Performance:** Stock calculation dilakukan secara real-time saat event terjadi. Untuk optimization, consider caching atau background jobs.

2. **Error Handling:** WebSocket errors tidak akan menyebabkan API request gagal. Event emission dilakukan dalam try-catch block.

3. **Room Strategy:**
   - Outlet-specific rooms untuk client yang hanya butuh data outlet mereka
   - Monitoring rooms untuk admin dashboard yang butuh semua data

4. **Data Accuracy:** Stock data dihitung berdasarkan:
   - First stock: remaining stock dari hari sebelumnya
   - Stock in: approval_quantity dari approved requests hari ini
   - Sold/Used stock: quantity dari orders/material out hari ini
   - Remaining: first_stock + stock_in - sold_stock

5. **Security:** Implementasi authentication/authorization untuk WebSocket connections jika diperlukan.
