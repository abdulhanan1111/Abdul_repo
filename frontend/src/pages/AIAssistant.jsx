import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';
import { API_URL } from '../constants';

const AIAssistant = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Logistics Assistant. Ask me about available drivers, vehicles in specific cities, or the status of your trips.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const historyForPuter = [...messages, userMessage].map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

      if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
        const aiText = await window.puter.ai.chat(historyForPuter);
        setMessages((prev) => [...prev, { role: 'ai', text: aiText }]);
      } else {
        const response = await axios.post(`${API_URL}/ai/chat`, {
          query: userMessage.text,
          history: messages,
        });
        setMessages((prev) => [...prev, { role: 'ai', text: response.data.response }]);
      }
    } catch (error) {
      console.error('AI Error', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Sorry, I encountered an error connecting to the AI service. Please ensure the frontend can load Puter.js or that the backend is running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-header">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot style={{ color: 'var(--primary)' }} />
          AI Logistics Assistant
        </h2>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {msg.role === 'ai' && <Bot size={20} style={{ marginTop: '4px', opacity: 0.7 }} />}
              <div>{msg.text}</div>
              {msg.role === 'user' && <User size={20} style={{ marginTop: '4px', opacity: 0.7 }} />}
            </div>
          ))}
          {loading && (
            <div className="message ai" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Thinking...
            </div>
          )}
        </div>
        
        <form onSubmit={handleSend} className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Which drivers are available in Surat?"
            disabled={loading}
          />
          <button type="submit" className="chat-send-btn" disabled={loading}>
            <Send size={18} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AIAssistant;
