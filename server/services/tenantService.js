// Tenant Resolution Service
// Handles dynamic tenant resolution from subdomains and paths

const { db } = require('../database');
const { tenants } = require('../database');
const { eq, or } = require('drizzle-orm');

// In-memory cache for tenant lookups (for performance)
const tenantCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class TenantService {
  /**
   * Resolve tenant from HTTP request
   * Supports:
   * 1. Subdomain-based: acme.firelynx.com -> 'acme'
   * 2. Path-based: /tenant/acme/projects -> 'acme'  
   * 3. Header-based: X-Tenant-Slug: acme
   */
  static async resolveTenantFromRequest(req) {
    let tenantSlug = null;

    // Method 1: Extract from subdomain
    const host = req.get('host') || '';
    const subdomain = this.extractSubdomain(host);
    if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
      tenantSlug = subdomain;
    }

    // Method 2: Extract from path (/tenant/{slug}/...)
    if (!tenantSlug) {
      const pathMatch = req.path.match(/^\/tenant\/([^\/]+)/);
      if (pathMatch) {
        tenantSlug = pathMatch[1];
      }
    }

    // Method 3: Extract from header (useful for API clients)
    if (!tenantSlug) {
      tenantSlug = req.get('X-Tenant-Slug');
    }

    // Method 4: Fallback to default for development/testing
    if (!tenantSlug) {
      tenantSlug = 'default';
    }

    return await this.getTenantBySlug(tenantSlug);
  }

  /**
   * Extract subdomain from host header
   */
  static extractSubdomain(host) {
    if (!host) return null;
    
    // Remove port if present
    const hostname = host.split(':')[0];
    const parts = hostname.split('.');
    
    // For localhost development
    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
      return null;
    }
    
    // For production domains like acme.firelynx.com
    if (parts.length >= 3) {
      return parts[0];
    }
    
    return null;
  }

  /**
   * Get tenant by slug with caching
   */
  static async getTenantBySlug(slug) {
    if (!slug) {
      throw new Error('Tenant slug is required');
    }

    // Check cache first
    const cacheKey = `tenant:${slug}`;
    const cached = tenantCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.tenant;
    }

    try {
      // Query database for tenant by slug or subdomain
      const result = await db
        .select()
        .from(tenants)
        .where(or(eq(tenants.slug, slug), eq(tenants.subdomain, slug)))
        .limit(1);

      if (result.length === 0) {
        throw new Error(`Tenant not found: ${slug}`);
      }

      const tenant = result[0];

      // Verify tenant is active
      if (tenant.status !== 'active') {
        throw new Error(`Tenant is not active: ${slug} (status: ${tenant.status})`);
      }

      // Cache the result
      tenantCache.set(cacheKey, {
        tenant,
        timestamp: Date.now()
      });

      return tenant;

    } catch (error) {
      console.error(`Failed to resolve tenant '${slug}':`, error.message);
      throw error;
    }
  }

  /**
   * Clear tenant cache (useful for testing)
   */
  static clearCache(slug = null) {
    if (slug) {
      tenantCache.delete(`tenant:${slug}`);
    } else {
      tenantCache.clear();
    }
  }

  /**
   * Get all active tenants
   */
  static async getAllActiveTenants() {
    return await db
      .select()
      .from(tenants)
      .where(eq(tenants.status, 'active'))
      .orderBy(tenants.name);
  }
}

module.exports = TenantService;