import { TAccount, TAccountWithID, TAccountCreate } from "../entities/finance/account";
import { AccountRepository } from "../../adapters/postgres/repositories/AccountRepository";
import { Service } from "./Service";
import { PaginationResult, SearchConfig } from "../../adapters/postgres/repositories/Repository";

export default class AccountService extends Service<TAccount | TAccountWithID> {
  declare repository: AccountRepository;

  constructor(repository: AccountRepository) {
    super(repository);
  }

  async findAll(
    page: number = 1,
    limit?: number,
    search?: SearchConfig[],
    filters?: Record<string, unknown>
  ): Promise<PaginationResult<TAccountWithID>> {
    return this.repository.getAll(page, limit, search, filters) as Promise<PaginationResult<TAccountWithID>>;
  }

  async getAllByCategory(categoryId?: number): Promise<TAccountWithID[]> {
    return this.repository.getAllByCategory(categoryId);
  }

  async createAccount(data: TAccountCreate): Promise<TAccountWithID> {
    // Check if account number already exists
    const existing = await this.repository.getAll(1, 1, undefined, { number: data.number });
    if (existing.data.length > 0) {
      throw new Error(`Akun dengan nomor ${data.number} sudah ada`);
    }

    return this.repository.create({
      ...data,
      balance: data.balance || 0,
      isActive: data.isActive ?? true,
    } as TAccount) as Promise<TAccountWithID>;
  }

  async updateAccount(id: string, data: Partial<TAccount>): Promise<TAccountWithID> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error(`Akun dengan ID ${id} tidak ditemukan`);
    }

    // If updating number, check for duplicates
    if (data.number && data.number !== existing.number) {
      const duplicate = await this.repository.getAll(1, 1, undefined, { number: data.number });
      if (duplicate.data.length > 0) {
        throw new Error(`Akun dengan nomor ${data.number} sudah ada`);
      }
    }

    return this.repository.update(id, data) as Promise<TAccountWithID>;
  }

  async deleteAccount(id: string): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error(`Akun dengan ID ${id} tidak ditemukan`);
    }

    // Check if account has transactions
    if (existing._count && existing._count.transactions > 0) {
      throw new Error(`Tidak dapat menghapus akun yang memiliki transaksi. Silakan nonaktifkan saja.`);
    }

    await this.repository.delete(id);
  }
}
