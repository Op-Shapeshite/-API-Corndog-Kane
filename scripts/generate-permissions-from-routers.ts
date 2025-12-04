#!/usr/bin/env ts-node
/**
 * Permission Generator Script
 * 
 * Automatically scans all router files and extracts permission codes
 * from permissionMiddleware usage. Generates a complete permission map
 * showing which endpoints use which permissions.
 * 
 * Usage:
 *   npx ts-node scripts/generate-permissions-from-routers.ts
 *   npx ts-node scripts/generate-permissions-from-routers.ts --output permissions-generated.json
 */

import * as fs from 'fs';
import * as path from 'path';

interface EndpointPermission {
  file: string;
  method: string;
  path: string;
  permissions: string[];
  line: number;
}

interface RouterSummary {
  file: string;
  totalEndpoints: number;
  protectedEndpoints: number;
  unprotectedEndpoints: number;
  endpoints: EndpointPermission[];
}

interface GeneratedReport {
  generatedAt: string;
  totalRouters: number;
  totalEndpoints: number;
  totalProtectedEndpoints: number;
  totalUnprotectedEndpoints: number;
  uniquePermissions: string[];
  routers: RouterSummary[];
  allEndpoints: EndpointPermission[];
}

const ROUTER_DIR = path.join(__dirname, '../src/transports/api/routers/v1');

/**
 * Extract HTTP method and path from router line
 */
function extractRouteInfo(line: string): { method: string; path: string } | null {
  // Match: router.get('/path', ...)
  // Match: router.post('/path', ...)
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/i;
  const match = line.match(routeRegex);
  
  if (match) {
    return {
      method: match[1].toUpperCase(),
      path: match[2]
    };
  }
  
  return null;
}

/**
 * Extract permission codes from permissionMiddleware usage
 */
function extractPermissions(content: string, startLine: number): string[] {
  const lines = content.split('\n');
  const permissions: string[] = [];
  
  // Look for permissionMiddleware in the current and next few lines
  for (let i = startLine; i < Math.min(startLine + 5, lines.length); i++) {
    const line = lines[i];
    
    // Match: permissionMiddleware(['permission:code'])
    // Match: permissionMiddleware(['perm1', 'perm2'])
    const permRegex = /permissionMiddleware\s*\(\s*\[\s*([^\]]+)\s*\]\s*\)/;
    const match = line.match(permRegex);
    
    if (match) {
      // Extract all permission strings
      const permStr = match[1];
      const permMatches = permStr.match(/['"`]([^'"`]+)['"`]/g);
      
      if (permMatches) {
        permissions.push(...permMatches.map(p => p.replace(/['"`]/g, '')));
      }
      break;
    }
  }
  
  return permissions;
}

/**
 * Scan a single router file and extract all endpoints with their permissions
 */
function scanRouterFile(filePath: string): RouterSummary {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const endpoints: EndpointPermission[] = [];
  let protectedCount = 0;
  let unprotectedCount = 0;
  
  // Match router.METHOD('path', ...) and capture everything until the closing parenthesis
  // This pattern captures the full route definition including multiline middleware
  const routePattern = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*,[\s\S]*?\);/gi;
  
  let match;
  while ((match = routePattern.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const routePath = match[2];
    const fullRouteBlock = match[0];
    
    // Calculate line number
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
    
    // Extract permissions from the full route block
    // Remove newlines from the route block to make regex simpler
    const normalizedBlock = fullRouteBlock.replace(/\n/g, ' ');
    const permRegex = /permissionMiddleware\s*\(\s*\[\s*([^\]]+)\s*\]\s*\)/;
    const permMatch = normalizedBlock.match(permRegex);
    
    const permissions: string[] = [];
    if (permMatch) {
      const permStr = permMatch[1];
      // Extract all quoted strings as permission codes
      const permMatches = permStr.match(/['"`]([^'"`]+)['"`]/g);
      
      if (permMatches) {
        permissions.push(...permMatches.map(p => p.replace(/['"`]/g, '')));
      }
    }
    
    endpoints.push({
      file: fileName,
      method,
      path: routePath,
      permissions,
      line: lineNumber
    });
    
    if (permissions.length > 0) {
      protectedCount++;
    } else {
      unprotectedCount++;
    }
  }
  
  return {
    file: fileName,
    totalEndpoints: endpoints.length,
    protectedEndpoints: protectedCount,
    unprotectedEndpoints: unprotectedCount,
    endpoints
  };
}

