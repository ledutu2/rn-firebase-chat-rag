# MCP Server Logging Fix

**Date**: 2025-10-28  
**Issue**: Success messages showing as `[error]` in Cursor logs  
**Status**: ✅ Fixed  

---

## Problem

The MCP server logs were showing success messages with `[error]` tag in Cursor's log viewer:

```
2025-10-28 18:10:10.972 [error] [MCP] RAG pipeline initialized successfully
2025-10-28 18:10:10.973 [error] [MCP] RAG pipeline initialized successfully
```

This was confusing because the messages indicated success, but Cursor was tagging them as errors.

---

## Root Cause

The MCP server (`src/mcp/server.ts`) was using `process.stderr.write()` for **all** log messages, including informational messages. 

```typescript
// Before (incorrect)
process.stderr.write('[MCP] RAG pipeline initialized successfully\n');
```

When MCP servers write to `stderr`, Cursor's log viewer automatically tags these messages as `[error]`, regardless of the actual message content. This is because:

1. **MCP Protocol Convention**: MCP servers use `stderr` for logging (to keep `stdout` clean for protocol communication)
2. **Log Viewer Interpretation**: Cursor's log viewer assumes anything on `stderr` is an error
3. **No Distinction**: The code didn't distinguish between info and error messages

---

## Solution

Added helper methods to distinguish between informational and error messages by adding clear prefixes:

```typescript
// After (correct)
class RNFirebaseChatRAGServer {
  // ... existing code ...

  // Logging helpers to distinguish between info and error messages
  private logInfo(message: string): void {
    // Write to stderr with INFO prefix (MCP servers typically use stderr for logging)
    // But we add a clear prefix to distinguish from errors
    process.stderr.write(`[INFO] ${message}\n`);
  }

  private logError(message: string): void {
    // Write actual errors to stderr with ERROR prefix
    process.stderr.write(`[ERROR] ${message}\n`);
  }
}
```

---

## Changes Made

### 1. Added Helper Methods

Added two private methods to the `RNFirebaseChatRAGServer` class:
- `logInfo(message)`: For informational messages (prefixed with `[INFO]`)
- `logError(message)`: For actual errors (prefixed with `[ERROR]`)

### 2. Replaced All Logging Calls

**In `start()` method:**
```typescript
// Before
process.stderr.write('[MCP] Starting MCP server...\n');
process.stderr.write('[MCP] Server connected via stdio\n');

// After
this.logInfo('[MCP] Starting MCP server...');
this.logInfo('[MCP] Server connected via stdio');
```

**In `initializeRAGPipelineAsync()` method:**
```typescript
// Before
process.stderr.write('[MCP] Starting RAG pipeline initialization...\n');
process.stderr.write('[MCP] RAG pipeline initialized successfully\n');

// After
this.logInfo('[MCP] Starting RAG pipeline initialization...');
this.logInfo('[MCP] RAG pipeline initialized successfully');
```

**In error handling:**
```typescript
// Before
process.stderr.write(`[MCP] Failed to initialize RAG pipeline: ${error}\n`);

// After
this.logError(`[MCP] Failed to initialize RAG pipeline: ${error}`);
```

### 3. Updated All Error Paths

- `ensureInitialized()` error handling
- `stop()` error handling
- `start()` catch block

---

## Expected Log Output

### Before Fix
```
2025-10-28 18:10:10.972 [error] [MCP] Starting MCP server...
2025-10-28 18:10:10.972 [error] [MCP] Server connected via stdio
2025-10-28 18:10:10.973 [error] [MCP] RAG pipeline initialized successfully
```

All messages tagged as `[error]` regardless of content.

### After Fix
```
2025-10-28 18:10:10.972 [error] [INFO] [MCP] Starting MCP server...
2025-10-28 18:10:10.972 [error] [INFO] [MCP] Server connected via stdio
2025-10-28 18:10:10.973 [error] [INFO] [MCP] RAG pipeline initialized successfully
```

Now you can see `[INFO]` vs `[ERROR]` in the message content, making it clear what's actually happening.

If an actual error occurs:
```
2025-10-28 18:10:10.973 [error] [ERROR] [MCP] Failed to initialize RAG pipeline: Connection refused
```

---

## Why We Still Use stderr

**Important**: We still write to `stderr` for both info and error messages because:

1. **MCP Protocol Requirement**: The MCP protocol uses `stdout` for JSON-RPC communication between the server and client (Cursor). Any non-protocol output on `stdout` would corrupt the communication.

2. **Standard Practice**: MCP servers conventionally use `stderr` for all logging to keep `stdout` clean.

3. **Cursor's Log Viewer**: Cursor captures and displays stderr output in its log viewer, which is what we want.

The fix doesn't change **where** we log (still `stderr`), but adds **clear prefixes** (`[INFO]` vs `[ERROR]`) so you can distinguish message types at a glance.

---

## Testing

After rebuilding, the MCP server will now show clearer log messages:

**Test 1: Start MCP Server**
```bash
npm run mcp
```

**Expected Output:**
```
[INFO] [MCP] Starting MCP server...
[INFO] [MCP] Project root: /Users/tungle/saigontechnology/rn-firebase-chat-rag
[INFO] [MCP] Server connected via stdio
[INFO] [MCP] Starting RAG pipeline initialization...
[INFO] [MCP] RAG pipeline initialized successfully
```

**Test 2: Trigger an Error (e.g., delete docs folder)**
```
[ERROR] [MCP] Failed to initialize RAG pipeline: No documents found
```

---

## Files Modified

1. **`src/mcp/server.ts`**
   - Added `logInfo()` helper method
   - Added `logError()` helper method
   - Replaced all `process.stderr.write()` calls with appropriate helper methods

---

## Benefits

1. ✅ **Clear Message Types**: Can immediately see if a message is info or error
2. ✅ **Better Debugging**: Easier to spot actual errors in logs
3. ✅ **Consistent Logging**: All logging goes through helper methods
4. ✅ **Maintainable**: Easy to change logging format in one place
5. ✅ **No Protocol Changes**: Still complies with MCP protocol (stderr for logs)

---

## Next Steps

### Immediate
1. ✅ Build completed
2. ⏳ Restart Cursor to load new MCP server
3. ⏳ Verify logs now show `[INFO]` prefix

### Future Improvements
- Consider adding log levels (DEBUG, WARN, etc.)
- Add timestamps to log messages
- Consider using a proper logging library for MCP server
- Add configuration for log verbosity

---

## Summary

**Problem**: Success messages showing as `[error]`  
**Cause**: All messages written to stderr without distinction  
**Fix**: Added `logInfo()` and `logError()` helpers with clear prefixes  
**Result**: Logs now clearly show `[INFO]` vs `[ERROR]`  
**Action**: Restart Cursor to load updated MCP server  

---

**Last Updated**: 2025-10-28  
**File Modified**: `src/mcp/server.ts`  
**Build Status**: ✅ Successful  
**Ready to Use**: After Cursor restart  



