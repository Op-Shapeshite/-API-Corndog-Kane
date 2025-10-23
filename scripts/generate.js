#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const options = {};

// Parse options
for (let i = 1; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].substring(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    options[key] = value;
    if (value !== true) i++;
  }
}

// Utility functions
const toPascalCase = (str) => {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const toCamelCase = (str) => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const toSnakeCase = (str) => {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
};

const toKebabCase = (str) => {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const writeFile = (filePath, content) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  console.log(`✓ Created: ${filePath}`);
};

// Template generators
const generateEntityTypes = (name, fields = []) => {
  const pascalName = toPascalCase(name);
  
  // Generate enum imports if needed
  const enumFields = fields.filter(f => f.isEnum);
  const enumImports = enumFields.length > 0 
    ? `import { ${enumFields.map(f => f.type).join(', ')} } from "@prisma/client";\n\n`
    : '';
  
  // Generate field list for main type
  const typeFields = fields.length > 0 
    ? fields.map(f => `  ${f.name}: ${f.type};`).join('\n')
    : '  // Add your fields here';
  
  return `${enumImports}export type T${pascalName} = {
  id: string;
${typeFields}
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type T${pascalName}Create = Omit<T${pascalName}, "id" | "createdAt" | "updatedAt">;

export type T${pascalName}CreateRequest = Omit<T${pascalName}, "id" | "createdAt" | "updatedAt" | "isActive"> & {
  is_active?: boolean;
};

export type T${pascalName}UpdateRequest = Partial<T${pascalName}CreateRequest>;

export type T${pascalName}GetResponse = Omit<T${pascalName}, "isActive" | "createdAt" | "updatedAt"> & {
  is_active: boolean;
};
`;
};

const generateValidationSchema = (name, fields = []) => {
  const pascalName = toPascalCase(name);
  
  // Generate zod field validations
  const zodFields = fields.filter(f => !['id', 'createdAt', 'updatedAt'].includes(f.name));
  const createFields = zodFields.map(f => {
    const snakeName = toSnakeCase(f.name);
    let zodType = 'string()';
    
    if (f.zodType === 'number') zodType = 'number()';
    else if (f.zodType === 'boolean') zodType = 'boolean()';
    else if (f.zodType === 'date') zodType = 'coerce.date()';
    else if (f.isEnum) zodType = `nativeEnum(${f.type})`;
    
    return `    ${snakeName}: z.${zodType}${f.optional ? '.optional()' : ''},`;
  }).join('\n');
  
  // Generate enum imports if needed
  const enumFields = fields.filter(f => f.isEnum);
  const enumImports = enumFields.length > 0 
    ? `import { ${enumFields.map(f => f.type).join(', ')} } from "@prisma/client";\n`
    : '';
  
  return `import z from "zod";
${enumImports}
export const create${pascalName}Schema = z.object({
  body: z.object({
${createFields || '    // Add your validation fields here'}
    is_active: z.boolean().optional(),
  }),
});

export const update${pascalName}Schema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
${createFields || '    // Add your validation fields here'}
    is_active: z.boolean().optional(),
  }).partial(),
});

export const delete${pascalName}Schema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const get${pascalName}Schema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
`;
};

const generateResponseMapper = (name, fields = []) => {
  const pascalName = toPascalCase(name);
  
  // Generate field mappings (camelCase to snake_case)
  const fieldMappings = fields.filter(f => !['id'].includes(f.name)).map(f => {
    const snakeName = toSnakeCase(f.name);
    if (snakeName === f.name) {
      return `    ${snakeName}: ${name.toLowerCase()}.${f.name},`;
    }
    return `    ${snakeName}: ${name.toLowerCase()}.${f.name},`;
  }).join('\n');
  
  return `import { T${pascalName}, T${pascalName}GetResponse } from "../../core/entities/${name.toLowerCase()}/${name.toLowerCase()}";

export class ${pascalName}ResponseMapper {
  static toListResponse(${name.toLowerCase()}: T${pascalName}): T${pascalName}GetResponse {
    return {
      id: ${name.toLowerCase()}.id,
${fieldMappings}
      is_active: ${name.toLowerCase()}.isActive,
    };
  }
}
`;
};

const generateRepository = (name) => {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  
  return `import { T${pascalName}, T${pascalName}Create, T${pascalName}Update } from "../../../core/entities/${camelName}/${camelName}";
import { ${pascalName}Repository as I${pascalName}Repository } from "../../../core/repositories/${camelName}";
import Repository from "./Repository";

export default class ${pascalName}Repository
  extends Repository<T${pascalName}>
  implements I${pascalName}Repository {
  constructor() {
    super("${camelName}");
  }

  async findById(id: number): Promise<T${pascalName} | null> {
    const ${camelName} = await this.getModel().findUnique({
      where: { id },
    });
    if (!${camelName}) return null;
    
    return this.mapper.mapToEntity(${camelName}) as T${pascalName};
  }

  override async create(item: T${pascalName}Create): Promise<T${pascalName}> {
    const ${camelName} = await this.prisma.${camelName}.create({
      data: {
        // Map your fields here following snake_case for DB
        // Example: name: item.name,
        // created_at: item.createdAt,
        ...item as any, // TODO: Map fields properly
      },
    });

    return this.mapper.mapToEntity(${camelName}) as T${pascalName};
  }

  override async update(id: string, item: T${pascalName}Update): Promise<T${pascalName}> {
    const ${camelName} = await this.prisma.${camelName}.update({
      where: { id: parseInt(id) },
      data: {
        // Map your fields here following snake_case for DB
        ...item as any, // TODO: Map fields properly
      },
    });

    return this.mapper.mapToEntity(${camelName}) as T${pascalName};
  }

  async delete(id: string): Promise<T${pascalName}> {
    const ${camelName} = await this.prisma.${camelName}.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() },
    });

    return this.mapper.mapToEntity(${camelName}) as T${pascalName};
  }

  // Add custom repository methods here
}
`;
};

const generateService = (name) => {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  
  return `import { T${pascalName}, T${pascalName}Create, T${pascalName}Update } from "../entities/${camelName}/${camelName}";
import ${pascalName}Repository from "../../adapters/postgres/repositories/${pascalName}Repository";
import { Service } from "./Service";

export default class ${pascalName}Service extends Service<T${pascalName}> {
  declare repository: ${pascalName}Repository;

  constructor(repository: ${pascalName}Repository) {
    super(repository);
  }

  async create${pascalName}(item: T${pascalName}Create): Promise<T${pascalName}> {
    // Add business logic validation here
    return await this.repository.create(item);
  }

  async update${pascalName}(id: string, item: T${pascalName}Update): Promise<T${pascalName}> {
    // Add business logic validation here
    const existing = await this.repository.findById(parseInt(id));
    if (!existing) {
      throw new Error("${pascalName} not found");
    }
    return await this.repository.update(id, item);
  }

  async delete${pascalName}(id: string): Promise<T${pascalName}> {
    const existing = await this.repository.findById(parseInt(id));
    if (!existing) {
      throw new Error("${pascalName} not found");
    }
    return await this.repository.delete(id);
  }

  // Inherited methods from Service<T>:
  // - findById(id: string): Promise<T | null>
  // - findAll(page, limit, search, filters, orderBy): Promise<PaginationResult<T>>
  
  // Add custom business logic methods here
}
`;
};

const generateController = (name) => {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  
  return `import { Request, Response } from "express";
import { TMetadataResponse } from "../../../core/entities/base/response";
import {
  T${pascalName},
  T${pascalName}CreateRequest,
  T${pascalName}GetResponse,
  T${pascalName}UpdateRequest,
} from "../../../core/entities/${camelName}/${camelName}";
import ${pascalName}Service from "../../../core/services/${pascalName}Service";
import Controller from "./Controller";
import { ServiceFactory } from "../../../core/factories/ServiceFactory";
import { EventEmitter } from "../../../core/events/EventEmitter";
import { Events } from "../../../core/events/EventTypes";

/**
 * ${pascalName}Controller - Demonstrates all design patterns
 * - Factory Pattern: ServiceFactory for service creation
 * - Chain of Responsibility: Error handling in base Controller
 * - Strategy Pattern: Validation strategies for entity existence
 * - Observer Pattern: Event emission for business events
 * - Specification Pattern: Available for complex queries
 * - Builder Pattern: Available for complex object creation
 * - Dependency Injection: Can use Container instead of Factory
 */
export class ${pascalName}Controller extends Controller<T${pascalName}GetResponse, TMetadataResponse> {
  private ${camelName}Service: ${pascalName}Service;

  constructor() {
    super();
    // Using Factory Pattern
    this.${camelName}Service = ServiceFactory.get${pascalName}Service();
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data: T${pascalName}CreateRequest = req.body;
      
      const ${camelName} = await this.${camelName}Service.create${pascalName}(data);

      // Using Observer Pattern - emit creation event
      await EventEmitter.emit(Events.${toSnakeCase(name).toUpperCase()}_CREATED, {
        ${camelName},
        timestamp: new Date(),
      });

      return this.getSuccessResponse(
        res,
        {
          data: ${camelName} as T${pascalName}GetResponse,
          metadata: {} as TMetadataResponse,
        },
        "${pascalName} created successfully",
        201
      );
    } catch (error) {
      return this.handleError(res, error, "${pascalName} creation failed");
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      
      const ${camelName} = await this.${camelName}Service.findById(id);
      
      if (!${camelName}) {
        return this.getFailureResponse(
          res,
          { data: {} as T${pascalName}GetResponse, metadata: {} as TMetadataResponse },
          [{ field: "id", type: "not_found", message: "${pascalName} not found" }],
          "${pascalName} not found",
          404
        );
      }

      return this.getSuccessResponse(
        res,
        {
          data: ${camelName} as T${pascalName}GetResponse,
          metadata: {} as TMetadataResponse,
        },
        "${pascalName} retrieved successfully"
      );
    } catch (error) {
      return this.handleError(res, error, "${pascalName} retrieval failed");
    }
  };

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.${camelName}Service.findAll(
        page,
        limit,
        search ? [{ field: 'name', value: search }] : undefined
      );

      return this.getSuccessResponse(
        res,
        {
          data: result.data as unknown as T${pascalName}GetResponse,
          metadata: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          } as TMetadataResponse,
        },
        "${pascalName}s retrieved successfully"
      );
    } catch (error) {
      return this.handleError(res, error, "${pascalName}s retrieval failed");
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const data: T${pascalName}UpdateRequest = req.body;

      const ${camelName} = await this.${camelName}Service.update${pascalName}(id, data);

      // Using Observer Pattern - emit update event
      await EventEmitter.emit(Events.${toSnakeCase(name).toUpperCase()}_UPDATED, {
        ${camelName},
        timestamp: new Date(),
      });

      return this.getSuccessResponse(
        res,
        {
          data: ${camelName} as T${pascalName}GetResponse,
          metadata: {} as TMetadataResponse,
        },
        "${pascalName} updated successfully"
      );
    } catch (error) {
      return this.handleError(res, error, "${pascalName} update failed");
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const ${camelName} = await this.${camelName}Service.delete${pascalName}(id);

      // Using Observer Pattern - emit deletion event
      await EventEmitter.emit(Events.${toSnakeCase(name).toUpperCase()}_DELETED, {
        ${camelName},
        timestamp: new Date(),
      });

      return this.getSuccessResponse(
        res,
        {
          data: ${camelName} as T${pascalName}GetResponse,
          metadata: {} as TMetadataResponse,
        },
        "${pascalName} deleted successfully"
      );
    } catch (error) {
      return this.handleError(res, error, "${pascalName} deletion failed");
    }
  };
}
`;
};

const generateRouter = (name) => {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const kebabName = toKebabCase(name);
  
  return `import { Router } from "express";
import { ${pascalName}Controller } from "../../controllers/${pascalName}Controller";

const ${camelName}Router = Router();
const ${camelName}Controller = new ${pascalName}Controller();

/**
 * @route   POST /api/v1/${kebabName}
 * @desc    Create a new ${camelName}
 * @access  Private (add authentication middleware)
 */
${camelName}Router.post("/", ${camelName}Controller.create);

/**
 * @route   GET /api/v1/${kebabName}
 * @desc    Get all ${camelName}s
 * @access  Private (add authentication middleware)
 */
${camelName}Router.get("/", ${camelName}Controller.findAll);

/**
 * @route   GET /api/v1/${kebabName}/:id
 * @desc    Get ${camelName} by ID
 * @access  Private (add authentication middleware)
 */
${camelName}Router.get("/:id", ${camelName}Controller.findById);

/**
 * @route   PUT /api/v1/${kebabName}/:id
 * @desc    Update ${camelName}
 * @access  Private (add authentication middleware)
 */
${camelName}Router.put("/:id", ${camelName}Controller.update);

/**
 * @route   DELETE /api/v1/${kebabName}/:id
 * @desc    Delete ${camelName}
 * @access  Private (add authentication middleware)
 */
${camelName}Router.delete("/:id", ${camelName}Controller.delete);

export default ${camelName}Router;
`;
};

const generateBuilder = (name) => {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  
  return `import { T${pascalName}Create } from "../entities/${camelName}/${camelName}";

/**
 * Builder Pattern for ${pascalName}
 * Provides a fluent interface for creating ${pascalName} objects
 */
export class ${pascalName}Builder {
  private ${camelName}: Partial<T${pascalName}Create> = {};

  // Add your builder methods here
  // Example:
  // withName(name: string): ${pascalName}Builder {
  //   this.${camelName}.name = name;
  //   return this;
  // }

  withCreatedAt(createdAt: Date): ${pascalName}Builder {
    this.${camelName}.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): ${pascalName}Builder {
    this.${camelName}.updatedAt = updatedAt;
    return this;
  }

  build(): T${pascalName}Create {
    // Add validation here
    if (!this.${camelName}) {
      throw new Error("${pascalName} data is required");
    }

    return this.${camelName} as T${pascalName}Create;
  }

  reset(): ${pascalName}Builder {
    this.${camelName} = {};
    return this;
  }
}
`;
};

const generateSpecification = (name) => {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  
  return `import { Prisma } from "@prisma/client";
import { BaseSpecification } from "./Specification";

/**
 * Specification Pattern for ${pascalName} queries
 */

export class Active${pascalName}Specification extends BaseSpecification<Prisma.${camelName}WhereInput> {
  isSatisfiedBy(candidate: Prisma.${camelName}WhereInput): boolean {
    return candidate.deleted_at === null;
  }

  toPrismaQuery(): Prisma.${camelName}WhereInput {
    return { deleted_at: null };
  }
}

// Add more specifications as needed
// Example:
// export class ${pascalName}ByNameSpecification extends BaseSpecification<Prisma.${camelName}WhereInput> {
//   constructor(private name: string) {
//     super();
//   }
//
//   isSatisfiedBy(candidate: Prisma.${camelName}WhereInput): boolean {
//     return candidate.name === this.name;
//   }
//
//   toPrismaQuery(): Prisma.${camelName}WhereInput {
//     return { name: this.name };
//   }
// }
`;
};

const generateValidationStrategy = (name) => {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  
  return `import { ValidationStrategy, ValidationResult } from "./ValidationStrategy";
import { ServiceFactory } from "../factories/ServiceFactory";

/**
 * Validation Strategy for ${pascalName} existence
 */
export class ${pascalName}ExistsValidationStrategy implements ValidationStrategy<{ ${camelName}Id: number }> {
  async validate(data: { ${camelName}Id: number }): Promise<ValidationResult> {
    const ${camelName}Service = ServiceFactory.get${pascalName}Service();
    const ${camelName} = await ${camelName}Service.findById(data.${camelName}Id.toString());

    if (!${camelName}) {
      return {
        isValid: false,
        errors: [
          {
            field: "${camelName}Id",
            type: "not_found",
            message: "${pascalName} not found",
          },
        ],
      };
    }

    return { isValid: true, errors: [] };
  }
}
`;
};

const generateRepositoryInterface = (name) => {
  const pascalName = toPascalCase(name);
  
  return `import { T${pascalName} } from "../entities/${toCamelCase(name)}/${toCamelCase(name)}";

export interface I${pascalName}Repository {
  findById(id: number): Promise<T${pascalName} | null>;
  // Add custom repository interface methods here
}
`;
};

// Parse Prisma schema to extract model definition
const parsePrismaSchema = (modelName) => {
  const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Error: prisma/schema.prisma not found');
    return null;
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const camelModelName = toCamelCase(modelName);
  
  // Extract all enum names from schema
  const enumRegex = /enum\s+(\w+)\s*{/g;
  const enums = [];
  let enumMatch;
  while ((enumMatch = enumRegex.exec(schemaContent)) !== null) {
    enums.push(enumMatch[1]);
  }
  
  // Find the model definition
  const modelRegex = new RegExp(`model\\s+${camelModelName}\\s*{([^}]+)}`, 'i');
  const match = schemaContent.match(modelRegex);
  
  if (!match) {
    console.error(`❌ Error: Model "${camelModelName}" not found in Prisma schema`);
    return null;
  }

  const modelBody = match[1];
  const lines = modelBody.split('\n').filter(line => line.trim() && !line.trim().startsWith('@@'));
  
  const fields = [];
  const relations = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('//')) continue;
    
    // Parse field definition
    const fieldMatch = trimmed.match(/^(\w+)\s+(\w+)(\[\])?(\?)?/);
    if (!fieldMatch) continue;
    
    const [, fieldName, fieldType, isArray, isOptional] = fieldMatch;
    
    // Prisma primitive types
    const primitiveTypes = ['String', 'Int', 'Float', 'Decimal', 'Boolean', 'DateTime', 'Json', 'Bytes', 'BigInt'];
    
    // Check if it's a relation field (not enum, not primitive type)
    const isRelation = trimmed.includes('@relation') || 
                      (fieldType.match(/^[A-Z]/) && 
                       !primitiveTypes.includes(fieldType) && 
                       !enums.includes(fieldType));
    
    if (isRelation) {
      relations.push({
        name: fieldName,
        type: fieldType,
        isArray: !!isArray,
        isOptional: !!isOptional
      });
    } else {
      // Map Prisma types to TypeScript/Zod types
      let tsType = 'string';
      let zodType = 'z.string()';
      
      switch (fieldType) {
        case 'Int':
          tsType = 'number';
          zodType = 'z.number()';
          break;
        case 'Float':
        case 'Decimal':
          tsType = 'number';
          zodType = 'z.number()';
          break;
        case 'Boolean':
          tsType = 'boolean';
          zodType = 'z.boolean()';
          break;
        case 'DateTime':
          tsType = 'Date';
          zodType = 'z.date()';
          break;
        case 'String':
          tsType = 'string';
          zodType = 'z.string()';
          break;
        case 'Json':
          tsType = 'any';
          zodType = 'z.any()';
          break;
        default:
          // Check if it's an enum
          if (fieldType.match(/^[A-Z]/)) {
            tsType = fieldType;
            zodType = `z.nativeEnum(${fieldType})`;
          }
      }
      
      fields.push({
        name: fieldName,
        prismaType: fieldType,
        tsType,
        zodType,
        isOptional: !!isOptional,
        isArray: !!isArray,
        hasDefault: trimmed.includes('@default')
      });
    }
  }
  
  return { fields, relations };
};

