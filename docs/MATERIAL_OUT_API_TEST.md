# Material Out API Endpoints Test

## POST `/api/v1/materials/out`

**Purpose**: Create material out record with description

### Request Body Example:
```json
{
  "quantity": 10,
  "material_id": 1,
  "unit_quantity": "kg",
  "description": "Used for production batch ABC-123"
}
```

### Expected Response:
```json
{
  "status": "success",
  "message": "Stock out created successfully",
  "data": {
    "id": 123,
    "material_id": 1,
    "quantity": 10,
    "unit_quantity": "kg",
    "description": "Used for production batch ABC-123",
    "date": "2025-12-01",
    // ... other inventory fields
  },
  "metadata": {}
}
```

---

## GET `/api/v1/materials/out/:id`

**Purpose**: Get list of material out records for specific material with description

### Request:
```
GET /api/v1/materials/out/1
```
Where `1` is the material_id

### Expected Response:
```json
{
  "status": "success",
  "message": "Material out list retrieved successfully",
  "data": [
    {
      "id": 123,
      "material_id": 1,
      "quantity": 10,
      "unit_quantity": "kg",
      "description": "Used for production batch ABC-123",
      "used_at": "2025-12-01T10:30:00.000Z",
      "created_at": "2025-12-01T10:30:00.000Z",
      "updated_at": "2025-12-01T10:30:00.000Z"
    },
    {
      "id": 124,
      "material_id": 1,
      "quantity": 5,
      "unit_quantity": "kg",
      "description": "Used for urgent order XYZ-789",
      "used_at": "2025-12-01T14:15:00.000Z",
      "created_at": "2025-12-01T14:15:00.000Z",
      "updated_at": "2025-12-01T14:15:00.000Z"
    }
  ],
  "metadata": {}
}
```

## Summary of Changes Made:

### ✅ POST `/api/v1/materials/out` 
- Already supports `description` field (optional)
- Validation schema includes `description: z.string().optional()`
- Entity type `TMaterialStockOutCreateRequest` has `description?: string`
- Service passes `description` to repository
- Repository saves `description` to database
- Database schema has `description String?` field

### ✅ GET `/api/v1/materials/out/:id`
- **UPDATED**: Now returns LIST of material out records for given material_id
- **UPDATED**: Service method `getMaterialOutById(materialId)` now returns array
- **UPDATED**: Repository method `getMaterialOutsByMaterialId(materialId)` added
- **UPDATED**: Controller handles array response properly
- Each record includes `description` field
- Records ordered by `used_at` DESC (newest first)

### Database Schema
The `MaterialOut` model already includes:
```prisma
model MaterialOut {
  id            Int      @id @default(autoincrement())
  material_id   Int
  quantity_unit String
  quantity      Int
  description   String?  // ✅ Already exists
  used_at       DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("material_outs")
}
```

Both endpoints are now ready and support the description field as requested.