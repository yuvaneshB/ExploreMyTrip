import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { queryChatbot } from '../api/chatbotApi.js';

const QUICK_PROMPTS = [
  'Suggest a good beach tour',
  'Help with my booking',
  'Explain the booking process',
  'How do I cancel my tour?'
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hi! I'm your ExploreMyTrip AI travel assistant. Ask me about destinations, tours, bookings, or travel planning."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setErrorMsg(null);
    const updatedMessages = [...messages, { role: 'user', text: trimmed }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const resData = await queryChatbot(trimmed, conversationHistory);

      if (resData.success && resData.reply) {
        setMessages(prev => [...prev, { role: 'model', text: resData.reply }]);
      } else {
        const errorText = resData.message || 'Sorry, I couldn’t respond right now. Please try again.';
        setMessages(prev => [...prev, { role: 'model', text: errorText }]);
      }
    } catch (err) {
      console.error('Chatbot API Error:', err);
      const serverError = err.response?.data?.message || err.response?.data?.error || 'Sorry, I couldn’t respond right now. Please try again.';
      setMessages(prev => [...prev, { role: 'model', text: serverError }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const renderMessageText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <div key={lineIdx} className={lineIdx > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, partIdx) => {
            if (partIdx % 2 === 1) {
              return <strong key={partIdx} className="font-extrabold text-slate-900">{part}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
          !isOpen ? 'chatbot-pulse-button' : ''
        }`}
        aria-label={isOpen ? 'Close AI Travel Assistant' : 'Open AI Travel Assistant'}
        title="Open AI Travel Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Floating chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-120px)] bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out font-sans">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-extrabold tracking-tight">ExploreMyTrip AI Assistant</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Chatbot panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div 
                    className={`p-3.5 text-xs leading-relaxed ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-sm max-w-[80%]' 
                        : 'bg-white text-slate-700 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm max-w-[85%]'
                    }`}
                  >
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1 bg-white border border-slate-150 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions area */}
          {messages.length === 1 && !loading && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-left">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-2 px-1">
                Suggested Actions
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-xs bg-white text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-300 px-3.5 py-2 rounded-xl transition-all duration-200 shadow-sm font-semibold cursor-pointer active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input field */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask me anything about your trip..."
              className="flex-1 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 font-medium text-slate-800 disabled:bg-slate-50 placeholder-slate-400"
              aria-label="Enter your message"
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center shadow-md shadow-blue-500/10 active:scale-95 transition-all duration-150 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default Chatbot;
