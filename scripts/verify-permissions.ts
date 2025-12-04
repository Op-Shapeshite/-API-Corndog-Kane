#!/usr/bin/env ts-node
/**
 * Permission Verification Script for CI/CD
 * 
 * Verifies that:
 * 1. All endpoints have permission protection
 * 2. All permissions used in routers are defined in permissions.json
 * 3. All role-permission mappings reference valid permissions
 * 4. No duplicate permission codes
 * 5. All routers follow consistent permission patterns
 * 
 * Usage:
 *   npx ts-node scripts/verify-permissions.ts
 *   npm run verify:permissions (if added to package.json)
 * 
 * Exit codes:
 *   0 - All verifications passed
 *   1 - One or more verification failures
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  passed: boolean;
  category: string;
  message: string;
  details?: any;
}

interface PermissionData {
  permissions: Array<{
    name: string;
    code: string;
    module: string;
    description: string;
  }>;
  rolePermissions: {
    [roleName: string]: string[] | 'ALL';
  };
}

const ROUTER_DIR = path.join(__dirname, '../src/transports/api/routers/v1');
const PERMISSIONS_JSON = path.join(__dirname, '../prisma/seed/permissions.json');

/**
 * Load permissions from JSON file
 */
function loadPermissionsJson(): PermissionData {
  const content = fs.readFileSync(PERMISSIONS_JSON, 'utf-8');
  return JSON.parse(content);
}

/**
 * Extract all permission codes used in router files
 */
function extractRouterPermissions(): Map<string, Set<string>> {
  const routerPermissions = new Map<string, Set<string>>();
  
  const files = fs.readdirSync(ROUTER_DIR)
    .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
  
  for (const file of files) {
    const filePath = path.join(ROUTER_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const permSet = new Set<string>();
    
    // Extract permission codes from permissionMiddleware calls
    const permRegex = /permissionMiddleware\s*\(\s*\[\s*([^\]]+)\s*\]\s*\)/g;
    let match;
    
    while ((match = permRegex.exec(content)) !== null) {
      const permStr = match[1];
      const permMatches = permStr.match(/['"`]([^'"`]+)['"`]/g);
      
      if (permMatches) {
        permMatches.forEach(p => {
          const code = p.replace(/['"`]/g, '');
          permSet.add(code);
        });
      }
    }
    
    routerPermissions.set(file, permSet);
  }
  
  return routerPermissions;
}

/**
 * Extract all endpoints from router files
 */
function extractAllEndpoints(): Array<{ file: string; method: string; path: string; hasPermission: boolean; line: number }> {
  const endpoints: Array<{ file: string; method: string; path: string; hasPermission: boolean; line: number }> = [];
  
  const files = fs.readdirSync(ROUTER_DIR)
    .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
  
  for (const file of files) {
    const filePath = path.join(ROUTER_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/i;
      const match = line.match(routeRegex);
      
      if (match) {
        // Check if permissionMiddleware is present in the current or next few lines
        let hasPermission = false;
        for (let i = index; i < Math.min(index + 5, lines.length); i++) {
          if (lines[i].includes('permissionMiddleware')) {
            hasPermission = true;
            break;
          }
        }
        
        endpoints.push({
          file,
          method: match[1].toUpperCase(),
          path: match[2],
          hasPermission,
          line: index + 1
        });
      }
    });
  }
  
  return endpoints;
}

/**
 * Verification 1: Check all endpoints have permission protection
 */
async function verifyAllEndpointsProtected(): Promise<VerificationResult> {
  const endpoints = extractAllEndpoints();
  const unprotected = endpoints.filter(ep => !ep.hasPermission);
  
  // Exclude known public endpoints (e.g., auth.ts login/register)
  const publicEndpoints = ['auth.ts'];
  const filteredUnprotected = unprotected.filter(ep => !publicEndpoints.includes(ep.file));
  
  if (filteredUnprotected.length === 0) {
    return {
      passed: true,
      category: 'Endpoint Protection',
      message: `✅ All ${endpoints.length} endpoints are protected with permissions`
    };
  }
  
  return {
    passed: false,
    category: 'Endpoint Protection',
    message: `❌ Found ${filteredUnprotected.length} unprotected endpoints`,
    details: filteredUnprotected.map(ep => `${ep.file} - ${ep.method} ${ep.path} (line ${ep.line})`)
  };
}

