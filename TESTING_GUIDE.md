# Testing Guide for Optimized RAG Documentation

**Purpose**: Verify that the new documentation provides better retrieval results  
**Status**: Ready for testing after Cursor restart  
**Database**: Reinitialized with 43 chunks  

---

## Quick Start

### 1. Restart Cursor

**IMPORTANT**: You must fully restart Cursor for the MCP server to connect to the new database.

```bash
# On macOS:
# 1. Press Cmd+Q to quit Cursor completely
# 2. Wait 5 seconds
# 3. Open Cursor again
# 4. Wait for MCP server to initialize (check MCP panel)
```

### 2. Verify MCP Connection

Check the MCP panel in Cursor:
- ✅ Should show: `rn-firebase-chat` (connected)
- ❌ If shows "Not connected": Run `./reset-mcp.sh`

### 3. Verify Database

Run this command to check the database:
```bash
cd /Users/tungle/saigontechnology/rn-firebase-chat-rag
npm start
```

Check logs for:
```
✅ Successfully indexed 43 documents
✅ RAG Pipeline initialized successfully
```

---

## Test Queries

### Priority 1: Installation Questions

#### Test 1.1: Basic Installation
**Query:**
```
How do I install rn-firebase-chat?
```

**Expected Results:**
- Top chunk should include npm/yarn installation commands
- Should show both React Native and Expo installations
- Should list all peer dependencies

**Success Criteria:**
- Relevance score: >0.7
- Contains: `npm install rn-firebase-chat`
- Contains: `@react-native-firebase/app`

---

#### Test 1.2: Expo Installation
**Query:**
```
How to install rn-firebase-chat in Expo?
```

**Expected Results:**
- Expo-specific installation commands
- Mention of `expo-build-properties`
- Reference to app.config.ts configuration

**Success Criteria:**
- Relevance score: >0.75
- Contains: `expo-build-properties`
- Contains: `react-native-vision-camera`

---

### Priority 2: Firebase Setup Questions

#### Test 2.1: Firestore Rules
**Query:**
```
What are the Firestore security rules for rn-firebase-chat?
```

**Expected Results:**
- Complete Firestore security rules code block
- Explanation of what the rules do
- Instructions on where to add them

**Success Criteria:**
- Relevance score: >0.8
- Contains: `rules_version = '2'`
- Contains: `match /users/{userId}`
- Contains: `match /conversations/{conversationId}`

---

#### Test 2.2: Storage Rules
**Query:**
```
How to configure Firebase Storage for chat media?
```

**Expected Results:**
- Firebase Storage security rules
- Explanation of `/chat_media/{userId}/` path
- Instructions for publishing rules

**Success Criteria:**
- Relevance score: >0.75
- Contains: `firebase.storage`
- Contains: `/chat_media/{userId}/`

---

#### Test 2.3: Complete Firebase Setup
**Query:**
```
How do I set up Firebase for rn-firebase-chat?
```

**Expected Results:**
- Multi-step Firebase setup guide
- Instructions for creating Firebase project
- Enabling Firestore and Storage

**Success Criteria:**
- Relevance score: >0.7
- Contains: "Step 1" or "Create Firebase Project"
- Contains: "GoogleService-Info.plist" or "google-services.json"

---

### Priority 3: Usage Questions

#### Test 3.1: ChatProvider
**Query:**
```
How to use ChatProvider?
```

**Expected Results:**
- Code example showing ChatProvider wrapping app
- Explanation of userInfo prop
- List of available props

**Success Criteria:**
- Relevance score: >0.8
- Contains: `<ChatProvider userInfo={userInfo}>`
- Contains: `id`, `name`, `avatar`

---

#### Test 3.2: One-on-One Chat
**Query:**
```
How to create a one-on-one chat screen?
```

**Expected Results:**
- ChatScreen component example
- memberIds and partners props explanation
- Important note about not including current user

**Success Criteria:**
- Relevance score: >0.75
- Contains: `<ChatScreen`
- Contains: `memberIds={[partnerInfo.id]}`
- Warning about not including current user ID

---

#### Test 3.3: Group Chat
**Query:**
```
How to implement group chat?
```

**Expected Results:**
- Group chat code example
- customConversationInfo prop
- Multiple memberIds

**Success Criteria:**
- Relevance score: >0.75
- Contains: `customConversationInfo`
- Contains: `isGroup: true`
- Contains multiple member IDs in array

---

### Priority 4: Advanced Features

#### Test 4.1: Encryption
**Query:**
```
How to enable message encryption?
```

**Expected Results:**
- ChatProvider with encryption props
- encryptKey and enableEncrypt example
- Security warnings about key management

**Success Criteria:**
- Relevance score: >0.75
- Contains: `enableEncrypt={true}`
- Contains: `encryptKey=`
- Mentions security considerations

