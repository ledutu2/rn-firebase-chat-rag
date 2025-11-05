#!/bin/bash

# Test Vercel MCP Server Locally
# This script helps you test the Vercel deployment locally before deploying

echo "🧪 Testing Vercel MCP Server Locally"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before testing."
    exit 1
fi

echo "✅ Build successful!"
echo ""

echo "🚀 Starting Vercel dev server..."
echo "   The MCP server will be available at:"
echo "   http://localhost:3000/api/mcp"
echo ""
echo "📝 To test with MCP Inspector:"
echo "   npx @modelcontextprotocol/inspector@latest http://localhost:3000"
echo ""
echo "   Then in the inspector:"
echo "   1. Select 'Streamable HTTP'"
echo "   2. Enter URL: http://localhost:3000/api/mcp"
echo "   3. Click 'Connect'"
echo "   4. Test the tools"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run Vercel dev server
vercel dev

