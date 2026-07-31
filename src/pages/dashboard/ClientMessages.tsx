import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageService, type Message } from '../../services/messageService';
import { MessageSquare, Send, Building } from 'lucide-react';
import SEO from '../../components/common/SEO';

export function ClientMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async (silent = false) => {
      if (user?.id) {
        if (!silent) setIsLoading(true);
        const msgs = await messageService.getMessagesForClient(user.id);
        
        setMessages(prev => {
          if (prev.length !== msgs.length || (prev.length > 0 && msgs.length > 0 && prev[prev.length - 1].id !== msgs[msgs.length - 1].id)) {
            setTimeout(scrollToBottom, 100);
            return msgs;
          }
          return prev;
        });
        
        // Mark thread as read only if there are unread admin messages
        const hasUnread = msgs.some(m => !m.isRead && m.senderRole === 'admin');
        if (hasUnread) {
          await messageService.markThreadAsRead(user.id, 'client');
          window.dispatchEvent(new Event('gm_messages_updated'));
        }
        
        if (!silent) setIsLoading(false);
      }
    };
    loadMessages();

    const handleUpdate = () => loadMessages(true);
    window.addEventListener('gm_messages_updated', handleUpdate);
    const interval = setInterval(handleUpdate, 3000); // Poll active chat every 3s
    return () => {
      window.removeEventListener('gm_messages_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id || isSending) return;
    
    setIsSending(true);
    const sentMsg = await messageService.sendMessage(user.id, 'client', newMessage.trim());
    setMessages(prev => [...prev, sentMsg]);
    setNewMessage('');
    setIsSending(false);
    scrollToBottom();
  };

  return (
    <>
      <SEO 
        title="Support & Messages - Client Portal"
        description="Communicate directly with the studio team for support or project updates."
      />

      <div className="h-[calc(100vh-8rem)] font-sans flex flex-col bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl overflow-hidden shadow-xs">
        
        {/* Chat Header */}
        <div className="p-5 border-b border-gray-100 dark:border-dark-border flex items-center gap-4 bg-gray-50/50 dark:bg-dark-surface/50">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              GM Digital Studio Team
            </h1>
            <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">
              We typically reply within a few hours.
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-dark-surface/30">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-brand-600 dark:text-brand-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                How can we help?
              </h2>
              <p className="text-sm text-gray-500 max-w-sm">
                Send us a message here if you have any questions, feedback on deliverables, or need support with your project.
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isClient = msg.senderRole === 'client';
              return (
                <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 ${
                    isClient 
                      ? 'bg-brand-600 text-white rounded-tr-sm shadow-md' 
                      : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded-tl-sm shadow-xs'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-2 font-medium ${isClient ? 'text-brand-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>
    </>
  );
}
