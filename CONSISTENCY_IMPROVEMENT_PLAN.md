# Consistency Improvement Plan

This document outlines identified inconsistencies in the codebase and proposes a plan to rectify them. This covers naming conventions, typos, directory structure, and type safety.

## 1. Naming Conventions & Typos (High Priority)

These issues affect code readability and professional appearance.

### A. Typos
| Location | Current | Proposed | Notes |
|----------|---------|----------|-------|
| **Directory** | `src/core/entities/suplier` | `src/core/entities/supplier` | Rename directory |
| **File** | `src/core/entities/suplier/suplier.ts` | `src/core/entities/supplier/supplier.ts` | Rename file |
| **File** | `src/transports/api/controllers/SuplierController.ts` | `src/transports/api/controllers/SupplierController.ts` | Rename file & Class |
| **Prisma Schema** | `@@map("supliers")` | `@@map("suppliers")` | Database table name |
| **Prisma Schema** | `enum MeritalStatus` | `enum MaritalStatus` | Enum name |
| **Prisma Schema** | `@@map("product_stocs")` | `@@map("product_stocks")` | Database table name |

### B. Naming Standardization
| Location | Current | Proposed | Reason |
|----------|---------|----------|--------|
| **Prisma Schema** | `model material` | `model Material` | Models should be PascalCase |
| **Prisma Schema** | `enum OUTLETREQUESTSTATUS` | `enum OutletRequestStatus` | Enums should be PascalCase |
| **Controller File** | `ProductCategory.ts` | `ProductCategoryController.ts` | Missing `Controller` suffix |
| **Router File** | `category.ts` | `productCategory.ts` | Match controller/entity name (Optional) |

## 2. Structural Inconsistencies (Medium Priority)

| Location | Issue | Proposed Change |
|----------|-------|-----------------|
| `src/core/entities/suplier/material.ts` | Material entity is nested inside `suplier` directory. | Move to `src/core/entities/material/material.ts` or `src/core/entities/inventory/material.ts`. |

## 3. Type Consistency (From Existing Analysis)

Refer to `TYPE_CONSISTENCY_ANALYSIS.md` for detailed type safety improvements.
*   **Controllers**: Fix `any` types in `OutletRequestController`.
*   **Mappers**: Add generics to `EntityMapper` and `MapperUtil`.
*   **General**: Remove `as unknown as` assertions where possible.

## 4. Proposed Action Plan

1.  **Fix Typos**: Rename files, directories, and update imports. Update Prisma schema map names (requires migration).
2.  **Standardize Naming**: Rename `material` model to `Material` and `ProductCategory.ts` to `ProductCategoryController.ts`.
3.  **Refactor Structure**: Move `material.ts` to its own directory.
4.  **Apply Type Fixes**: Implement changes from `TYPE_CONSISTENCY_ANALYSIS.md`.

## User Confirmation Required

Please confirm if you want to proceed with:
1.  **Renaming files and directories** (Safe, but touches many files).
2.  **Renaming Prisma Models/Enums** (Requires database migration/db push).
3.  **Structural moves** (Moving `material.ts`).
