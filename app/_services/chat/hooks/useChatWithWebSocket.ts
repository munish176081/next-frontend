import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatConversation, ChatMessage, ChatParticipant } from '@/_types/chat';
import { chatApiService } from '../chatApiService';

export interface UseChatReturn {
  // Conversations
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  selectConversation: (conversation: ChatConversation) => void;
  sendMessage: (content: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export const useChatWithWebSocket = (
  userId: string,
  initialConversationId?: string,
  listingId?: string
): UseChatReturn => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const userIdRef = useRef(userId);
  
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Load conversations
  const refreshConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatApiService.getConversations(userIdRef.current, {});
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback((conversation: ChatConversation) => {
    setCurrentConversation(conversation);
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation?.id) {
      setError('No conversation selected');
      return;
    }

    try {
      setError(null);
      const newMessage = await chatApiService.sendMessage(currentConversation.id, {
        content,
        messageType: 'text'
      });

      // Update conversation's last message
      setCurrentConversation(prev => prev ? { 
        ...prev, 
        lastMessage: newMessage, 
        updatedAt: new Date() 
      } : null);
      
      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id 
            ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
            : conv
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Error sending message:', err);
    }
  }, [currentConversation]);

  // Initial load
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Handle initial conversation
  useEffect(() => {
    if (initialConversationId && initialConversationId !== 'new') {
      const conversation = conversations.find(c => c.id === initialConversationId);
      if (conversation) {
        setCurrentConversation(conversation);
      }
    }
  }, [initialConversationId, conversations]);

  return {
    conversations,
    currentConversation,
    loading,
    error,
    selectConversation,
    sendMessage,
    refreshConversations,
  };
}; 