// Generate entity types from Prisma schema
const generateEntityTypesFromSchema = (name, schemaData) => {
  const pascalName = toPascalCase(name);
  const { fields } = schemaData;
  
  // System fields to exclude from type fields
  const systemFields = ['id', 'createdAt', 'updatedAt', 'deletedAt', 'created_at', 'updated_at', 'deleted_at', 'isActive', 'is_active'];
  
  // Check if any fields use enums
  const usedEnums = new Set();
  fields.forEach(f => {
    if (f.isEnum) {
      usedEnums.add(f.type);
    }
  });
  
  const enumImports = usedEnums.size > 0 
    ? `import { ${Array.from(usedEnums).join(', ')} } from "@prisma/client";\n\n`
    : '';
  
  // Generate main type fields (camelCase)
  const typeFields = fields
    .filter(f => !systemFields.includes(f.name))
    .map(f => `  ${f.name}: ${f.type};`)
    .join('\n');

  return `${enumImports}export type T${pascalName} = {
  id: string;
${typeFields}
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type T${pascalName}Create = Omit<T${pascalName}, "id" | "createdAt" | "updatedAt">;

export type T${pascalName}CreateRequest = Omit<T${pascalName}, "id" | "createdAt" | "updatedAt" | "isActive"> & {
  is_active?: boolean;
};

export type T${pascalName}UpdateRequest = Partial<T${pascalName}CreateRequest>;

export type T${pascalName}GetResponse = Omit<T${pascalName}, "isActive" | "createdAt" | "updatedAt"> & {
  is_active: boolean;
};
`;
};

