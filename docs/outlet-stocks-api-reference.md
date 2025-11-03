# Outlet Stocks API - Products & Materials (Separate Endpoints)

## Overview
Stock movements untuk **products** dan **materials** dipisah menjadi dua endpoint terpisah dengan response structure yang sama.

## Endpoints

### 1. Product Stocks
**URL:** `GET /api/v1/outlets/:id/stocks/products`

**Response Structure:**
```json
{
  "data": [
    {
      "date": "2024-11-04",
      "product_id": 1,
      "product_name": "Corndog Original",
      "first_stock": 50,
      "stock_in": 100,
      "sold_stock": 80,
      "remaining_stock": 70
    }
  ],
  "metadata": {
    "page": 1,
    "limit": 10,
    "total_records": 220,
    "total_pages": 22
  }
}
```

### 2. Material Stocks
**URL:** `GET /api/v1/outlets/:id/stocks/materials`

**Response Structure:**
```json
{
  "data": [
    {
      "date": "2024-11-04",
      "material_id": 1,
      "material_name": "Tepung Terigu",
      "first_stock": 100,
      "stock_in": 50,
      "used_stock": 30,
      "remaining_stock": 120
    }
  ],
  "metadata": {
    "page": 1,
    "limit": 10,
    "total_records": 150,
    "total_pages": 15
  }
}
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 10 | Items per page |
| `start_date` | string (ISO date) | No | 30 days ago | Start date filter (YYYY-MM-DD) |
| `end_date` | string (ISO date) | No | Today | End date filter (YYYY-MM-DD) |

### Example Requests

#### Products Endpoint
```bash
# Get product stocks - first page (default 10 items)
GET /api/v1/outlets/1/stocks/products

# Get page 2 with 20 items per page
GET /api/v1/outlets/1/stocks/products?page=2&limit=20

# Filter by date range
GET /api/v1/outlets/1/stocks/products?start_date=2024-10-01&end_date=2024-10-31

# Combine pagination and date filtering
GET /api/v1/outlets/1/stocks/products?page=1&limit=50&start_date=2024-11-01&end_date=2024-11-04
```

#### Materials Endpoint
```bash
# Get material stocks - first page (default 10 items)
GET /api/v1/outlets/1/stocks/materials

# Get page 2 with 20 items per page
GET /api/v1/outlets/1/stocks/materials?page=2&limit=20

# Filter by date range
GET /api/v1/outlets/1/stocks/materials?start_date=2024-10-01&end_date=2024-10-31

# Combine pagination and date filtering
GET /api/v1/outlets/1/stocks/materials?page=1&limit=50&start_date=2024-11-01&end_date=2024-11-04
```

## Stock Calculation Logic

### Products
1. **first_stock**: Remaining stock from the previous day (calculated recursively)
2. **stock_in**: Sum of `approval_quantity` from `OutletProductRequest` with status `APPROVED` for that day
3. **sold_stock**: Sum of `quantity` from `OrderItem` for orders placed that day
4. **remaining_stock**: `first_stock + stock_in - sold_stock`

**Database Tables Used:**
- `outlet_requests` (OutletProductRequest) - for stock_in
- `order_items` (OrderItem) - for sold_stock via order relation
- `products` - for product names

### Materials
1. **first_stock**: Remaining stock from the previous day (calculated recursively)
2. **stock_in**: Sum of `approval_quantity` from `OutletMaterialRequest` with status `APPROVED` for that day
3. **used_stock**: Sum of `quantity` from `MaterialOut` for materials used that day
4. **remaining_stock**: `first_stock + stock_in - used_stock`

**Database Tables Used:**
- `outlet_material_requests` (OutletMaterialRequest) - for stock_in
- `material_outs` (MaterialOut) - for used_stock
- `materials` - for material names

⚠️ **Note**: `MaterialOut` table does NOT have an `outlet_id` field, so `used_stock` represents **global warehouse usage** for all outlets, not outlet-specific consumption. If outlet-specific material tracking is needed, the schema should be modified to add `outlet_id` to `material_outs`.

## Pagination Behavior

- **Independent Endpoints**: Products dan materials memiliki endpoint terpisah
- **Same Query Parameters**: Kedua endpoint menggunakan parameter `page`, `limit`, `start_date`, `end_date` yang sama
- **Consistent Metadata Format**: Menggunakan format yang sama dengan endpoint GET /outlets:
  - `page`: Halaman saat ini
  - `limit`: Jumlah item per halaman
  - `total_records`: Total semua records
  - `total_pages`: Total halaman
- **Different Totals**: Setiap endpoint memiliki `total_records` dan `total_pages` sendiri berdasarkan:
  - Jumlah produk/material aktif
  - Jumlah hari dalam rentang tanggal
  - Total = (jumlah items) × (jumlah hari)

Contoh:
- **Products**: 22 produk aktif × 30 hari = 660 total records → 66 halaman (limit=10)
- **Materials**: 15 material aktif × 30 hari = 450 total records → 45 halaman (limit=10)

## Schema Details

### OutletMaterialRequest Table
```prisma
model OutletMaterialRequest{
  id                 Int                    @id @default(autoincrement())
  outlet_id          Int
  material_id        Int
  quantity           Int                    // Requested quantity
  approval_quantity  Int?                   // Approved quantity (null until approved)
  status             OUTLETREQUESTSTATUS    @default(PENDING)  // PENDING | APPROVED | REJECTED | FULFILLED
  createdAt          DateTime               @default(now())
  
  outlet             Outlet                 @relation(...)
  material           material               @relation(...)
}
```

### MaterialOut Table
```prisma
model MaterialOut {
  id             Int      @id @default(autoincrement())
  material_id    Int
  quantity       Int
  quantity_unit  String   // Unit of measurement (kg, liter, pcs, etc.)
  used_at        DateTime @default(now())
  
  material       material @relation(...)
}
```

⚠️ **Important**: No `outlet_id` in MaterialOut - tracks global usage!

### Material Table
```prisma
model material {
  id                    Int                     @id @default(autoincrement())
  suplier_id            Int
  name                  String
  
  material_in           MaterialIn[]
  material_out          MaterialOut[]
  requests              OutletMaterialRequest[]
}
```

## Implementation Files

### 1. Entity Types (`src/core/entities/outlet/outlet.ts`)
```typescript
// Product stock item
export type TOutletStockItem = {
  date: string;
  product_id: number;
  product_name: string;
  first_stock: number;
  stock_in: number;
  sold_stock: number;
  remaining_stock: number;
}

