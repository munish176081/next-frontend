"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ChatConversation, ChatMessage, ChatParticipant } from '@/_types/chat';
import { chatWebSocketService } from '@/_services/chat/chatWebSocketService';
import { chatApiService } from '@/_services/chat/chatApiService';

interface ChatInterfaceProps {
  userId: string;
  initialConversationId?: string;
  listingId?: string;
  onBack?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userId,
  initialConversationId,
  listingId,
  onBack
}) => {
  // Simple, clean state management
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);



  // Simple WebSocket connection
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const sessionId = getSessionId();
        if (!sessionId) {
          console.log('No session ID found, skipping WebSocket connection');
          return;
        }

        console.log('Attempting WebSocket connection with session ID:', sessionId);
        const connected = await chatWebSocketService.connect(sessionId);

        if (connected) {
          console.log('WebSocket connected successfully');
          setWsConnected(true);

          // Set up event listeners for real-time updates
          chatWebSocketService.on('new_message', handleNewMessage);
          chatWebSocketService.on('user_typing', handleUserTyping);
          chatWebSocketService.on('error', handleError);
          chatWebSocketService.on('connection_status_change', handleConnectionChange);

          console.log('WebSocket event listeners set up');
        } else {
          console.log('WebSocket connection failed');
          setWsConnected(false);
        }
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setWsConnected(false);
      }
    };

    // Try to connect immediately
    connectWebSocket();

    // Set up retry logic - only retry if not connected
    const retryInterval = setInterval(() => {
      if (!chatWebSocketService.isConnected()) {
        console.log('Retrying WebSocket connection...');
        connectWebSocket();
      }
    }, 5000); // Retry every 5 seconds if not connected

    // Set up periodic connection status check to keep UI in sync
    const statusCheckInterval = setInterval(() => {
      const actualStatus = chatWebSocketService.isConnected();
      if (actualStatus !== wsConnected) {
        console.log('🔄 Syncing connection status:', { actual: actualStatus, ui: wsConnected });
        setWsConnected(actualStatus);
      }
    }, 5000); // Check every 5 seconds instead of 2 seconds

    return () => {
      clearInterval(retryInterval);
      clearInterval(statusCheckInterval);
      chatWebSocketService.disconnect();
    };
  }, []); // Remove wsConnected dependency to prevent infinite loop

  // Load conversations once
  useEffect(() => {
    if (userId) {
      console.log('🚀 ChatInterface: userId available, loading conversations...');
      loadConversations();
    } else {
      console.log('⚠️ ChatInterface: userId not available yet, skipping conversation loading');
    }
  }, [userId]);





  // Handle initial conversation
  useEffect(() => {
    if (initialConversationId && initialConversationId !== 'new') {
      loadConversation(initialConversationId);
    }
  }, [initialConversationId]);

  // Join conversation room when selected
  useEffect(() => {
    if (currentConversation?.id && wsConnected) {
      console.log('🚪 Joining conversation room:', currentConversation.id);
      chatWebSocketService.joinConversation(currentConversation.id);
      return () => {
        console.log('🚪 Leaving conversation room:', currentConversation.id);
        chatWebSocketService.leaveConversation(currentConversation.id);
      };
    }
  }, [currentConversation?.id, wsConnected]);

  // Auto-join conversation room when WebSocket connects
  useEffect(() => {
    if (wsConnected && currentConversation?.id) {
      console.log('🚪 Auto-joining conversation room after WebSocket connection:', currentConversation.id);
      chatWebSocketService.joinConversation(currentConversation.id);
    }
  }, [wsConnected, currentConversation?.id]);

  // Debug: Log connection status changes
  useEffect(() => {
    console.log('🔍 ChatInterface: wsConnected state changed to:', wsConnected);
    console.log('🔍 ChatInterface: WebSocket service connected:', chatWebSocketService.isConnected());
  }, [wsConnected]);

  // Debug: Log messages array changes
  useEffect(() => {
    console.log('📨 ChatInterface: Messages array changed:', messages);
    console.log('📨 ChatInterface: Messages count:', messages.length);
  }, [messages]);

  // Simple helper functions
  const getSessionId = (): string | null => {
    if (typeof window === 'undefined') return null;

    // Try cookies first - this is how the backend session system works
    const cookies = document.cookie.split(';');
    const cookieNames = ['connect.sid', 'sessionId', 'sid', 'auth_token'];

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (cookieNames.includes(name)) {
        console.log('Found session ID in cookies:', name, value);
        return value;
      }
    }

    // Try localStorage as fallback
    const localSessionId = localStorage.getItem('sessionId');
    if (localSessionId) {
      console.log('Found session ID in localStorage:', localSessionId);
      return localSessionId;
    }

    // Try to get from current URL or other sources
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('sessionId');
    if (urlSessionId) {
      console.log('Found session ID in URL params:', urlSessionId);
      return urlSessionId;
    }

    // Try to get from window object (if set by your auth system)
    if ((window as any).sessionId) {
      console.log('Found session ID in window object:', (window as any).sessionId);
      return (window as any).sessionId;
    }

    // Try to get from document meta tags
    const metaSessionId = document.querySelector('meta[name="session-id"]')?.getAttribute('content');
    if (metaSessionId) {
      console.log('Found session ID in meta tag:', metaSessionId);
      return metaSessionId;
    }

    console.log('No session ID found in any source. Available cookies:', document.cookie);
    console.log('Available localStorage keys:', Object.keys(localStorage));

    // For testing purposes, return a default session ID
    // Remove this in production and handle the case properly
    const testSessionId = 'test-session-' + Date.now();
    console.log('Using test session ID for development:', testSessionId);
    return testSessionId;
  };

  const loadConversations = async () => {
    try {
      console.log('🔄 ChatInterface: Starting to load conversations for userId:', userId);
      setLoading(true);
      const data = await chatApiService.getConversations(userId, {});
      console.log('📚 ChatInterface: Raw conversations from API:', data);
      
      if (Array.isArray(data)) {
        console.log('✅ ChatInterface: Conversations loaded successfully, count:', data.length);
        setConversations(data);
        
        // If we have conversations but no current conversation is set, 
        // and we have an initialConversationId, try to load it
        if (data.length > 0 && !currentConversation && initialConversationId && initialConversationId !== 'new') {
          console.log('🔄 ChatInterface: No current conversation set, but have initialConversationId:', initialConversationId);
          console.log('🔄 ChatInterface: Attempting to load initial conversation...');
          await loadConversation(initialConversationId);
        }
        
        // If still no current conversation, select the first one
        if (data.length > 0 && !currentConversation) {
          console.log('🔄 ChatInterface: Still no current conversation, selecting first conversation:', data[0].id);
          handleConversationSelect(data[0]);
        }
      } else {
        console.error('❌ ChatInterface: Invalid conversations data format:', data);
        setConversations([]);
      }
    } catch (err) {
      console.error('❌ ChatInterface: Error loading conversations:', err);
      setError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      console.log('🔄 ChatInterface: Loading conversation:', conversationId);
      console.log('🔄 ChatInterface: Current conversation before loading:', currentConversation);
      
      const conversation = await chatApiService.getConversation(conversationId);
      console.log('📚 ChatInterface: Raw conversation from API:', conversation);
      
      if (conversation) {
        console.log('✅ ChatInterface: Conversation loaded successfully:', conversation);
        console.log('✅ ChatInterface: Setting current conversation to:', conversation.id);
        
        setCurrentConversation(conversation);
        setIsVisible(true);
        
        console.log('✅ ChatInterface: Current conversation set, now loading messages...');
        
        // Load messages for this conversation
        setConversationId(conversationId);
        await loadMessages(conversationId);
        
        // Join the WebSocket room for this conversation if connected
        if (wsConnected) {
          console.log('🚪 ChatInterface: Joining WebSocket room for conversation:', conversationId);
          chatWebSocketService.joinConversation(conversationId);
        }
        
        console.log('✅ ChatInterface: Conversation loading completed successfully');
      } else {
        console.error('❌ ChatInterface: No conversation returned from API for ID:', conversationId);
      }
    } catch (err) {
      console.error('❌ ChatInterface: Error loading conversation:', err);
      setError('Failed to load conversation');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      console.log('🔄 Loading messages for conversation:', conversationId);
      const data = await chatApiService.getMessages(conversationId);
      console.log('📨 Raw messages from API:', data);

      // Normalize messages to match UI expectations
      const normalizedMessages = data.map((message: any) => ({
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        messageType: message.message_type,
        replyTo: message.reply_to,
        attachments: message.attachments,
        listingReference: message.listing_reference,
        isRead: message.is_read,
        readBy: message.read_by,
        timestamp: message.timestamp
      }));

      console.log('✅ Normalized messages:', normalizedMessages);
      setMessages(normalizedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  // Handle real-time messages from other users
  const handleNewMessage = (data: any) => {
    console.log('📨 Received new message via WebSocket:', data);
    console.log('🔍 Current conversation state:', {
      currentConversation: currentConversation,
      currentConversationId: currentConversation?.id,
      conversationsCount: conversations.length,
      isVisible: isVisible
    });

    // Validate message data structure
    if (!data.conversationId || !data.message) {
      console.error('❌ Invalid message data structure:', data);
      return;
    }

    // Normalize message data to match UI expectations
    const normalizedMessage = {
      id: data.message.id,
      conversationId: data.message.conversation_id || data.conversationId,
      senderId: data.message.sender_id,
      content: data.message.content,
      messageType: data.message.message_type,
      replyTo: data.message.reply_to,
      attachments: data.message.attachments,
      listingReference: data.message.listing_reference,
      isRead: data.message.is_read,
      readBy: data.message.read_by,
      timestamp: data.message.timestamp
    };

    console.log('🔍 Normalized message:', normalizedMessage);
    console.log('🔍 Message data structure: Updated', {
      data: data,
      conversationId: data.conversationId,
      message: normalizedMessage,
      currentConversation: currentConversation,
      currentConversationId: conversationId,
      isCurrentConversation: data.conversationId === currentConversation?.id
    });

    // If this message is for the current conversation, add it to the UI
    if (data.conversationId === currentConversation?.id) {
      console.log('✅ Adding message to current conversation UI');
      setMessages(prev => {
        const newMessages = [...prev, normalizedMessage];
        console.log('🔍 Updated messages array:', newMessages);
        return newMessages;
      });
      console.log('✅ Message added to current conversation');
    } else {
      console.log('⚠️ Message not for current conversation or currentConversation is null');

      // If no conversation is currently selected, but this message is for a conversation we have,
      // we should either auto-select it or at least ensure the conversation is loaded
      if (!currentConversation && conversations.length > 0) {
        const matchingConversation = conversations.find(conv => conv.id === data.conversationId);
        if (matchingConversation) {
          console.log('🔄 Auto-selecting conversation for incoming message:', matchingConversation.id);
          setCurrentConversation(matchingConversation);
          setIsVisible(true);
          loadMessages(matchingConversation.id);

          // Now add the message to the UI since we have the conversation loaded
          setMessages(prev => {
            const newMessages = [...prev, normalizedMessage];
            console.log('🔍 Added message after auto-selecting conversation:', newMessages);
            return newMessages;
          });
        }
      }
    }

    // Always update conversation list with new message (for all conversations)
    setConversations(prev =>
      prev.map(conv =>
        conv.id === data.conversationId
          ? { ...conv, lastMessage: normalizedMessage, updatedAt: new Date() }
          : conv
      )
    );
    console.log('✅ Updated conversation list with new message');

    // If this message is for a conversation that's not currently loaded, 
    // we might want to refresh the conversations list to show the new message
    if (data.conversationId !== currentConversation?.id) {
      console.log('🔄 Message for different conversation, consider refreshing conversations list');
    }
  };

  const handleUserTyping = (data: any) => {
    console.log('User typing indicator:', data);

    if (data.conversationId === currentConversation?.id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    }
  };

  const handleError = (data: any) => {
    console.error('WebSocket error received:', data);
    setError(data.message || 'WebSocket error occurred');
  };

  // Add connection status change handler
  const handleConnectionChange = (status: boolean) => {
    console.log('🔌 WebSocket connection status changed:', status);
    console.log('🔍 Previous wsConnected state:', wsConnected);
    console.log('🔍 Setting wsConnected to:', status);
    setWsConnected(status);
    console.log('🔍 wsConnected state after setState:', wsConnected); // Note: This will show old value due to React's async nature
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversation?.id) return;

    try {
      console.log('Sending message:', content);
      const newMessage = await chatApiService.sendMessage(currentConversation.id, {
        content,
        messageType: 'text'
      });

      console.log('Message sent successfully:', newMessage);

      // Normalize the message to match UI expectations
      // The API returns snake_case properties, but UI expects camelCase
      const normalizedMessage = {
        id: newMessage.id,
        conversationId: (newMessage as any).conversation_id || newMessage.conversationId,
        senderId: (newMessage as any).sender_id || newMessage.senderId,
        content: newMessage.content,
        messageType: (newMessage as any).message_type || newMessage.messageType,
        replyTo: (newMessage as any).reply_to || newMessage.replyTo,
        attachments: newMessage.attachments,
        listingReference: (newMessage as any).listing_reference || newMessage.listingReference,
        isRead: (newMessage as any).is_read || newMessage.isRead,
        readBy: (newMessage as any).read_by || newMessage.readBy,
        timestamp: newMessage.timestamp
      };

      console.log('✅ Normalized sent message:', normalizedMessage);

      // Add message to local state immediately
      setMessages(prev => [...prev, normalizedMessage]);

      // Update conversation's last message
      setCurrentConversation(prev => prev ? {
        ...prev,
        lastMessage: normalizedMessage,
        updatedAt: new Date()
      } : null);

      // Update conversations list
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversation.id
            ? { ...conv, lastMessage: normalizedMessage, updatedAt: new Date() }
            : conv
        )
      );

      console.log('Local state updated with new message');

    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const handleConversationSelect = (conversation: ChatConversation) => {
    console.log('🎯 ChatInterface: Selecting conversation:', conversation);
    console.log('🎯 ChatInterface: Conversation ID:', conversation.id);

    setCurrentConversation(conversation);
    setIsVisible(true);

    // Load messages for this conversation
    loadMessages(conversation.id);

    // Join WebSocket room for this conversation if connected
    if (wsConnected) {
      console.log('🚪 Joining WebSocket room for selected conversation:', conversation.id);
      chatWebSocketService.joinConversation(conversation.id);
    }

    console.log('✅ ChatInterface: Conversation selected and loaded:', conversation.id);
  };

  const handleBackToList = () => {
    setIsVisible(false);
    setCurrentConversation(null);
    setMessages([]);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simple MessageCard component based on your design
  const MessageCard = ({ conversation }: { conversation: ChatConversation }) => {
    const otherParticipant = conversation.participants.find(p => p.user_id !== userId);
    const lastMessage = conversation.lastMessage;

    return (
      <div
        onClick={() => handleConversationSelect(conversation)}
        className={`flex flex-col ${conversation.unreadCount > 0 ? "bg-[#F4F2F6] border-r-[#B699CA]" : "border-r-transparent"} pr-12 p-4 gap-1 border-r-[6px] border-b border-b-black/20 relative cursor-pointer hover:bg-gray-50`}
      >
        <div className="flex gap-2 font-medium items-center relative">
          <span className={`size-2.5 rounded-full absolute left-[32px] bottom-[6px] border border-white ${otherParticipant?.isOnline ? 'bg-[#74D27E]' : 'bg-[#CFCFCF]'}`}></span>
          <span className="size-10 rounded-full overflow-hidden">
            <img className="w-full h-full object-cover" src={otherParticipant?.avatar || '/images/vectors/profile1.png'} alt={otherParticipant?.name || 'User'} />
          </span>
          <span className="font-semibold">{otherParticipant?.name || 'Unknown User'}</span>
          {conversation.unreadCount > 0 && (
            <span className="size-5 rounded-full bg-[#EE5D50] flex items-center justify-center text-[8px] text-white font-bold">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <span className={`text-sm whitespace-nowrap text-ellipsis block overflow-hidden ${conversation.unreadCount > 0 ? 'text-black' : 'text-[#888787]'}`}>
          {lastMessage?.content || 'No messages yet'}
        </span>
        <span className="flex text-[#ADA7A7] flex-col absolute right-3 h-full gap-6">
          {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.51475 13.3597C1.55872 13.6276 1.81152 13.8091 2.0794 13.7651L6.44474 13.0486C6.71262 13.0046 6.89413 12.7518 6.85016 12.4839C6.80619 12.2161 6.55339 12.0345 6.28551 12.0785L2.40521 12.7154L1.76831 8.83511C1.72434 8.56723 1.47154 8.38572 1.20366 8.42969C0.935779 8.47366 0.754264 8.72646 0.798233 8.99434L1.51475 13.3597ZM10.6188 0.433292L1.60052 12.9934L2.39905 13.5667L11.4173 1.00665L10.6188 0.433292Z" fill={otherParticipant?.isOnline ? '#74D27E' : '#CFCFCF'} />
          </svg>
        </span>
      </div>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-CPrimary"></div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadConversations}
            className="px-4 py-2 bg-CPrimary text-white rounded-lg hover:bg-CPrimary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-md:gap-4">
      {/* Header Section */}
      <section className="flex container gap-4 items-center">
        <span className="text-5xl font-semibold max-md:text-2xl">
          Hello, <span className="text-[#797777]">Jaz</span>
        </span>
        <div className="ml-auto flex gap-4 items-center max-md:justify-center">
          <select className="text-lg max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 h-[70px] rounded-full border-none w-52 max-md:w-32 max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[90%] bg-white font-medium">
            <option>Add Listing</option>
          </select>
          <span className="h-[70px] w-[70px] min-w-[70px] max-md:h-12 max-md:w-12 max-md:min-w-12 bg-white rounded-full items-center justify-center flex cursor-pointer relative max-md:hidden">
            <img className="w-8 max-md:w-5 invert" src="/images/vectors/search.svg" />
          </span>
          <span className="h-[70px] w-[70px] min-w-[70px] max-md:h-12 max-md:w-12 max-md:min-w-12 bg-white rounded-full items-center justify-center flex cursor-pointer relative">
            <span className="w-6 h-6 max-md:w-3 max-md:h-3 absolute rounded-full bg-CPrimary right-0 top-0"></span>
            <img className="w-8 max-md:w-5" src="/images/vectors/notification.svg" />
          </span>
        </div>
      </section>

      {/* Main Chat Section */}
      <section className="container relative flex gap-4 items-start">
        {/* Navigation Menu */}
        <div className="w-max min-w-max rounded-40 bg-white flex flex-col gap-4 p-4 max-md:fixed max-md:flex-row max-md:shadow-section max-md:bottom-4 max-md:left-4 max-md:w-[calc(100%-32px)] z-20 max-md:rounded-full max-md:justify-between">
          <a href="#" className="flex items-center text-[22px] font-semibold gap-4">
            <span className="w-16 h-16 flex items-center justify-center rounded-full">
              <img src="/images/vectors/menu1.png" alt="Menu1" />
            </span>
            <span className="max-md:hidden pr-4">Dashboard</span>
          </a>
          <a href="#" className="flex items-center text-[22px] font-semibold gap-4">
            <span className="w-16 h-16 flex items-center justify-center rounded-full bg-[#FFD9E8]">
              <img src="/images/vectors/menu2.png" alt="Menu2" />
            </span>
            <span className="max-md:hidden pr-4">Inbox</span>
          </a>
          <a href="#" className="flex items-center text-[22px] font-semibold gap-4">
            <span className="w-16 h-16 flex items-center justify-center rounded-full">
              <img src="/images/vectors/menu3.png" alt="Menu3" />
            </span>
            <span className="max-md:hidden pr-4">Meetings</span>
          </a>
          <a href="#" className="flex items-center text-[22px] font-semibold gap-4">
            <span className="w-16 h-16 flex items-center justify-center rounded-full">
              <img src="/images/vectors/menu4.png" alt="Menu4" />
            </span>
            <span className="max-md:hidden pr-4">Listings</span>
          </a>
        </div>

        {/* Chat Container */}
        <div className="w-full p-6 max-md:p-4 max-md:rounded-[20px] rounded-40 bg-white overflow-y-auto flex flex-col max-md:overflow-visible">
          {/* Header */}
          <div className="flex items-center justify-between pb-4">
            <span className="text-[32px] max-md:text-lg font-semibold flex items-center gap-2">
              <span
                onClick={handleBackToList}
                className={`size-7 max-md:flex items-center justify-center rounded-full bg-black ${!isVisible ? 'max-md:hidden' : ''}`}
              >
                <svg width="5" height="9" viewBox="0 0 5 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.42969 1.34872L0.609917 4.96745L4.42969 8.58618" stroke="white" strokeWidth="0.734151" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Inbox
            </span>
            <select className="text-lg max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-4 h-14 max-md:h-9 max-md:w-28 rounded-full border-[#CBCACA] border-[1px] bg-white w-40 max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[90%] font-medium">
              <option>Last Week</option>
              <option>Last Month</option>
            </select>
          </div>

          {/* Chat Layout */}
          <div className="flex gap-6 max-md:flex-col">
            {/* Conversation List */}
            <div className={`flex flex-col border border-black/20 rounded-[20px] max-w-[400px] max-md:max-w-full w-full h-[800px] max-md:h-auto max-md:overflow-hidden ${isVisible ? 'max-md:hidden' : ''}`}>
              <div className="flex items-center justify-between p-4">
                <select className="text-lg max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-4 h-14 max-md:h-9 max-md:w-28 rounded-full border-[#CBCACA] border-[1px] bg-white w-40 max-md:h-12 appearance-none bg-selectArrow2 bg-no-repeat bg-[90%] font-medium">
                  <option>{conversations.filter(c => c.unreadCount > 0).length} Unread</option>
                </select>
                <span className="text-[32px] font-semibold h-14 max-md:h-9 max-md:w-9 w-14 border border-[#CBCACA] rounded-full flex items-center justify-center">
                  <svg className="max-md:h-4" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25.1813 25.1952C24.9998 25.374 24.7553 25.4744 24.5005 25.4748C24.2422 25.4737 23.9942 25.3736 23.8075 25.1952L18.5554 19.931C16.3435 21.7889 13.4996 22.7211 10.617 22.5333C7.73443 22.3454 5.03564 21.0519 3.08353 18.9226C1.13141 16.7933 0.0766993 13.9926 0.139359 11.1046C0.202019 8.21654 1.37721 5.46418 3.41984 3.42155C5.46248 1.37892 8.21483 0.203728 11.1029 0.141068C13.9909 0.0784082 16.7916 1.13312 18.9209 3.08524C21.0502 5.03735 22.3437 7.73614 22.5316 10.6187C22.7194 13.5013 21.7872 16.3452 19.9292 18.5572L25.1813 23.8092C25.2732 23.8997 25.3462 24.0076 25.396 24.1266C25.4458 24.2455 25.4715 24.3732 25.4715 24.5022C25.4715 24.6312 25.4458 24.7589 25.396 24.8778C25.3462 24.9968 25.2732 25.1047 25.1813 25.1952ZM11.3703 20.6118C13.1978 20.6118 14.9842 20.0699 16.5036 19.0546C18.0231 18.0393 19.2074 16.5963 19.9067 14.9079C20.6061 13.2196 20.789 11.3618 20.4325 9.56944C20.076 7.7771 19.196 6.13073 17.9038 4.83853C16.6116 3.54633 14.9652 2.66633 13.1729 2.30981C11.3806 1.95329 9.52276 2.13627 7.83441 2.8356C6.14607 3.53494 4.70302 4.71922 3.68774 6.23869C2.67246 7.75816 2.13056 9.54457 2.13056 11.372C2.13378 13.8216 3.10828 16.1699 4.84037 17.902C6.57247 19.6341 8.92077 20.6086 11.3703 20.6118Z" fill="black" />
                  </svg>
                </span>
              </div>
              <div className="flex flex-col">
                {conversations.map((conversation) => (
                  <MessageCard key={conversation.id} conversation={conversation} />
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex flex-col border border-black/20 rounded-[20px] w-full ${!isVisible ? 'max-md:hidden' : ''}`}>
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="flex gap-4 border-b border-black/20 p-4 items-center">
                    <div className="flex gap-4 font-semibold items-center relative text-[22px] max-md:text-base">
                      <span className="size-6 max-md:size-4 absolute max-md:left-[20px] left-[42px] -top-1">
                        <img src="/images/vectors/blueTick.png" alt="" />
                      </span>
                      <span className={`size-4 max-md:size-2 rounded-full absolute max-md:left-[24px] left-[46px] bottom-[4px] border border-white ${currentConversation.participants.find(p => p.user_id !== userId)?.isOnline ? 'bg-[#74D27E]' : 'bg-[#CFCFCF]'}`}></span>
                      <span className="w-[60px] h-[60px] max-md:w-[30px] max-md:h-[30px] rounded-full overflow-hidden">
                        <img className="w-full h-full object-cover" src={currentConversation.participants.find(p => p.user_id !== userId)?.avatar || '/images/vectors/profile1.png'} />
                      </span>
                      {currentConversation.participants.find(p => p.user_id !== userId)?.name || 'Unknown User'}
                    </div>

                    {/* WebSocket Connection Status */}
                    <div className="flex items-center gap-2 ml-auto">
                      <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-xs text-gray-500">
                        {wsConnected ? 'Live' : 'Offline'}
                      </span>
                      <button
                        onClick={() => {
                          const sessionId = getSessionId();
                          console.log('Current session ID:', sessionId);
                          console.log('WebSocket connected:', wsConnected);
                          console.log('ChatWebSocketService connected:', chatWebSocketService.isConnected());
                        }}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Debug
                      </button>
                    </div>

                    <span className="text-[12px] font-semibold h-11 px-4 gap-1 border border-[#CBCACA] rounded-full flex items-center justify-center max-md:hidden">
                      <img src="/images/vectors/doubleTick.png" alt="" /> Mark As Read
                    </span>
                    <span className="text-[32px] font-semibold h-11 w-11 max-md:w-7 max-md:h-7 border border-[#CBCACA] rounded-full flex items-center justify-center max-md:ml-auto">
                      <img className="max-md:w-2.5" src="/images/vectors/3dots.png" alt="" />
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex w-full h-full max-h-[576px] max-md:max-h-fit p-4 flex-col gap-6 overflow-y-auto mb-6">
                    {/* Debug: Show messages count and state */}
                    <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                      Debug: Messages count: {messages.length} |
                      Current conversation: {currentConversation?.id || 'none'} |
                      WebSocket connected: {wsConnected ? 'yes' : 'no'}
                    </div>

                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className={`flex flex-col relative ${message.senderId === userId ? 'pr-20 ml-auto' : 'pl-20'} w-full max-w-[650px] max-md:${message.senderId === userId ? 'pr-12' : 'pl-12'}`}>
                          <span className={`w-[60px] h-[60px] max-md:w-[30px] max-md:h-[30px] rounded-full overflow-hidden absolute ${message.senderId === userId ? 'right-0' : 'left-0'} bottom-0`}>
                            <img className="w-full h-full object-cover" src={message.senderId === userId ? '/images/vectors/profile1.png' : currentConversation.participants.find(p => p.user_id !== userId)?.avatar || '/images/vectors/profile1.png'} />
                          </span>
                          <span className={`text-[#8B8B8B] font-medium flex gap-2 max-md:text-sm ${message.senderId === userId ? 'ml-auto mr-6' : 'ml-6'}`}>
                            {message.senderId === userId ? 'You' : currentConversation.participants.find(p => p.user_id !== userId)?.name}
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className={`flex rounded-40 max-md:rounded-[20px] bg-[#F4F2F6] p-6 max-md:p-4 relative ${message.senderId === userId ? 'before:border-l-[20px] before:border-l-transparent before:border-r-[20px] before:border-r-[#F4F2F6] before:absolute before:bottom-[5px] before:-right-[10px] before:rotate-[26deg]' : 'before:border-l-[20px] before:border-l-[#F4F2F6] before:border-r-[20px] before:border-r-transparent before:absolute before:bottom-[5px] before:-left-[10px] before:-rotate-[26deg]'}`}>
                            <span className="text-[#4A4A4A] font-medium text-[18px] max-md:text-sm">{message.content}</span>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Typing Indicators */}
                    {typingUsers.size > 0 && (
                      <div className="flex items-center space-x-2 text-gray-500 text-sm p-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span>Someone is typing...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="flex mx-4 border border-black/20 rounded-xl h-24 max-md:h-16 mt-auto mb-4 items-center">
                    <input
                      className="h-full w-full bg-transparent outline-none text-[19px] px-4 max-md:text-sm max-md:px-2"
                      type="text"
                      placeholder="Type something..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          handleSendMessage(e.currentTarget.value.trim());
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <span className="h-full w-16 max-md:w-7 max-md:min-w-7 min-w-16 flex items-center justify-center relative">
                      <img className='max-md:max-h-4' src="/images/vectors/mic.png" alt="" />
                    </span>
                    <span className="h-full w-16 max-md:w-7 max-md:min-w-7 min-w-16 flex items-center justify-center relative">
                      <input className="absolute w-full h-full top-0 left-0 cursor-pointer opacity-0" type="file" />
                      <img className='max-md:max-h-4' src="/images/vectors/attachment.png" alt="" />
                    </span>
                    <span className="h-full w-16 max-md:w-7 max-md:min-w-7 min-w-16 flex items-center justify-center relative">
                      <img className='max-md:max-h-4' src="/images/vectors/smile.png" alt="" />
                    </span>
                    <hr className="bg-black/20 flex h-12 w-0.5 ml-4 max-md:ml-2" />
                    <span className="h-full w-24 max-md:w-10 max-md:min-w-10 min-w-24 flex items-center justify-center">
                      <img className='max-md:h-6' src="/images/vectors/sendBtn.png" alt="" />
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}; 