const generateValidationSchemaFromPrisma = (name, schemaData) => {
  const pascalName = toPascalCase(name);
  const { fields } = schemaData;
  
  // System fields to exclude from validation
  const systemFields = ['id', 'createdAt', 'updatedAt', 'deletedAt', 'created_at', 'updated_at', 'deleted_at', 'isActive', 'is_active'];
  
  // Check if any fields use enums
  const usedEnums = new Set();
  fields.forEach(f => {
    if (f.isEnum) {
      usedEnums.add(f.type);
    }
  });
  
  const enumImports = usedEnums.size > 0 
    ? `import { ${Array.from(usedEnums).join(', ')} } from "@prisma/client";\n`
    : '';
  
  // Generate zod field validations (snake_case for API)
  const createFields = fields
    .filter(f => !systemFields.includes(f.name))
    .map(f => {
      const snakeName = toSnakeCase(f.name);
      let zodDef = f.zodType;
      if (f.isOptional || f.hasDefault) zodDef += '.optional()';
      return `    ${snakeName}: ${zodDef},`;
    })
    .join('\n');

  return `import z from "zod";
${enumImports}
export const create${pascalName}Schema = z.object({
  body: z.object({
${createFields || '    // Add your validation fields here'}
    is_active: z.boolean().optional(),
  }),
});

export const update${pascalName}Schema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
${createFields || '    // Add your validation fields here'}
    is_active: z.boolean().optional(),
  }).partial(),
});

export const delete${pascalName}Schema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const get${pascalName}Schema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
`;
};

