# API CORNDOG KANE - ENDPOINT LIST

**Base URL:** `http://localhost:8080/api/v1`

## AUTHENTICATION
- `POST /auth/login`

## SYSTEM & HEALTH
- `GET /health`

admin | superadmin | warehouse | hr | outlet | finance
1. admin | Superadmin
   can access all endpoints
2. warehouse

3. hr
4. outlet
5. finance

## USER MANAGEMENT
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

## PERMISSION MANAGEMENT
- `GET /permissions`
- `GET /permissions/roles`
- `GET /permissions/users/:userId/permissions`
- `POST /permissions/users/:userId/roles`
- `GET /permissions/roles/:roleId/permissions`
- `POST /permissions/roles/:roleId/permissions`
- `POST /permissions/permissions`
- `GET /permissions/users/by-permission/:permission`
- `POST /permissions/cache/clear`

## ROLE MANAGEMENT
- `GET /roles`
- `POST /roles`
- `PUT /roles/:id`
- `DELETE /roles/:id`

## EMPLOYEE MANAGEMENT
- `GET /employees`
- `GET /employees/:id`
- `POST /employees`
- `PUT /employees/:id`
- `GET /employees/schedule`
- `GET /employees/schedule/:outletId`
- `POST /employees/checkin`
- `POST /employees/checkout`
- `PATCH /employees/:id/:status`
- `DELETE /employees/schedule/:outlet_id/:date`

## OUTLET MANAGEMENT
- `GET /outlets`
- `GET /outlets/:id`
- `POST /outlets`
- `PUT /outlets/:id`
- `DELETE /outlets/:id`
- `POST /outlets/:id/employee/:employeeid`
- `GET /outlets/:id/stocks/products`
- `GET /outlets/:id/stocks/materials`
- `GET /outlets/:id/stocks/:category`
- `GET /outlets/:id/stocks/summarize`

## PRODUCT MANAGEMENT
- `GET /products`
- `GET /products/:id`
- `POST /products`
- `POST /products/bulk`
- `PUT /products/:id`
- `DELETE /products/:id`
- `GET /products/:id/materials`
- `POST /products/:id/materials`

## MASTER PRODUCT MANAGEMENT
- `GET /master-products`
- `GET /master-products/:id/inventory`
- `POST /master-products/inventory`
- `PUT /master-products/inventory/:id`

## CATEGORY MANAGEMENT
- `GET /categories`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

## MATERIAL MANAGEMENT
- `GET /materials`
- `POST /materials`
- `POST /materials/stock-in`
- `POST /materials/stock-out`
- `GET /materials/:id`
- `GET /materials/stocks`
- `GET /materials/movements/:materialId`

## SUPPLIER MANAGEMENT
- `GET /suppliers`
- `POST /suppliers`
- `PUT /suppliers/:id`
- `DELETE /suppliers/:id`

## INVENTORY MANAGEMENT
- `POST /inventory/buy`
- `PUT /inventory/stock-in/:inventoryId`
- `GET /inventory/purchases`

## ORDER MANAGEMENT
- `GET /orders`
- `GET /orders/:id`
- `GET /orders/outlet/:outletId`
- `POST /orders`

## OUTLET REQUEST MANAGEMENT
- `POST /outlet-requests`
- `GET /outlet-requests`
- `GET /outlet-requests/:id`
- `GET /outlet-requests/:id/items`
- `PUT /outlet-requests/:id`
- `PUT /outlet-requests/:id/items/:itemId`
- `DELETE /outlet-requests/:id`
- `DELETE /outlet-requests/:id/items/:itemId`
- `DELETE /outlet-requests/items/:itemId`
- `PATCH /outlet-requests/:id/status`
- `PATCH /outlet-requests/:id/approve`
- `PATCH /outlet-requests/:id/fulfill`

## FINANCE - PAYROLL
- `GET /finance/payroll`
- `POST /finance/payroll`
- `GET /finance/payroll/:employee_id`
- `PUT /finance/payroll/:employee_id`
- `GET /finance/payroll/pay/:employee_id`
- `POST /finance/payroll/pay/:employee_id`

## FINANCE - ACCOUNTS
- `GET /finance/accounts`
- `GET /finance/accounts/:id`
- `POST /finance/accounts`
- `PUT /finance/accounts/:id`
- `DELETE /finance/accounts/:id`

## FINANCE - ACCOUNT CATEGORIES
- `GET /finance/account-categories`

## FINANCE - ACCOUNT TYPES
- `GET /finance/account-types`
- `GET /finance/account-types/:id`

## FINANCE - TRANSACTIONS
- `GET /finance/transactions`
- `GET /finance/transactions/:id`
- `POST /finance/transactions`
- `PUT /finance/transactions/:id`
- `DELETE /finance/transactions/:id`

## FINANCE - REPORTS
- `GET /finance/reports/financial-statements`

## DASHBOARD
- `GET /dashboard`

## QUANTITY UNITS
- `GET /quantity-units`
- `GET /quantity-units/:idOrCode`

## TESTING ENDPOINTS
- `GET /authtest`
- `GET /authtest/admin`
- `GET /authtest/roles`