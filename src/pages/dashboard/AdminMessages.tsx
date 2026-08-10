import { useState, useEffect, useRef } from 'react';
import { clientService } from '../../services/clientService';
import { messageService, type Message } from '../../services/messageService';
import type { ClientItem } from '../../types/client';
import { MessageSquare, Search, Send, User, Trash2, Mail, Download } from 'lucide-react';
import SEO from '../../components/common/SEO';
import ComposeEmailModal from '../../components/dashboard/ComposeEmailModal';

export function AdminMessages() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastMessageTimes, setLastMessageTimes] = useState<Record<string, number>>({});

  // Compose Email Modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load clients and unread counts
  useEffect(() => {
    const loadClients = async () => {
      const allClients = await clientService.getClients();
      setClients(allClients);
      
      // Load unread counts and last message times for each client
      const counts: Record<string, number> = {};
      const times: Record<string, number> = {};
      for (const c of allClients) {
        counts[c.id] = await messageService.getUnreadCount('admin', c.id);
        const msgs = await messageService.getMessagesForClient(c.id);
        times[c.id] = msgs.length > 0 ? new Date(msgs[msgs.length - 1].createdAt).getTime() : 0;
      }
      setUnreadCounts(counts);
      setLastMessageTimes(times);
    };
    loadClients();

    const handleUpdate = () => loadClients();
    window.addEventListener('studio_messages_updated', handleUpdate);
    const interval = setInterval(handleUpdate, 10000); // Poll list every 10s
    return () => {
      window.removeEventListener('studio_messages_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Load messages for selected client
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedClientId) {
        const msgs = await messageService.getMessagesForClient(selectedClientId);
        
        setMessages(prev => {
          if (prev.length !== msgs.length || (prev.length > 0 && msgs.length > 0 && prev[prev.length - 1].id !== msgs[msgs.length - 1].id)) {
            setTimeout(scrollToBottom, 100);
            return msgs;
          }
          return prev;
        });
        
        // Mark thread as read only if there are unread client messages
        const hasUnread = msgs.some(m => !m.isRead && m.senderRole === 'client');
        if (hasUnread) {
          await messageService.markThreadAsRead(selectedClientId, 'admin');
          setUnreadCounts(prev => ({ ...prev, [selectedClientId]: 0 }));
          window.dispatchEvent(new Event('studio_messages_updated'));
        }
      }
    };
    loadMessages();

    const handleUpdate = () => loadMessages();
    window.addEventListener('studio_messages_updated', handleUpdate);
    const interval = setInterval(handleUpdate, 3000); // Poll active chat every 3s
    return () => {
      window.removeEventListener('studio_messages_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [selectedClientId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClientId || isSending) return;
    
    setIsSending(true);
    const sentMsg = await messageService.sendMessage(selectedClientId, 'admin', newMessage.trim());
    setMessages(prev => [...prev, sentMsg]);
    setLastMessageTimes(prev => ({ ...prev, [selectedClientId!]: Date.now() }));
    setNewMessage('');
    setIsSending(false);
    scrollToBottom();
  };

  const handleClearChat = async () => {
    if (!selectedClientId) return;
    if (confirm('Are you sure you want to completely clear the chat history for this client? This action cannot be undone.')) {
      await messageService.clearClientChat(selectedClientId);
      setMessages([]);
      setLastMessageTimes(prev => {
        const newTimes = { ...prev };
        newTimes[selectedClientId] = 0;
        return newTimes;
      });
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    const timeA = lastMessageTimes[a.id] || 0;
    const timeB = lastMessageTimes[b.id] || 0;
    return timeB - timeA;
  });

  const filteredClients = sortedClients.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <>
      <SEO 
        title="Messages - GM Admin"
        description="Communicate directly with your clients through the secure inbox."
      />

      <div className="h-[calc(100vh-8rem)] font-sans flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar: Contact List */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 dark:border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                Client Inbox
              </h2>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Compose Custom Email from support@gmdigitalstudio.app"
              >
                <Mail className="w-3.5 h-3.5" /> Compose Email
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredClients.map(client => {
              const unread = unreadCounts[client.id] || 0;
              const isSelected = selectedClientId === client.id;
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    isSelected 
                      ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-dark-surface border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      isSelected ? 'bg-brand-600 text-white' : 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                    }`}>
                      {client.fullName.charAt(0).toUpperCase()}
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-dark-card rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className={`text-sm font-bold truncate ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-gray-900 dark:text-white'}`}>
                      {client.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {client.company}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Chat Thread */}
        <div className="flex-1 flex flex-col bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl overflow-hidden shadow-xs">
          {selectedClientId ? (
            <>
              {/* Chat Header */}
              <div className="p-5 border-b border-gray-100 dark:border-dark-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold">
                  {selectedClient?.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedClient?.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedClient?.company}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedClient) {
                        messageService.exportChatTranscript(
                          messages,
                          selectedClient.fullName,
                          selectedClient.email,
                          'Studio Admin',
                          'admin'
                        );
                      }
                    }}
                    title="Export & Download Chat Transcript"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-brand-500" /> Export Chat
                  </button>

                  <button
                    onClick={handleClearChat}
                    title="Clear Chat History"
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-dark-surface/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">No messages yet</p>
                    <p className="text-xs text-gray-500">Send a message to start the conversation.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                          isAdmin 
                            ? 'bg-brand-600 text-white rounded-tr-sm shadow-md' 
                            : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white rounded-tl-sm shadow-xs'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-1.5 font-medium ${isAdmin ? 'text-brand-100' : 'text-gray-400'}`}>
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
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-brand-600 dark:text-brand-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                Select a Client
              </h2>
              <p className="text-sm text-gray-500 max-w-sm">
                Choose a client from the sidebar to view your conversation history or send a new message.
              </p>
            </div>
          )}
        </div>
      </div>

      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        initialRecipientEmail={selectedClient?.email}
        initialRecipientName={selectedClient?.fullName}
      />
    </>
  );
}