const generateResponseMapperFromPrisma = (name, schemaData) => {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const { fields } = schemaData;
  
  // System fields to exclude (except id)
  const systemFields = ['createdAt', 'updatedAt', 'deletedAt', 'created_at', 'updated_at', 'deleted_at', 'isActive', 'is_active'];
  
  // Generate field mappings (camelCase to snake_case)
  const fieldMappings = fields
    .filter(f => !systemFields.includes(f.name))
    .map(f => {
      const snakeName = toSnakeCase(f.name);
      return `      ${snakeName}: ${camelName}.${f.name},`;
    })
    .join('\n');
  
  return `import { T${pascalName}, T${pascalName}GetResponse } from "../../core/entities/${camelName}/${camelName}";

export class ${pascalName}ResponseMapper {
  static toListResponse(${camelName}: T${pascalName}): T${pascalName}GetResponse {
    return {
      id: ${camelName}.id,
${fieldMappings}
      is_active: ${camelName}.isActive,
    };
  }
}
`;
};

const generatePrismaModel = (name, fields = []) => {
  const camelName = toCamelCase(name);
  const tableName = toSnakeCase(name);
  
  return `
model ${camelName} {
  id         Int       @id @default(autoincrement())
${fields.length > 0 ? fields.map(f => `  ${f.name}      ${f.prismaType || 'String'}${f.optional ? '?' : ''}`).join('\n') : '  // Add your fields here'}
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  @@map("${tableName}")
}
`;
};