/**
 * Verification 2: Check all router permissions are defined in JSON
 */
function verifyRouterPermissionsExist(): VerificationResult {
  const permData = loadPermissionsJson();
  const definedPermissions = new Set(permData.permissions.map(p => p.code));
  const routerPermissions = extractRouterPermissions();
  
  const undefinedPerms: string[] = [];
  
  for (const [file, perms] of routerPermissions) {
    for (const perm of perms) {
      if (!definedPermissions.has(perm)) {
        undefinedPerms.push(`${file}: ${perm}`);
      }
    }
  }
  
  if (undefinedPerms.length === 0) {
    const totalUsed = Array.from(routerPermissions.values()).reduce((sum, set) => sum + set.size, 0);
    return {
      passed: true,
      category: 'Permission Definitions',
      message: `✅ All router permissions (${totalUsed} usages) are defined in permissions.json`
    };
  }
  
  return {
    passed: false,
    category: 'Permission Definitions',
    message: `❌ Found ${undefinedPerms.length} undefined permissions in routers`,
    details: undefinedPerms
  };
}

/**
 * Verification 3: Check role permissions reference valid permission codes
 */
function verifyRolePermissions(): VerificationResult {
  const permData = loadPermissionsJson();
  const definedPermissions = new Set(permData.permissions.map(p => p.code));
  
  const invalidMappings: string[] = [];
  
  for (const [roleName, perms] of Object.entries(permData.rolePermissions)) {
    if (perms === 'ALL') continue;
    
    for (const perm of perms) {
      if (!definedPermissions.has(perm)) {
        invalidMappings.push(`${roleName}: ${perm}`);
      }
    }
  }
  
  if (invalidMappings.length === 0) {
    return {
      passed: true,
      category: 'Role Permissions',
      message: `✅ All role-permission mappings reference valid permissions`
    };
  }
  
  return {
    passed: false,
    category: 'Role Permissions',
    message: `❌ Found ${invalidMappings.length} invalid role-permission mappings`,
    details: invalidMappings
  };
}

/**
 * Verification 4: Check for duplicate permission codes
 */
function verifyNoDuplicatePermissions(): VerificationResult {
  const permData = loadPermissionsJson();
  const codes = permData.permissions.map(p => p.code);
  const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
  
  if (duplicates.length === 0) {
    return {
      passed: true,
      category: 'Duplicate Check',
      message: `✅ No duplicate permission codes found (${codes.length} unique permissions)`
    };
  }
  
  return {
    passed: false,
    category: 'Duplicate Check',
    message: `❌ Found ${duplicates.length} duplicate permission codes`,
    details: [...new Set(duplicates)]
  };
}

/**
 * Verification 5: Check database permissions match JSON
 */
