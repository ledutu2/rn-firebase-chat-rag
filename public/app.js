// API Base URL
const API_BASE = '';

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const queryInput = document.getElementById('queryInput');
const sendButton = document.getElementById('sendButton');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const docCount = document.getElementById('docCount');

// State
let isStreaming = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    queryInput.focus();
});

// Check system status
async function checkStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/status`);
        const data = await response.json();

        if (data.isInitialized) {
            statusDot.className = 'status-dot ready';
            statusText.textContent = 'System ready';
            docCount.textContent = `${data.documentCount} documents indexed`;
        } else {
            statusDot.className = 'status-dot';
            statusText.textContent = 'System initializing...';
            docCount.textContent = 'Waiting for initialization';
        }
    } catch (error) {
        statusDot.className = 'status-dot error';
        statusText.textContent = 'System error';
        docCount.textContent = 'Unable to connect';
        console.error('Status check failed:', error);
    }
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Send message
async function sendMessage() {
    const query = queryInput.value.trim();
    
    if (!query || isStreaming) {
        return;
    }

    // Add user message
    addMessage(query, 'user');
    queryInput.value = '';
    
    // Disable input while streaming
    isStreaming = true;
    sendButton.disabled = true;
    queryInput.disabled = true;

    // Add loading indicator
    const loadingId = addLoadingMessage();

    try {
        // Stream the response
        await streamResponse(query, loadingId);
    } catch (error) {
        removeMessage(loadingId);
        addErrorMessage(`Error: ${error.message}`);
        console.error('Error sending message:', error);
    } finally {
        isStreaming = false;
        sendButton.disabled = false;
        queryInput.disabled = false;
        queryInput.focus();
    }
}

// Add message to chat
function addMessage(content, type = 'assistant') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.id = `msg-${Date.now()}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'user' ? '👤' : '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return messageDiv.id;
}

// Add loading message
function addLoadingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    const id = `msg-${Date.now()}`;
    messageDiv.id = id;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content loading';
    contentDiv.innerHTML = `
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
    `;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    return id;
}

// Remove message
function removeMessage(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

// Update message content
function updateMessage(id, content) {
    const element = document.getElementById(id);
    if (element) {
        const contentDiv = element.querySelector('.message-content');
        if (contentDiv) {
            contentDiv.className = 'message-content';
            contentDiv.textContent = content;
        }
    }
}

// Add error message
function addErrorMessage(content) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = content;
    chatContainer.appendChild(errorDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Stream response from API
async function streamResponse(query, loadingId) {
    const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let messageId = null;

    try {
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.substring(6));
                    
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    
                    if (data.done) {
                        // Stream complete
                        break;
                    }
                    
                    if (data.chunk) {
                        fullResponse += data.chunk;
                        
                        // Remove loading message on first chunk
                        if (!messageId) {
                            removeMessage(loadingId);
                            messageId = addMessage(fullResponse, 'assistant');
                        } else {
                            updateMessage(messageId, fullResponse);
                        }
                        
                        // Scroll to bottom
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }

    // If no response was streamed, show error
    if (!fullResponse) {
        removeMessage(loadingId);
        throw new Error('No response received from server');
    }
}

// Clear chat
function clearChat() {
    const messages = chatContainer.querySelectorAll('.message, .error-message');
    messages.forEach(msg => {
        if (!msg.querySelector('.message-content')?.textContent.includes("Hello! I'm your RAG assistant")) {
            msg.remove();
        }
    });
}

// Auto-refresh status every 30 seconds
setInterval(checkStatus, 30000);