// Command handlers
const createResource = (name) => {
  if (!name) {
    console.error('❌ Error: Resource name is required');
    console.log('Usage: npm run create:resource -- --name <resourceName>');
    process.exit(1);
  }

  console.log(`\n🚀 Creating resource: ${name}\n`);

  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const kebabName = toKebabCase(name);

  // 1. Create entity types
  writeFile(
    `src/core/entities/${camelName}/${camelName}.ts`,
    generateEntityTypes(name)
  );

  // 2. Create repository interface
  writeFile(
    `src/core/repositories/${camelName}.ts`,
    generateRepositoryInterface(name)
  );

  // 3. Create repository implementation
  writeFile(
    `src/adapters/postgres/repositories/${pascalName}Repository.ts`,
    generateRepository(name)
  );

  // 4. Create service
  writeFile(
    `src/core/services/${pascalName}Service.ts`,
    generateService(name)
  );

  // 4. Create controller
  writeFile(
    `src/transports/api/controllers/${pascalName}Controller.ts`,
    generateController(name)
  );

  // 5. Create router
  writeFile(
    `src/transports/api/routers/v1/${camelName}.ts`,
    generateRouter(name)
  );

  // 6. Create validation schema
  writeFile(
    `src/transports/api/validations/${camelName}.validation.ts`,
    generateValidationSchema(name)
  );

  // 7. Create response mapper
  writeFile(
    `src/mappers/response-mappers/${pascalName}ResponseMapper.ts`,
    generateResponseMapper(name)
  );

  // 8. Create builder
  writeFile(
    `src/core/builders/${pascalName}Builder.ts`,
    generateBuilder(name)
  );

  // 9. Create specifications
  writeFile(
    `src/core/specifications/${pascalName}Specifications.ts`,
    generateSpecification(name)
  );

  // 10. Create validation strategy
  writeFile(
    `src/core/strategies/${pascalName}ValidationStrategies.ts`,
    generateValidationStrategy(name)
  );

  // 11. Print Prisma model template
  console.log('\n📝 Add this to your Prisma schema:\n');
  console.log(generatePrismaModel(name));

  // 12. Print manual steps
  console.log('\n📋 Manual steps required:\n');
  console.log(`1. Add the Prisma model above to prisma/master.prisma (or appropriate schema file)`);
  console.log(`2. Run: npx prisma generate`);
  console.log(`3. Run: npx prisma db push (or create a migration)`);
  console.log(`4. Update src/core/factories/RepositoryFactory.ts:`);
  console.log(`   - Import ${pascalName}Repository`);
  console.log(`   - Add get${pascalName}Repository() method`);
  console.log(`5. Update src/core/factories/ServiceFactory.ts:`);
  console.log(`   - Import ${pascalName}Service`);
  console.log(`   - Add get${pascalName}Service() method`);
  console.log(`6. Update src/core/di/bindings.ts:`);
  console.log(`   - Register ${pascalName}Repository and ${pascalName}Service`);
  console.log(`7. Update src/transports/api/routers/v1/index.ts:`);
  console.log(`   - Import ${camelName}Router from './${camelName}'`);
  console.log(`   - Add router.use('/${kebabName}s', ${camelName}Router)`);
  console.log(`8. Update src/core/events/EventTypes.ts:`);
  console.log(`   - Add ${toSnakeCase(name).toUpperCase()}_CREATED, _UPDATED, _DELETED events`);
  console.log(`9. Update src/core/repositories/index.ts:`);
  console.log(`   - Export ${pascalName}Repository`);
  console.log(`10. Update src/core/services/index.ts:`);
  console.log(`    - Export ${pascalName}Service`);
  console.log(`11. Update src/transports/api/controllers/index.ts:`);
  console.log(`    - Export ${pascalName}Controller`);

  console.log('\n✨ Resource scaffolding complete!\n');
};