---

#### Test 4.2: Camera Integration
**Query:**
```
How to add camera support to chat?
```

**Expected Results:**
- useCamera hook usage
- inputToolbarProps configuration
- CameraView component

**Success Criteria:**
- Relevance score: >0.7
- Contains: `useCamera`
- Contains: `hasCamera: true`
- Contains: `react-native-vision-camera`

---

#### Test 4.3: State Management
**Query:**
```
How to access chat state with useChat?
```

**Expected Results:**
- useChat hook example
- Available properties (chatState, chatDispatch)
- useChatSelector optimization

**Success Criteria:**
- Relevance score: >0.75
- Contains: `useChat()`
- Contains: `chatState` and `chatDispatch`
- Mentions `useChatSelector`

---

### Priority 5: Expo Configuration

#### Test 5.1: App Config
**Query:**
```
How to configure app.config.ts for rn-firebase-chat?
```

**Expected Results:**
- Complete app.config.ts example
- All required plugins
- Explanation of each plugin

**Success Criteria:**
- Relevance score: >0.85
- Contains: `expo-build-properties`
- Contains: `useFrameworks: 'static'`
- Contains: `buildReactNativeFromSource: true`

---

#### Test 5.2: Build Errors
**Query:**
```
How to fix "non-modular header" error in Expo?
```

**Expected Results:**
- Troubleshooting section
- buildReactNativeFromSource solution
- Explanation of the error

**Success Criteria:**
- Relevance score: >0.8
- Contains: `buildReactNativeFromSource: true`
- Contains error message or description

---

### Priority 6: Troubleshooting

#### Test 6.1: Permission Denied
**Query:**
```
Firestore permission denied error
```

**Expected Results:**
- Troubleshooting section
- Causes and solutions
- Security rules verification

**Success Criteria:**
- Relevance score: >0.7
- Contains: "permission denied"
- Contains solutions or fixes

---

#### Test 6.2: Messages Not Appearing
**Query:**
```
Messages not appearing in real-time
```

**Expected Results:**
- Troubleshooting section
- Listener initialization checks
- Firebase connection verification

**Success Criteria:**
- Relevance score: >0.65
- Contains: "real-time" or "listeners"
- Provides diagnostic steps

---

## Test Execution Checklist

### Before Testing
- [ ] Cursor fully restarted (Cmd+Q, reopen)
- [ ] MCP server connected (check MCP panel)
- [ ] Database has 43 chunks (run `npm start` to verify)
- [ ] Log file shows successful initialization

### During Testing
- [ ] Test all Priority 1 queries (Installation)
- [ ] Test all Priority 2 queries (Firebase Setup)
- [ ] Test all Priority 3 queries (Usage)
- [ ] Test Priority 4 queries (Advanced Features)
- [ ] Test Priority 5 queries (Expo)
- [ ] Test Priority 6 queries (Troubleshooting)

### Success Criteria
- [ ] 80%+ of queries return relevant results (score >0.7)
- [ ] Installation queries return code examples
- [ ] Firebase setup queries return security rules
- [ ] Usage queries return ChatProvider/ChatScreen examples
- [ ] No RAG chunking theory in results

---

## Using MCP Tools for Testing

### Method 1: Direct MCP Tool Calls (Recommended)

In any Cursor chat, use the MCP tools:

```
Use mcp_rn-firebase-chat_retrieve_context to answer:
"How to install rn-firebase-chat?"
```

This will show:
- Retrieved chunks
- Relevance scores
- Metadata (source file, chunk index)

### Method 2: Natural Language Queries

Just ask normally:
```
How do I set up Firebase for rn-firebase-chat?
```

The AI should automatically use the MCP retrieve_context tool.

### Method 3: Terminal Testing

Run the server and use curl:

```bash
# Start server
npm start

# In another terminal
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "How to install rn-firebase-chat?", "limit": 3}'
```

---

## Evaluation Metrics

### Relevance Score Interpretation

| Score Range | Quality | Expected Result |
|-------------|---------|-----------------|
| 0.9 - 1.0 | Excellent | Exact match to query intent |
| 0.7 - 0.9 | Good | Highly relevant, actionable |
| 0.5 - 0.7 | Acceptable | Somewhat relevant |
| 0.3 - 0.5 | Poor | Tangentially related |
| 0.0 - 0.3 | Very Poor | Mostly irrelevant |

### Target Performance

| Metric | Target | Current (Old) | Expected (New) |
|--------|--------|---------------|----------------|
| Avg Relevance | >0.7 | 0.35 | 0.75+ |
| Top-1 Accuracy | >70% | 0% | 75%+ |
| Contains Code | >80% | 0% | 90%+ |
| Actionable | >85% | 0% | 90%+ |

---

## Common Issues During Testing

