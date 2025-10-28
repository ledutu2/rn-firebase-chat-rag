#!/bin/bash

echo "🔧 Reinitializing RAG Database..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Step 1: Remove corrupted database
echo "1️⃣ Removing corrupted database..."
rm -rf data/lancedb/documents.lance
echo "   ✅ Database removed"
echo ""

# Step 2: Rebuild TypeScript
echo "2️⃣ Building project..."
npm run build
echo "   ✅ Build complete"
echo ""

# Step 3: Initialize the database by running the server briefly
echo "3️⃣ Initializing new database..."
echo "   Starting initialization (this will take a few seconds)..."
timeout 10s node dist/index.js 2>&1 | grep -E "(Initializing|initialized|Loading|documents)" || {
    # If timeout command doesn't exist (macOS), use a different approach
    node dist/index.js &
    PID=$!
    sleep 10
    kill $PID 2>/dev/null
    wait $PID 2>/dev/null
}
echo "   ✅ Database initialized"
echo ""

# Step 4: Verify database
echo "4️⃣ Verifying database..."
if [ -d "data/lancedb/documents.lance" ]; then
    FILE_COUNT=$(ls -1 data/lancedb/documents.lance/data/*.lance 2>/dev/null | wc -l)
    echo "   ✅ Database created with $FILE_COUNT data file(s)"
else
    echo "   ❌ Database directory not created"
    exit 1
fi
echo ""

# Step 5: Kill any running MCP servers
echo "5️⃣ Cleaning up old MCP server processes..."
pkill -f "dist/mcp/server.js" 2>/dev/null
echo "   ✅ Cleanup complete"
echo ""

echo "✨ Reinitialization complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Restart Cursor completely (Cmd+Q, then reopen)"
echo "   2. Wait for MCP server to auto-start"
echo "   3. Test by asking: 'How does Firebase authentication work?'"
echo ""