const createEndpoint = (name, resource) => {
  if (!name || !resource) {
    console.error('❌ Error: Endpoint name and resource are required');
    console.log('Usage: npm run create:endpoint -- --name <endpointName> --resource <resourceName>');
    process.exit(1);
  }

  console.log(`\n🚀 Creating endpoint: ${name} for resource: ${resource}\n`);

  const pascalResource = toPascalCase(resource);
  const camelResource = toCamelCase(resource);
  const methodName = toCamelCase(name);
  const kebabName = toKebabCase(name);

  const endpointCode = `
  ${methodName} = async (req: Request, res: Response): Promise<Response> => {
    try {
      // TODO: Implement ${name} endpoint logic
      const { id } = req.params;
      
      // Add your business logic here
      
      return this.getSuccessResponse(
        res,
        {
          data: {} as T${pascalResource}GetResponse,
          metadata: {} as TMetadataResponse,
        },
        "${name} executed successfully"
      );
    } catch (error) {
      return this.handleError(res, error, "${name} failed");
    }
  };
`;

  const routeCode = `
/**
 * @route   POST /api/${camelResource}/:id/${kebabName}
 * @desc    ${name}
 * @access  Private
 */
${camelResource}Router.post("/:id/${kebabName}", ${camelResource}Controller.${methodName});
`;

  console.log('📝 Add this method to your controller:\n');
  console.log(endpointCode);
  console.log('\n📝 Add this route to your router:\n');
  console.log(routeCode);
  console.log('\n✨ Endpoint template generated!\n');
};

