# Vercel MCP Server - Usage Examples

This guide shows practical examples of using your deployed MCP server on Vercel.

## 🌐 Your Deployment URL

After deploying to Vercel, your MCP server will be available at:
```
https://your-project-name.vercel.app/api/mcp
```

Replace `your-project-name` with your actual Vercel project name.

## 🔧 Configuration Examples

### Cursor Configuration

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "rn-firebase-chat-vercel": {
      "url": "https://your-project-name.vercel.app/api/mcp"
    }
  }
}
```

### Claude Desktop Configuration

Add to Claude Desktop settings:

```json
{
  "mcpServers": {
    "rn-firebase-chat-vercel": {
      "url": "https://your-project-name.vercel.app/api/mcp",
      "transport": "http"
    }
  }
}
```

## 💬 Query Examples in Cursor/Claude

After configuring your MCP client, you can ask questions naturally. The AI will automatically use the MCP tools to retrieve relevant documentation.

### Example 1: Installation Questions

**You ask:**
```
How do I install rn-firebase-chat in my React Native project?
```

**What happens:**
1. AI calls `retrieve_context` with query: "install rn-firebase-chat"
2. MCP server returns relevant installation documentation
3. AI synthesizes the answer from the retrieved context

**Expected response:**
```
To install rn-firebase-chat in your React Native project:

1. Install the package:
   npm install rn-firebase-chat

2. Install peer dependencies:
   npm install @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/storage

3. For iOS, install pods:
   cd ios && pod install

[Additional setup steps from documentation...]
```

### Example 2: Configuration Questions

**You ask:**
```
How do I configure Firebase for the chat feature?
```

**What happens:**
1. AI calls `retrieve_context` with query: "configure Firebase chat"
2. Returns Firebase setup documentation
3. AI provides step-by-step configuration

**Expected response:**
```
To configure Firebase for chat:

1. Create a Firebase project in the Firebase Console
2. Add your app (iOS/Android/Web)
3. Download configuration files (google-services.json / GoogleService-Info.plist)
4. Set up Firestore database
5. Configure security rules:
   [Security rules from documentation...]
```

### Example 3: Implementation Questions

**You ask:**
```
Show me how to implement a group chat with rn-firebase-chat
```

**What happens:**
1. AI calls `retrieve_context` with query: "implement group chat"
2. Returns group chat implementation documentation
3. AI provides code examples and explanation

**Expected response:**
```typescript
To implement group chat with rn-firebase-chat:

1. Import the ChatProvider:
import { ChatProvider } from 'rn-firebase-chat';

2. Set up the provider with multiple participants:
<ChatProvider
  customConversationInfo={{
    participants: ['user1Id', 'user2Id', 'user3Id'],
    conversationType: 'group',
    groupName: 'My Group Chat'
  }}
>
  {/* Your chat components */}
</ChatProvider>

[Additional implementation details...]
```

### Example 4: Troubleshooting Questions

**You ask:**
```
Why are my messages not showing up in real-time?
```

**What happens:**
1. AI calls `retrieve_context` with query: "messages not showing real-time"
2. Returns troubleshooting documentation
3. AI provides debugging steps

**Expected response:**
```
If messages aren't showing up in real-time, check:

1. Firestore listeners are properly set up
2. Firebase rules allow read access
3. Network connectivity is stable
4. ChatProvider is correctly configured

[Detailed troubleshooting steps from documentation...]
```

### Example 5: Feature Questions

**You ask:**
```
Does rn-firebase-chat support message encryption?
```

**What happens:**
1. AI calls `retrieve_context` with query: "message encryption"
2. Returns encryption feature documentation
3. AI explains the feature

**Expected response:**
```
Yes, rn-firebase-chat supports message encryption. To enable it:

<ChatProvider
  enableEncryption={true}
  encryptionKey="your-encryption-key"
>
  {/* Your chat components */}
</ChatProvider>

[Additional encryption details...]
```

## 🧪 Testing with MCP Inspector

### Start Inspector

```bash
npx @modelcontextprotocol/inspector@latest https://your-project-name.vercel.app
```

### Test Queries

1. **Open Inspector**: http://127.0.0.1:6274
2. **Select Transport**: "Streamable HTTP"
3. **Enter URL**: `https://your-project-name.vercel.app/api/mcp`
4. **Click Connect**

### Example Test Cases

#### Test 1: retrieve_context
```json
{
  "question": "How to install rn-firebase-chat?",
  "limit": 5
}
```

**Expected Result:**
- Returns 5 relevant documentation chunks
- Each with content, metadata, and relevance score
- Sorted by relevance

#### Test 2: search_by_metadata
```json
{
  "filters": {
    "section": "Installation"
  },
  "limit": 10
}
```

**Expected Result:**
- Returns documentation chunks from Installation section
- Up to 10 results
- Filtered by exact metadata match

#### Test 3: get_stats
```json
{}
```

