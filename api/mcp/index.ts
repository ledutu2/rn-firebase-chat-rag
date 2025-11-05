/**
 * Vercel API Route - MCP Handler
 * 
 * This file is required by Vercel (must be in /api directory).
 * It simply re-exports the actual handler from src/api/mcp-handler.ts
 * 
 * This allows you to:
 * - Keep the actual code in src/api/ for local testing
 * - Satisfy Vercel's requirement for API routes in /api directory
 */

export { GET, POST, DELETE } from '../../dist/api/mcp-handler.js';