### Issue: MCP Not Connected

**Symptom**: "Not connected" error when using MCP tools

**Solution:**
```bash
# Run reset script
./reset-mcp.sh

# Then fully restart Cursor (Cmd+Q)
```

---

### Issue: Old Results Still Appearing

**Symptom**: Still retrieving RAG chunking theory

**Solution:**
```bash
# Database wasn't reinitialized, run:
./reinit-database.sh

# Verify chunk count (should be 43)
npm start
# Check logs for "Successfully indexed 43 documents"
```

---

### Issue: Low Relevance Scores

**Symptom**: All scores <0.5 even for good queries

**Possible Causes:**
1. Embedding model not properly initialized
2. Query too vague or ambiguous
3. Topic not well-covered in docs

**Solution:**
- Make queries more specific
- Check embedding model logs
- Consider adjusting chunk size/overlap

---

## Advanced Testing

### Semantic Similarity Testing

Test how well the system handles different phrasings:

**Same Intent, Different Phrasing:**
1. "How to install rn-firebase-chat?"
2. "What's the installation process for rn-firebase-chat?"
3. "Steps to add rn-firebase-chat to my project?"
4. "Install react native firebase chat library"

**Expected**: All should retrieve Installation section with similar scores.

---

### Edge Case Testing

**Partial Information Queries:**
1. "ChatProvider props" → Should retrieve ChatProvider documentation
2. "Firebase rules chat" → Should retrieve security rules
3. "Expo plugin config" → Should retrieve app.config.ts section

---

### Negative Testing

**Queries Outside Scope:**
1. "How to build a REST API?" → Should have low relevance
2. "Python Django setup" → Should have very low relevance
3. "React navigation" → Might retrieve some navigation setup, but low score

**Expected**: Relevance scores <0.4 for out-of-scope queries

---

## Reporting Results

### Test Report Template

```markdown
## Test Results - [Date]

### Environment
- Database Chunks: 43
- Embedding Model: Xenova/bge-base-en-v1.5
- MCP Server: Connected ✅

### Query Results

#### Installation Queries
- Query: "How to install rn-firebase-chat?"
  - Relevance: 0.85
  - Contains Code: Yes
  - Actionable: Yes
  - Status: ✅ PASS

#### [Add more results]

### Summary
- Total Queries Tested: X
- Passed (>0.7): Y (Z%)
- Failed (<0.7): N
- Average Relevance: 0.XX

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## Success Indicators

### The optimization is successful if:

✅ **Installation queries** return npm/yarn commands  
✅ **Firebase setup queries** return security rules  
✅ **Usage queries** return ChatProvider/ChatScreen examples  
✅ **Expo queries** return app.config.ts configuration  
✅ **Average relevance** is >0.7 across all Priority 1-3 queries  
✅ **Zero RAG chunking theory** appears in results  
✅ **Code examples** are complete and runnable  
✅ **Users can implement features** from retrieved information  

---

## Next Steps After Testing

### If Tests Pass (>80% success rate):
1. ✅ Document successful queries for future reference
2. ✅ Monitor real usage patterns
3. ✅ Collect new questions to add to FAQ
4. ✅ Consider expanding documentation for uncovered topics

### If Tests Fail (<80% success rate):
1. 🔍 Review failed queries
2. 🔍 Check chunk boundaries (might be splitting mid-content)
3. 🔍 Consider adjusting chunk size/overlap
4. 🔍 Add missing topics to documentation
5. 🔍 Re-run `./reinit-database.sh`

---

## Continuous Improvement

### Weekly Tasks
- [ ] Review usage logs for common queries
- [ ] Identify queries with low relevance (<0.5)
- [ ] Update documentation to address gaps
- [ ] Retest previously failed queries

### Monthly Tasks
- [ ] Analyze retrieval accuracy trends
- [ ] A/B test different chunk sizes (1000 vs 1200)
- [ ] Experiment with different overlap ratios
- [ ] Update FAQ based on user questions

---

## Quick Reference Commands

```bash
# Check database status
npm start
# Look for: "Successfully indexed 43 documents"

# Reinitialize database
./reinit-database.sh

# Reset MCP server
./reset-mcp.sh

# Test retrieval via API
curl -X POST http://localhost:3000/api/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR QUERY HERE", "limit": 3}'

# View logs
tail -f logs/combined.log
```

---

## Support

If you encounter issues:
1. Check `TROUBLESHOOTING.md`
2. Review `DOCUMENTATION_OPTIMIZATION_REPORT.md`
3. Compare before/after in `BEFORE_AFTER_COMPARISON.md`

---

**Testing Status**: ⏳ Awaiting Cursor restart  
**Expected Outcome**: 80%+ query success rate with relevance >0.7  
**Ready to Test**: After full Cursor restart (Cmd+Q, reopen)  


