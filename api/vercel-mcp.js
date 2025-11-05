/**
 * Vercel API Route - MCP Server Handler
 * 
 * This file imports the compiled MCP handler from dist/api/vercel-mcp.js
 * Vercel expects API routes in the /api directory at the project root.
 */

// Import the compiled handler
export { GET, POST, DELETE } from '../dist/api/vercel-mcp.js';

