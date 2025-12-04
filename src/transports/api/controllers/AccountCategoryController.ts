import { Request, Response } from 'express';
import { TMetadataResponse } from "../../../core/entities/base/response";
import { TAccountCategoryGetResponse } from "../../../core/entities/finance/account";
import AccountCategoryService from '../../../core/services/AccountCategoryService';
import { AccountCategoryRepository } from "../../../adapters/postgres/repositories/AccountCategoryRepository";
import Controller from "./Controller";
import { AccountCategoryResponseMapper } from "../../../mappers/response-mappers/AccountCategoryResponseMapper";

export class AccountCategoryController extends Controller<TAccountCategoryGetResponse, TMetadataResponse> {
  private accountCategoryService: AccountCategoryService;

  constructor() {
    super();
    this.accountCategoryService = new AccountCategoryService(new AccountCategoryRepository());
  }

  // Enhanced getAll with proper search field mapping
  getAll = () => {
    return this.findAllWithSearch(this.accountCategoryService, AccountCategoryResponseMapper, 'account_category');
  }
}