// Material stock item
export type TMaterialStockItem = {
  date: string;
  material_id: number;
  material_name: string;
  first_stock: number;
  stock_in: number;
  used_stock: number;
  remaining_stock: number;
}

// Product stock response
export type TOutletProductStockResponse = {
  data: TOutletStockItem[];
  metadata: {
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
  };
}

// Material stock response
export type TOutletMaterialStockResponse = {
  data: TMaterialStockItem[];
  metadata: {
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
  };
}
```

### 2. Repository Methods (`src/adapters/postgres/repositories/OutletRepository.ts`)
- **`getOutletProductStocks()`**: Menghitung product stock movements
- **`getOutletMaterialStocks()`**: Menghitung material stock movements

### 3. Service (`src/core/services/OutletService.ts`)
- **`getOutletProductStocks()`**: Wraps repository call untuk products
- **`getOutletMaterialStocks()`**: Wraps repository call untuk materials

### 4. Controller (`src/transports/api/controllers/OutletController.ts`)
- **`getOutletProductStocks`**: HTTP handler untuk product stocks
- **`getOutletMaterialStocks`**: HTTP handler untuk material stocks

### 5. Router (`src/transports/api/routers/v1/outlet.ts`)
- Route: `GET /:id/stocks/products`
- Route: `GET /:id/stocks/materials`

## Testing

### Test Product Stocks

1. **Verify outlet exists:**
   ```bash
   curl http://localhost:3000/api/v1/outlets/1
   ```

2. **Get product stocks (default pagination):**
   ```bash
   curl http://localhost:3000/api/v1/outlets/1/stocks/products
   ```

3. **Test with custom pagination:**
   ```bash
   curl "http://localhost:3000/api/v1/outlets/1/stocks/products?page=2&limit=20"
   ```

4. **Test with date filtering:**
   ```bash
   curl "http://localhost:3000/api/v1/outlets/1/stocks/products?start_date=2024-11-01&end_date=2024-11-04"
   ```

### Test Material Stocks

1. **Get material stocks (default pagination):**
   ```bash
   curl http://localhost:3000/api/v1/outlets/1/stocks/materials
   ```

2. **Test with custom pagination:**
   ```bash
   curl "http://localhost:3000/api/v1/outlets/1/stocks/materials?page=2&limit=20"
   ```

3. **Test with date filtering:**
   ```bash
   curl "http://localhost:3000/api/v1/outlets/1/stocks/materials?start_date=2024-11-01&end_date=2024-11-04"
   ```

## Expected Behavior

### Success Case (200)
**Product Endpoint:**
- Returns object dengan `data` array berisi TOutletStockItem
- Metadata dengan informasi pagination
- Date filtering dan pagination bekerja dengan baik

**Material Endpoint:**
- Returns object dengan `data` array berisi TMaterialStockItem
- Metadata dengan informasi pagination
- Date filtering dan pagination bekerja dengan baik

### Error Case (404)
**Kedua Endpoint:**
- Outlet tidak ditemukan
- Returns empty array dengan metadata zero

## Keuntungan Pemisahan Endpoint

1. **Cleaner Response**: Response lebih sederhana dan fokus
2. **Independent Queries**: Client bisa request hanya data yang dibutuhkan
3. **Better Performance**: Tidak perlu query kedua tabel jika hanya butuh salah satu
4. **Easier Caching**: Caching strategy bisa berbeda untuk products vs materials
5. **Scalability**: Lebih mudah untuk optimize atau scale secara terpisah

## Future Improvements

1. **Outlet-Specific Material Usage**: Modify `material_outs` schema to add `outlet_id` for outlet-specific tracking
2. **Performance Optimization**: Current implementation has nested loops with multiple DB queries - consider batch queries or materialized views
3. **Caching**: Implement Redis caching for historical stock data (doesn't change)
4. **Real-time Updates**: Consider WebSocket notifications for stock changes
5. **Export**: Add CSV/Excel export functionality for stock reports