const createPrismaModel = (name, fields) => {
  if (!name) {
    console.error('❌ Error: Model name is required');
    console.log('Usage: npm run create:model -- --name <modelName> --fields "name:String,age:Int,email:String?"');
    process.exit(1);
  }

  console.log(`\n🚀 Creating Prisma model: ${name}\n`);

  let parsedFields = [];
  if (fields) {
    parsedFields = fields.split(',').map(field => {
      const [fieldName, fieldType] = field.trim().split(':');
      const optional = fieldType.endsWith('?');
      const cleanType = optional ? fieldType.slice(0, -1) : fieldType;
      
      return {
        name: fieldName,
        prismaType: cleanType,
        type: cleanType.toLowerCase(),
        optional
      };
    });
  }

  console.log(generatePrismaModel(name, parsedFields));
  console.log('\n✨ Prisma model template generated!\n');
};

const createResourceFromSchema = (schemaName) => {
  if (!schemaName) {
    console.error('❌ Error: Schema name is required');
    console.log('Usage: npm run create:resource -- --schema <SchemaName>');
    process.exit(1);
  }

  console.log(`\n🚀 Generating resource from Prisma schema: ${schemaName}\n`);

  // Parse Prisma schema
  const schemaData = parsePrismaSchema(schemaName);
  if (!schemaData) {
    process.exit(1);
  }

  const pascalName = toPascalCase(schemaName);
  const camelName = toCamelCase(schemaName);
  const kebabName = toKebabCase(schemaName);

  console.log(`📊 Found ${schemaData.fields.length} fields and ${schemaData.relations.length} relations\n`);

  // 1. Create entity types from schema
  writeFile(
    `src/core/entities/${camelName}/${camelName}.ts`,
    generateEntityTypesFromSchema(schemaName, schemaData)
  );

  // 2. Create repository interface
  writeFile(
    `src/core/repositories/${camelName}.ts`,
    generateRepositoryInterface(schemaName)
  );

  // 3. Create repository implementation
  writeFile(
    `src/adapters/postgres/repositories/${pascalName}Repository.ts`,
    generateRepository(schemaName)
  );

  // 4. Create service
  writeFile(
    `src/core/services/${pascalName}Service.ts`,
    generateService(schemaName)
  );

  // 5. Create controller
  writeFile(
    `src/transports/api/controllers/${pascalName}Controller.ts`,
    generateController(schemaName)
  );

  // 6. Create router
  writeFile(
    `src/transports/api/routers/v1/${camelName}.ts`,
    generateRouter(schemaName)
  );

  // 7. Create validation schema from parsed schema
  writeFile(
    `src/transports/api/validations/${camelName}.validation.ts`,
    generateValidationSchemaFromPrisma(schemaName, schemaData)
  );

  // 8. Create response mapper from parsed schema
  writeFile(
    `src/mappers/response-mappers/${pascalName}ResponseMapper.ts`,
    generateResponseMapperFromPrisma(schemaName, schemaData)
  );

  // 9. Create builder
  writeFile(
    `src/core/builders/${pascalName}Builder.ts`,
    generateBuilder(schemaName)
  );

  // 10. Create specifications
  writeFile(
    `src/core/specifications/${pascalName}Specifications.ts`,
    generateSpecification(schemaName)
  );

  // 11. Create validation strategy
  writeFile(
    `src/core/strategies/${pascalName}ValidationStrategies.ts`,
    generateValidationStrategy(schemaName)
  );

  // 12. Print manual steps
  console.log('\n📋 Manual steps required:\n');
  console.log(`1. Update src/core/factories/RepositoryFactory.ts:`);
  console.log(`   - Import ${pascalName}Repository`);
  console.log(`   - Add get${pascalName}Repository() method`);
  console.log(`2. Update src/core/factories/ServiceFactory.ts:`);
  console.log(`   - Import ${pascalName}Service`);
  console.log(`   - Add get${pascalName}Service() method`);
  console.log(`3. Update src/core/di/bindings.ts:`);
  console.log(`   - Register ${pascalName}Repository and ${pascalName}Service`);
  console.log(`4. Update src/transports/api/routers/v1/index.ts:`);
  console.log(`   - Import ${camelName}Router from './${camelName}'`);
  console.log(`   - Add router.use('/${kebabName}s', ${camelName}Router)`);
  console.log(`5. Update src/core/events/EventTypes.ts:`);
  console.log(`   - Add ${toSnakeCase(schemaName).toUpperCase()}_CREATED, _UPDATED, _DELETED events`);
  console.log(`6. Update src/core/repositories/index.ts:`);
  console.log(`   - Export ${pascalName}Repository`);
  console.log(`7. Update src/core/services/index.ts:`);
  console.log(`   - Export ${pascalName}Service`);
  console.log(`8. Update src/transports/api/controllers/index.ts:`);
  console.log(`   - Export ${pascalName}Controller`);

  console.log('\n✨ Resource generation from schema complete!\n');
};