**Expected Result:**
```json
{
  "documentCount": 36,
  "isInitialized": true,
  "configuration": {
    "embeddingModel": "Xenova/bge-base-en-v1.5",
    "model": "llama3",
    "topKResults": 5,
    "chunkSize": 1000,
    "chunkOverlap": 200
  }
}
```

## 🔗 Direct HTTP Requests

### Using cURL

#### Test Endpoint Availability
```bash
curl https://your-project-name.vercel.app/api/mcp
```

**Expected Response:**
```json
{
  "name": "rn-firebase-chat",
  "version": "1.0.0",
  "capabilities": {
    "tools": {}
  }
}
```

#### Test OAuth Metadata
```bash
curl https://your-project-name.vercel.app/.well-known/oauth-protected-resource
```

**Expected Response:**
```json
{
  "resource": "https://your-project-name.vercel.app/api/mcp",
  "authorization_servers": [
    "https://example-authorization-server-issuer.com"
  ]
}
```

### Using JavaScript/TypeScript

```typescript
// Example: Call MCP server from your app
const mcpServerUrl = 'https://your-project-name.vercel.app/api/mcp';

async function queryDocumentation(question: string) {
  const response = await fetch(mcpServerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method: 'tools/call',
      params: {
        name: 'retrieve_context',
        arguments: {
          question,
          limit: 5
        }
      }
    })
  });
  
  const data = await response.json();
  return data;
}

// Usage
const results = await queryDocumentation('How to install rn-firebase-chat?');
console.log(results);
```

### Using Python

```python
import requests
import json

mcp_server_url = 'https://your-project-name.vercel.app/api/mcp'

def query_documentation(question: str, limit: int = 5):
    payload = {
        'method': 'tools/call',
        'params': {
            'name': 'retrieve_context',
            'arguments': {
                'question': question,
                'limit': limit
            }
        }
    }
    
    response = requests.post(
        mcp_server_url,
        headers={'Content-Type': 'application/json'},
        data=json.dumps(payload)
    )
    
    return response.json()

# Usage
results = query_documentation('How to install rn-firebase-chat?')
print(json.dumps(results, indent=2))
```

## 📊 Monitoring Usage

### Check Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View metrics:
   - Function invocations
   - Response times
   - Error rates
   - Bandwidth usage

### View Function Logs

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# View logs
vercel logs your-project-name

# Follow logs in real-time
vercel logs your-project-name --follow
```

### Example Log Output

```
[INFO] RAG pipeline initialized successfully
[INFO] Retrieved 5 chunks for query: "How to install rn-firebase-chat?"
[INFO] Tool call: retrieve_context completed in 1.2s
```

## 🎯 Best Practices

### 1. Query Formulation

**Good queries:**
- "How to install rn-firebase-chat?"
- "Configure Firebase for chat"
- "Implement group chat feature"
- "Troubleshoot message delivery issues"

**Less effective queries:**
- "chat" (too vague)
- "help" (not specific)
- Single words without context

### 2. Using Metadata Filters

When you know the specific section:
```json
{
  "filters": {
    "section": "Installation"
  }
}
```

When you know the filename:
```json
{
  "filters": {
    "filename": "rn-firebase-chat-doc.md"
  }
}
```

### 3. Adjusting Result Limits

- **Quick answers**: `limit: 3`
- **Detailed information**: `limit: 10`
- **Comprehensive research**: `limit: 20`

## 🔐 Secure Usage (with OAuth)

If you've configured OAuth authorization:

### 1. Obtain Token

```bash
# Get token from your auth provider
TOKEN="your-oauth-token"
```

### 2. Make Authorized Request

```bash
curl https://your-project-name.vercel.app/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "retrieve_context",
      "arguments": {
        "question": "How to install rn-firebase-chat?"
      }
    }
  }'
```

### 3. Configure MCP Client with Auth

```json
{
  "mcpServers": {
    "rn-firebase-chat-vercel": {
      "url": "https://your-project-name.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer your-oauth-token"
      }
    }
  }
}
```

## 🆘 Troubleshooting Examples

### Issue: Slow First Response

**Symptom:** First query takes 10+ seconds

**Explanation:** Cold start - RAG pipeline initializing

**Solution:** This is normal. Subsequent requests will be fast (< 2s)

### Issue: Empty Results

**Symptom:** Query returns no results

**Possible causes:**
1. Documentation not indexed
2. Query too specific
3. Database not deployed

**Debug steps:**
```bash
# Check stats
curl https://your-project-name.vercel.app/api/mcp \
  -d '{"method": "tools/call", "params": {"name": "get_stats"}}'

# Try broader query
# Instead of: "rn-firebase-chat installation on iOS 17"
# Try: "install rn-firebase-chat"
```

### Issue: Connection Timeout

**Symptom:** Request times out after 30 seconds

**Solution:** Increase `maxDuration` in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

## 📚 Additional Resources

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Quick Start Guide](./VERCEL_QUICK_START.md)
- [Deployment Checklist](./VERCEL_DEPLOYMENT_CHECKLIST.md)
- [Main README](./README.md)

---

**Happy querying! 🚀**

