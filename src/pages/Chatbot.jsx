import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Shield } from 'lucide-react';
import { sendChatMessage, getChatSuggestions, trackEvent } from '../utils/api';

export default function Chatbot() {
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: "Welcome to GovChat AI Assistant! 🇸🇱\n\nI'm your digital guide to Government of Sierra Leone services and information. I can help you with:\n\n• Business registration\n• Tax information & filing\n• Labour rights & complaints\n• Government projects & services\n• Public official contacts\n• Health insurance registration\n\nHow can I assist you today?",
            source: 'System',
            suggestions: [
                'How do I register a business?',
                'What are the current tax rates?',
                'Tell me about my worker rights',
                'What digital services are available?',
            ],
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        trackEvent('page_view', '/chatbot');
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function handleSend(msgText) {
        const text = msgText || input.trim();
        if (!text) return;

        setInput('');
        setMessages(prev => [...prev, { type: 'user', text }]);
        setIsTyping(true);

        try {
            const res = await sendChatMessage(text);
            // Simulate slight delay for natural feel
            await new Promise(r => setTimeout(r, 500));
            setMessages(prev => [...prev, {
                type: 'bot',
                text: res.response,
                source: res.source,
                category: res.category,
                suggestions: res.suggestions,
            }]);
        } catch (e) {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
                source: 'System',
            }]);
        }
        setIsTyping(false);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="chat-container">
            {/* Chat Header */}
            <div className="chat-header">
                <div className="chat-header-avatar">
                    <Bot size={22} />
                </div>
                <div>
                    <h3>GovChat AI Assistant</h3>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={10} /> Powered by verified government data
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-message ${msg.type}`}>
                        <div className="chat-msg-avatar">
                            {msg.type === 'bot' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div>
                            <div className="chat-msg-bubble" style={{ whiteSpace: 'pre-line' }}>
                                {msg.text}
                                {msg.source && msg.source !== 'System' && (
                                    <div className="chat-msg-source">
                                        📋 Source: {msg.source}
                                        {msg.category && ` • Category: ${msg.category}`}
                                    </div>
                                )}
                            </div>
                            {msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="chat-suggestions">
                                    {msg.suggestions.map((s, j) => (
                                        <button key={j} className="chat-suggestion-btn" onClick={() => handleSend(s)}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="chat-message bot">
                        <div className="chat-msg-avatar">
                            <Bot size={16} />
                        </div>
                        <div className="chat-msg-bubble">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
                <input
                    type="text"
                    placeholder="Ask about government services, policies, or information..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping}
                />
                <button
                    className="chat-send-btn"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
