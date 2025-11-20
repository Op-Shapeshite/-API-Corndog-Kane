import {  TSupplierGetResponse, TSupplierWithID } from "../../core/entities/suplier/suplier";

export  class SupplierResponseMapper {
  /**
   * Map single supplier entity to response format
   */
  static toResponse(supplier: TSupplierWithID): TSupplierGetResponse {
    return {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
      is_active: supplier.isActive ?? true,
      created_at: supplier.createdAt ?? new Date(),
      updated_at: supplier.updatedAt ?? new Date(),
    } as TSupplierGetResponse;
  }

  /**
   * Map array of supplier entities to list response format
   * Used in findAll endpoints
   */
  static toListResponse(suppliers: TSupplierWithID[]): TSupplierGetResponse[] {
    return suppliers.map(supplier => this.toResponse(supplier));
  }

}