/**
 * Scan all router files in the directory
 */
function scanAllRouters(): GeneratedReport {
  const files = fs.readdirSync(ROUTER_DIR)
    .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    .map(f => path.join(ROUTER_DIR, f));
  
  const routers: RouterSummary[] = [];
  const allEndpoints: EndpointPermission[] = [];
  const allPermissions = new Set<string>();
  
  let totalEndpoints = 0;
  let totalProtected = 0;
  let totalUnprotected = 0;
  
  for (const file of files) {
    const summary = scanRouterFile(file);
    routers.push(summary);
    allEndpoints.push(...summary.endpoints);
    
    totalEndpoints += summary.totalEndpoints;
    totalProtected += summary.protectedEndpoints;
    totalUnprotected += summary.unprotectedEndpoints;
    
    // Collect all unique permissions
    summary.endpoints.forEach(ep => {
      ep.permissions.forEach(p => allPermissions.add(p));
    });
  }
  
  return {
    generatedAt: new Date().toISOString(),
    totalRouters: routers.length,
    totalEndpoints,
    totalProtectedEndpoints: totalProtected,
    totalUnprotectedEndpoints: totalUnprotected,
    uniquePermissions: Array.from(allPermissions).sort(),
    routers: routers.sort((a, b) => a.file.localeCompare(b.file)),
    allEndpoints: allEndpoints.sort((a, b) => {
      if (a.file !== b.file) return a.file.localeCompare(b.file);
      return a.line - b.line;
    })
  };
}

/**
 * Print console report
 */
function printReport(report: GeneratedReport): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 PERMISSION GENERATION REPORT');
  console.log('='.repeat(70));
  console.log(`Generated at: ${new Date(report.generatedAt).toLocaleString()}`);
  console.log(`\n📁 Scanned Routers: ${report.totalRouters}`);
  console.log(`📍 Total Endpoints: ${report.totalEndpoints}`);
  console.log(`✅ Protected Endpoints: ${report.totalProtectedEndpoints} (${Math.round(report.totalProtectedEndpoints / report.totalEndpoints * 100)}%)`);
  console.log(`❌ Unprotected Endpoints: ${report.totalUnprotectedEndpoints}`);
  console.log(`🔑 Unique Permissions: ${report.uniquePermissions.length}\n`);
  
  console.log('📋 Per-Router Breakdown:');
  console.log('-'.repeat(70));
  
  report.routers.forEach(router => {
    const coverage = router.totalEndpoints > 0 
      ? Math.round(router.protectedEndpoints / router.totalEndpoints * 100) 
      : 0;
    
    console.log(`\n📄 ${router.file}`);
    console.log(`   Total: ${router.totalEndpoints} | Protected: ${router.protectedEndpoints} | Unprotected: ${router.unprotectedEndpoints} | Coverage: ${coverage}%`);
    
    if (router.unprotectedEndpoints > 0) {
      console.log(`   ⚠ Unprotected endpoints:`);
      router.endpoints
        .filter(ep => ep.permissions.length === 0)
        .forEach(ep => {
          console.log(`      - ${ep.method} ${ep.path} (line ${ep.line})`);
        });
    }
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('🔑 All Unique Permission Codes:');
  console.log('='.repeat(70));
  report.uniquePermissions.forEach((perm, i) => {
    console.log(`${String(i + 1).padStart(3, ' ')}. ${perm}`);
  });
  
  if (report.totalUnprotectedEndpoints > 0) {
    console.log('\n' + '⚠'.repeat(35));
    console.log(`⚠  WARNING: ${report.totalUnprotectedEndpoints} ENDPOINTS WITHOUT PERMISSION PROTECTION`);
    console.log('⚠'.repeat(35) + '\n');
  } else {
    console.log('\n' + '✅'.repeat(35));
    console.log('✅  ALL ENDPOINTS ARE PROTECTED!');
    console.log('✅'.repeat(35) + '\n');
  }
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);
  const outputFlag = args.indexOf('--output');
  const outputFile = outputFlag >= 0 ? args[outputFlag + 1] : null;
  
  console.log('🔍 Scanning router files for permissions...\n');
  
  const report = scanAllRouters();
  
  printReport(report);
  
  if (outputFile) {
    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n💾 Report saved to: ${outputPath}`);
  }
  
  // Exit with error code if there are unprotected endpoints
  if (report.totalUnprotectedEndpoints > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { scanAllRouters, scanRouterFile, GeneratedReport, EndpointPermission, RouterSummary };
