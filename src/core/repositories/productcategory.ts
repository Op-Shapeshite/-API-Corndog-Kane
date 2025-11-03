import { TCategory, TCategoryWithID } from "../entities/product/category";
import Repository from "./Repository";

export type ProductCategoryRepository = Repository<TCategory | TCategoryWithID>;

