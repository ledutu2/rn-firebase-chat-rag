#!/bin/bash

echo "🧪 Testing MCP Server Functionality"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# Test 1: Check if MCP server process is running
echo "Test 1: MCP Server Process"
echo "----------------------------"
if ps aux | grep -v grep | grep "dist/mcp/server.js" > /dev/null; then
    echo -e "${GREEN}✅ PASS${NC}: MCP server is running"
    PID=$(ps aux | grep -v grep | grep "dist/mcp/server.js" | awk '{print $2}' | head -1)
    echo "   PID: $PID"
else
    echo -e "${RED}❌ FAIL${NC}: MCP server is not running"
    echo "   ${YELLOW}Note:${NC} Cursor should start this automatically. Try restarting Cursor."
fi
echo ""

# Test 2: Check if database exists
echo "Test 2: Database Files"
echo "----------------------"
if [ -d "data/lancedb/documents.lance" ]; then
    FILE_COUNT=$(ls -1 data/lancedb/documents.lance/data/*.lance 2>/dev/null | wc -l | tr -d ' ')
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: Database exists with $FILE_COUNT data file(s)"
        
        # Show file details
        for file in data/lancedb/documents.lance/data/*.lance; do
            SIZE=$(ls -lh "$file" | awk '{print $5}')
            FILENAME=$(basename "$file")
            echo "   📄 $FILENAME ($SIZE)"
        done
    else
        echo -e "${RED}❌ FAIL${NC}: Database directory exists but no data files found"
        echo "   Run: ./reinit-database.sh"
    fi
else
    echo -e "${RED}❌ FAIL${NC}: Database directory does not exist"
    echo "   Run: ./reinit-database.sh"
fi
echo ""

# Test 3: Check if build is up to date
echo "Test 3: Build Status"
echo "--------------------"
if [ -f "dist/mcp/server.js" ]; then
    SRC_TIME=$(stat -f %m src/mcp/server.ts 2>/dev/null || stat -c %Y src/mcp/server.ts 2>/dev/null)
    DIST_TIME=$(stat -f %m dist/mcp/server.js 2>/dev/null || stat -c %Y dist/mcp/server.js 2>/dev/null)
    
    if [ "$DIST_TIME" -ge "$SRC_TIME" ]; then
        echo -e "${GREEN}✅ PASS${NC}: Build is up to date"
        echo "   dist/mcp/server.js: $(ls -lh dist/mcp/server.js | awk '{print $5}')"
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: Build may be outdated"
        echo "   Run: npm run build"
    fi
else
    echo -e "${RED}❌ FAIL${NC}: Build file not found"
    echo "   Run: npm run build"
fi
echo ""

# Test 4: Check MCP configuration
echo "Test 4: MCP Configuration"
echo "-------------------------"
if [ -f "$HOME/.cursor/mcp.json" ]; then
    if grep -q "rn-firebase-chat" "$HOME/.cursor/mcp.json"; then
        echo -e "${GREEN}✅ PASS${NC}: MCP server configured in ~/.cursor/mcp.json"
        echo "   Server name: rn-firebase-chat"
        
        # Show the config
        echo "   Config:"
        grep -A 8 "rn-firebase-chat" "$HOME/.cursor/mcp.json" | sed 's/^/      /'
    else
        echo -e "${RED}❌ FAIL${NC}: rn-firebase-chat not found in ~/.cursor/mcp.json"
    fi
else
    echo -e "${RED}❌ FAIL${NC}: ~/.cursor/mcp.json not found"
fi
echo ""

# Test 5: Check .cursorrules
echo "Test 5: Cursor Rules"
echo "--------------------"
if [ -f ".cursorrules" ]; then
    echo -e "${GREEN}✅ PASS${NC}: .cursorrules file exists"
    SIZE=$(ls -lh .cursorrules | awk '{print $5}')
    echo "   Size: $SIZE"
else
    echo -e "${YELLOW}⚠️  WARN${NC}: .cursorrules file not found"
    echo "   This file helps Cursor know when to use MCP tools"
fi
echo ""

# Test 6: Check documentation
echo "Test 6: Source Documentation"
echo "----------------------------"
if [ -f "docs/rn-firebase-chat-doc.md" ]; then
    SIZE=$(ls -lh docs/rn-firebase-chat-doc.md | awk '{print $5}')
    LINES=$(wc -l < docs/rn-firebase-chat-doc.md | tr -d ' ')
    echo -e "${GREEN}✅ PASS${NC}: Documentation exists"
    echo "   File: docs/rn-firebase-chat-doc.md"
    echo "   Size: $SIZE ($LINES lines)"
else
    echo -e "${RED}❌ FAIL${NC}: Documentation not found"
fi
echo ""

# Summary
echo "===================================="
echo "📊 Test Summary"
echo "===================================="
echo ""
echo "If all tests pass:"
echo "  1. Restart Cursor (Cmd+Q, then reopen)"
echo "  2. Start a new chat"
echo "  3. Ask: 'How does Firebase authentication work?'"
echo "  4. Cursor should automatically use the MCP tools"
echo ""
echo "If tests fail:"
echo "  - Run: ./reinit-database.sh"
echo "  - Run: npm run build"
echo "  - Restart Cursor"
echo ""
echo "For more help, see: MCP_TROUBLESHOOTING.md"
echo ""