async function verifyDatabasePermissions(): Promise<VerificationResult> {
  try {
    const permData = loadPermissionsJson();
    const jsonCodes = new Set(permData.permissions.map(p => p.code));
    
    const dbPermissions = await prisma.permission.findMany({
      select: { code: true }
    });
    const dbCodes = new Set(dbPermissions.map(p => p.code));
    
    // Check for permissions in JSON but not in DB
    const missingInDb = Array.from(jsonCodes).filter(code => !dbCodes.has(code));
    
    // Check for permissions in DB but not in JSON
    const extraInDb = Array.from(dbCodes).filter(code => !jsonCodes.has(code));
    
    const issues: string[] = [];
    if (missingInDb.length > 0) {
      issues.push(`Missing in database: ${missingInDb.join(', ')}`);
    }
    if (extraInDb.length > 0) {
      issues.push(`Extra in database (not in JSON): ${extraInDb.join(', ')}`);
    }
    
    if (issues.length === 0) {
      return {
        passed: true,
        category: 'Database Sync',
        message: `✅ Database permissions (${dbCodes.size}) match JSON definitions (${jsonCodes.size})`
      };
    }
    
    return {
      passed: false,
      category: 'Database Sync',
      message: `❌ Database and JSON permissions are out of sync`,
      details: issues
    };
  } catch (error) {
    return {
      passed: false,
      category: 'Database Sync',
      message: `⚠ Could not verify database permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: ['Run permission seeder to sync database']
    };
  }
}

/**
 * Verification 6: Check all routers use consistent patterns
 */
function verifyConsistentPatterns(): VerificationResult {
  const routerPermissions = extractRouterPermissions();
  const issues: string[] = [];
  
  for (const [file, perms] of routerPermissions) {
    // Check if router has endpoints but no permissions (excluding auth.ts)
    if (perms.size === 0 && file !== 'auth.ts') {
      issues.push(`${file}: No permissions defined (may be unprotected)`);
    }
  }
  
  if (issues.length === 0) {
    return {
      passed: true,
      category: 'Pattern Consistency',
      message: `✅ All routers follow consistent permission patterns`
    };
  }
  
  return {
    passed: false,
    category: 'Pattern Consistency',
    message: `❌ Found ${issues.length} pattern inconsistencies`,
    details: issues
  };
}

/**
 * Verification 7: Check permission naming conventions
 */
function verifyNamingConventions(): VerificationResult {
  const permData = loadPermissionsJson();
  const issues: string[] = [];
  
  // Check convention: module:resource:action or module:resource:action:scope
  const conventionRegex = /^[a-z-]+:[a-z-]+:[a-z-]+(?::[a-z-]+)?$/;
  
  for (const perm of permData.permissions) {
    if (!conventionRegex.test(perm.code)) {
      issues.push(`${perm.code}: Does not follow naming convention`);
    }
  }
  
  if (issues.length === 0) {
    return {
      passed: true,
      category: 'Naming Conventions',
      message: `✅ All permissions follow naming conventions`
    };
  }
  
  return {
    passed: false,
    category: 'Naming Conventions',
    message: `❌ Found ${issues.length} permissions with incorrect naming`,
    details: issues.slice(0, 10) // Show first 10
  };
}

/**
 * Main verification runner
 */
async function runAllVerifications(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 PERMISSION VERIFICATION FOR CI/CD');
  console.log('='.repeat(70));
  console.log(`Started at: ${new Date().toLocaleString()}\n`);
  
  const results: VerificationResult[] = [];
  
  // Run all verifications
  console.log('Running verifications...\n');
  
  results.push(await verifyAllEndpointsProtected());
  results.push(verifyRouterPermissionsExist());
  results.push(verifyRolePermissions());
  results.push(verifyNoDuplicatePermissions());
  results.push(await verifyDatabasePermissions());
  results.push(verifyConsistentPatterns());
  results.push(verifyNamingConventions());
  
  // Print results
  console.log('📊 Verification Results:');
  console.log('-'.repeat(70));
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.category}`);
    console.log(`   ${result.message}`);
    
    if (result.details && result.details.length > 0) {
      console.log(`   Details:`);
      const displayDetails = Array.isArray(result.details) 
        ? result.details.slice(0, 10) 
        : [result.details];
      
      displayDetails.forEach((detail: string) => {
        console.log(`      - ${detail}`);
      });
      
      if (Array.isArray(result.details) && result.details.length > 10) {
        console.log(`      ... and ${result.details.length - 10} more`);
      }
    }
  });
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log('\n' + '='.repeat(70));
  console.log('📈 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Verifications: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(70));
  
  if (failed === 0) {
    console.log('\n🎉 All verifications passed! Permission system is healthy.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some verifications failed. Please fix the issues above.\n');
    process.exit(1);
  }
}

// Run verifications
if (require.main === module) {
  runAllVerifications()
    .catch(error => {
      console.error('\n💥 Verification script failed:', error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

export {
  verifyAllEndpointsProtected,
  verifyRouterPermissionsExist,
  verifyRolePermissions,
  verifyNoDuplicatePermissions,
  verifyDatabasePermissions,
  verifyConsistentPatterns,
  verifyNamingConventions
};
