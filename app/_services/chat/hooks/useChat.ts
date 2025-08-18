import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatConversation, ChatMessage, ChatParticipant, ChatSearchFilters, ChatStats, CreateParticipantDto } from '@/_types/chat';
import { chatApiService } from '../chatApiService';

interface UseChatReturn {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  stats: ChatStats | null;
  searchTerm: string;
  filters: ChatSearchFilters;
  
  // Actions
  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, messageType?: 'text' | 'image' | 'file' | 'listing', attachments?: any[], listingReference?: any) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  searchConversations: (term: string) => Promise<void>;
  applyFilters: (filters: ChatSearchFilters) => Promise<void>;
  selectConversation: (conversation: ChatConversation) => void;
  createNewConversation: (participants: Omit<ChatParticipant, 'id'>[], listingId?: string) => Promise<void>;
  updateParticipantStatus: (participantId: string, isOnline: boolean) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useChat = (
  userId: string,
  initialConversationId?: string,
  listingId?: string
): UseChatReturn => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ChatSearchFilters>({});
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [preventRefresh, setPreventRefresh] = useState(false);
  
  // Use refs to store stable references
  const filtersRef = useRef(filters);
  const userIdRef = useRef(userId);
  
  // Update refs when values change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useChat: Loading conversations for user:', userIdRef.current);
      const data = await chatApiService.getConversations(userIdRef.current, filtersRef.current);
      console.log('useChat: Loaded conversations:', data);
      console.log('useChat: Conversation IDs:', data.map(c => ({ id: c.id, name: c.participants?.[0]?.name || 'Unknown' })));
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('useChat: Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed since we use refs

  // Load specific conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const conversation = await chatApiService.getConversation(conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        await loadMessages(conversationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setError(null);
      const data = await chatApiService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Error loading messages:', err);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    content: string,
    messageType: 'text' | 'image' | 'file' | 'listing' = 'text',
    attachments?: any[],
    listingReference?: any
  ) => {
    console.log('🔍 useChat: sendMessage called with:', { content, messageType, attachments, listingReference });
    console.log('🔍 useChat: currentConversation:', currentConversation);
    console.log('🔍 useChat: currentConversation?.id:', currentConversation?.id);
    
    if (!currentConversation) {
      console.error('🔍 useChat: No conversation selected');
      setError('No conversation selected');
      return;
    }

    if (!currentConversation.id) {
      console.error('🔍 useChat: Conversation has no ID:', currentConversation);
      setError('Conversation has no ID');
      return;
    }

    try {
      setError(null);
      console.log('🔍 useChat: Sending message to conversation ID:', currentConversation.id);
      
      console.log('🔍 useChat: Calling chatApiService.sendMessage...');
      const newMessage = await chatApiService.sendMessage(currentConversation.id, {
        content,
        messageType,
        attachments,
        listingReference,
      });

      console.log('🔍 useChat: Message sent successfully:', newMessage);

      // Add message to local state
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation's last message
      setCurrentConversation(prev => prev ? { ...prev, lastMessage: newMessage, updatedAt: new Date() } : null);
      
      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id 
            ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
            : conv
        )
      );
      
      // Refresh conversations from backend to get the latest data
      setTimeout(() => {
        loadConversations();
      }, 500);
      
    } catch (err) {
      console.error('🔍 useChat: Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // If the conversation was not found, reload conversations
      if (err instanceof Error && err.message.includes('Conversation not found')) {
        console.warn('🔍 useChat: Conversation not found, reloading conversations...');
        await loadConversations();
      }
    }
  }, [currentConversation, loadConversations]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await chatApiService.markConversationAsRead(conversationId, userIdRef.current);
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, unreadCount: 0 } : null);
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [currentConversation]);

  // Search conversations
  const searchConversations = useCallback(async (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);

  // Apply filters
  const applyFilters = useCallback(async (newFilters: ChatSearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Select a conversation
  const selectConversation = useCallback((conversation: ChatConversation) => {
    console.log('useChat: Selecting conversation:', conversation);
    console.log('useChat: Conversation ID:', conversation.id);
    console.log('useChat: Conversation participants:', conversation.participants);
    
    setCurrentConversation(conversation);
    loadMessages(conversation.id);
    
    // Mark as read if there are unread messages
    if (conversation.unreadCount > 0) {
      markAsRead(conversation.id);
    }
  }, [loadMessages, markAsRead]);

  // Create new conversation
  const createNewConversation = useCallback(async (
    participants: CreateParticipantDto[],
    listingId?: string
  ) => {
    if (isCreatingConversation) return; // Prevent multiple creations
    
    try {
      setIsCreatingConversation(true);
      setError(null);
      
      console.log('useChat: Creating conversation with participants:', participants, 'listingId:', listingId);
      const newConversation = await chatApiService.getOrCreateConversation(participants, listingId);
      console.log('useChat: Received new conversation from API:', newConversation);
      
      // Add to conversations list
      setConversations(prev => {
        console.log('useChat: Previous conversations:', prev);
        const updated = [newConversation, ...prev];
        console.log('useChat: Updated conversations:', updated);
        return updated;
      });
      
      // Select the new conversation
      setCurrentConversation(newConversation);
      setMessages([]);
      
      // Mark as read
      await markAsRead(newConversation.id);
      
      // Prevent auto-refresh from overwriting the new conversation
      setPreventRefresh(true);
      setTimeout(() => {
        console.log('useChat: Allowing auto-refresh after conversation creation');
        setPreventRefresh(false);
      }, 10000); // 10 seconds to ensure backend has saved the conversation
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      console.error('Error creating conversation:', err);
    } finally {
      setIsCreatingConversation(false);
    }
  }, [isCreatingConversation, markAsRead]);

  // Update participant status
  const updateParticipantStatus = useCallback(async (participantId: string, isOnline: boolean) => {
    try {
      await chatApiService.updateParticipantStatus(participantId, isOnline);
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => ({
          ...conv,
          participants: conv.participants.map(p => 
            p.id === participantId ? { ...p, isOnline, lastSeen: new Date() } : p
          )
        }))
      );
      
      if (currentConversation) {
        setCurrentConversation(prev => prev ? ({
          ...prev,
          participants: prev.participants.map(p => 
            p.id === participantId ? { ...p, isOnline, lastSeen: new Date() } : p
          )
        }) : null);
      }
    } catch (err) {
      console.error('Error updating participant status:', err);
    }
  }, [currentConversation]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const data = await chatApiService.getChatStats(userIdRef.current);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []); // No dependencies needed

  // Initial load - only run once
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('useChat: Initial load of conversations...');
      loadConversations();
      refreshStats();
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []); // Empty dependency array - only run once

  // Handle initial conversation or listing
  useEffect(() => {
    if (initialConversationId && initialConversationId !== 'new') {
      loadConversation(initialConversationId);
    }
    // Note: Listing-based conversation creation is now handled in the ChatInterface component
  }, [initialConversationId, loadConversation]);

  // Auto-refresh conversations every 30 seconds - only when not loading
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !preventRefresh) {
        console.log('useChat: Auto-refreshing conversations...');
        loadConversations();
      } else if (preventRefresh) {
        console.log('useChat: Skipping auto-refresh due to recent conversation creation');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, loadConversations, preventRefresh]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    stats,
    searchTerm,
    filters,
    loadConversations,
    loadConversation,
    loadMessages,
    sendMessage,
    markAsRead,
    searchConversations,
    applyFilters,
    selectConversation,
    createNewConversation,
    updateParticipantStatus,
    refreshStats,
  };
}; 