const showHelp = () => {
  console.log(`
🛠️  Resource Generator CLI

Available Commands:

  create:resource    Create a complete resource with all layers
                     Usage: npm run create:resource -- --name <name>
                     Example: npm run create:resource -- --name product
                     
                     Creates:
                     - Entity types (Zod schemas & TypeScript types)
                     - Repository (database layer)
                     - Service (business logic)
                     - Controller (API handlers)
                     - Router (API routes)
                     - Builder (object construction)
                     - Specifications (query logic)
                     - Validation strategies

  create:resource    Generate resource from existing Prisma model (NEW!)
  --schema           Usage: npm run create:resource -- --schema <ModelName>
                     Example: npm run create:resource -- --schema Product
                     
                     Reads your Prisma schema and generates:
                     - Entity types based on actual model fields
                     - All layers (repository, service, controller, etc.)
                     - No need to manually define types!

  create:endpoint    Create a new endpoint for existing resource
                     Usage: npm run create:endpoint -- --name <name> --resource <resource>
                     Example: npm run create:endpoint -- --name activate --resource product

  create:model       Generate Prisma model template
                     Usage: npm run create:model -- --name <name> --fields "<fields>"
                     Example: npm run create:model -- --name product --fields "name:String,price:Float,stock:Int?"

  help              Show this help message

Examples:

  # Create a complete product resource (manual definition)
  npm run create:resource -- --name product

  # Generate resource from existing Prisma Product model (automatic!)
  npm run create:resource -- --schema Product

  # Create a new endpoint for activating a product
  npm run create:endpoint -- --name activate --resource product

  # Generate Prisma model with fields
  npm run create:model -- --name product --fields "name:String,price:Float,inStock:Boolean"
`);
};

// Main command router
switch (command) {
  case 'create:resource':
    if (options.schema) {
      createResourceFromSchema(options.schema);
    } else {
      createResource(options.name);
    }
    break;
  case 'create:endpoint':
    createEndpoint(options.name, options.resource);
    break;
  case 'create:model':
    createPrismaModel(options.name, options.fields);
    break;
  case 'help':
  default:
    showHelp();
    break;
}
