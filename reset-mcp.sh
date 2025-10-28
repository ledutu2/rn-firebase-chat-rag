#!/bin/bash

# Reset MCP Server Script
# This script will kill all running MCP servers, rebuild, and prepare for Cursor restart

echo "🔧 Resetting MCP Server for rn-firebase-chat..."
echo ""

# Step 1: Kill running MCP servers
echo "Step 1: Killing running MCP server processes..."
PIDS=$(ps aux | grep "dist/mcp/server.js" | grep -v grep | awk '{print $2}')
if [ -z "$PIDS" ]; then
  echo "  ✅ No running MCP server processes found"
else
  echo "  Found processes: $PIDS"
  echo "$PIDS" | xargs kill -9 2>/dev/null
  echo "  ✅ Killed MCP server processes"
fi
echo ""

# Step 2: Verify Cursor config
echo "Step 2: Verifying Cursor configuration..."
if command -v jq &> /dev/null; then
  SERVER_NAME=$(cat ~/.cursor/mcp.json 2>/dev/null | jq -r '.mcpServers | keys[]' | grep -E "rn-firebase-chat")
  if [ "$SERVER_NAME" = "rn-firebase-chat" ]; then
    echo "  ✅ Cursor config shows: rn-firebase-chat"
  else
    echo "  ⚠️  Warning: Expected 'rn-firebase-chat', found: $SERVER_NAME"
  fi
  
  # Check for old name
  OLD_NAME=$(cat ~/.cursor/mcp.json 2>/dev/null | jq -r '.mcpServers | keys[]' | grep "rn-firebase-chat-rag")
  if [ ! -z "$OLD_NAME" ]; then
    echo "  ⚠️  Warning: Old server name still exists: $OLD_NAME"
    echo "  Run: cat ~/.cursor/mcp.json | jq 'del(.mcpServers.\"rn-firebase-chat-rag\")' > ~/.cursor/mcp.json.tmp && mv ~/.cursor/mcp.json.tmp ~/.cursor/mcp.json"
  fi
else
  echo "  ℹ️  jq not installed, skipping JSON validation"
  echo "  Install with: brew install jq"
fi
echo ""

# Step 3: Rebuild
echo "Step 3: Rebuilding TypeScript..."
npm run build
if [ $? -eq 0 ]; then
  echo "  ✅ Build successful"
else
  echo "  ❌ Build failed!"
  exit 1
fi
echo ""

# Step 4: Verify build output
echo "Step 4: Verifying build output..."
if [ -f "dist/mcp/server.js" ]; then
  SIZE=$(ls -lh dist/mcp/server.js | awk '{print $5}')
  echo "  ✅ dist/mcp/server.js exists ($SIZE)"
else
  echo "  ❌ dist/mcp/server.js not found!"
  exit 1
fi
echo ""

# Step 5: Test MCP server
echo "Step 5: Testing MCP server..."
TEST_OUTPUT=$(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | MCP_SERVER=true node dist/mcp/server.js 2>&1)

if echo "$TEST_OUTPUT" | grep -q '"name":"rn-firebase-chat"'; then
  echo "  ✅ MCP server responds correctly"
  echo "  ✅ Server name: rn-firebase-chat"
else
  echo "  ⚠️  MCP server response unexpected"
  echo "  Output: $TEST_OUTPUT"
fi
echo ""

# Step 6: Check for Cursor process
echo "Step 6: Checking for Cursor process..."
CURSOR_PID=$(ps aux | grep -i "Cursor" | grep -v grep | head -1 | awk '{print $2}')
if [ -z "$CURSOR_PID" ]; then
  echo "  ✅ Cursor is not running"
else
  echo "  ⚠️  Cursor is still running (PID: $CURSOR_PID)"
  echo "  Please quit Cursor completely (Cmd+Q) before restarting"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Reset Complete!"
echo ""
echo "Next Steps:"
echo "1. If Cursor is running, quit it completely (Cmd+Q)"
echo "2. Wait 5 seconds"
echo "3. Open Cursor"
echo "4. Check MCP panel - should see only ONE 'rn-firebase-chat' server"
echo "5. Try using the MCP tools in a chat"
echo ""
echo "For troubleshooting, see: TROUBLESHOOTING.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

