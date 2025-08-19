import { 
  ChatConversation, 
  ChatMessage, 
  ChatParticipant, 
  ChatSearchFilters,
  ChatStats,
  CreateParticipantDto
} from '@/_types/chat';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1';

class ChatApiService {
  private getAuthHeaders(): HeadersInit {
    console.log('ChatApiService: Using session-based authentication');
    
    return {
      'Content-Type': 'application/json',
      // Include credentials for session-based authentication
      credentials: 'include',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log('ChatApiService: Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error('ChatApiService: API Error:', errorMessage, errorData);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('ChatApiService: Response data:', data);
    return data;
  }

  // Conversation methods
  async getConversations(userId: string, filters?: ChatSearchFilters): Promise<ChatConversation[]> {
    console.log('ChatApiService: Getting conversations for user:', userId, 'filters:', filters);
    
    const params = new URLSearchParams();
    if (filters?.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters?.listingId) params.append('listingId', filters.listingId);
    if (filters?.unreadOnly) params.append('unreadOnly', 'true');

    const url = `${API_BASE_URL}/chat/conversations?${params.toString()}`;
    console.log('ChatApiService: Request URL:', url);

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Important for session cookies
    });

    return this.handleResponse<ChatConversation[]>(response);
  }

  async initiateChat(listingId: string): Promise<{ conversationId: string }> {
    console.log('🔌 CHAT API: initiateChat called with listingId:', listingId);
    
    const requestBody = { listingId };
    console.log('🔌 CHAT API: Request body:', requestBody);
    console.log('🔌 CHAT API: Request URL:', `${API_BASE_URL}/chat/initiate`);
    
    const response = await fetch(`${API_BASE_URL}/chat/initiate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    console.log('🔌 CHAT API: Response status:', response.status);
    console.log('🔌 CHAT API: Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await this.handleResponse<{ conversationId: string }>(response);
    console.log('🔌 CHAT API: Final result:', result);
    
    return result;
  }

  async getConversation(conversationId: string): Promise<ChatConversation | null> {
    console.log('🔌 CHAT API: getConversation called with ID:', conversationId);
    
    const url = `${API_BASE_URL}/chat/conversations/${conversationId}`;
    console.log('🔌 CHAT API: Request URL:', url);
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    console.log('🔌 CHAT API: getConversation response status:', response.status);

    if (response.status === 404) {
      console.log('🔌 CHAT API: Conversation not found (404)');
      return null;
    }

    const result = await this.handleResponse<ChatConversation>(response);
    console.log('🔌 CHAT API: getConversation result:', {
      id: result?.id,
      participantsCount: result?.participants?.length,
      hasMetadata: !!result?.metadata,
      hasLastMessage: !!result?.lastMessage
    });
    
    return result;
  }

  async createConversation(participants: CreateParticipantDto[], listingId?: string): Promise<ChatConversation> {
    console.log('ChatApiService: Creating conversation with participants:', participants, 'listingId:', listingId);
    
    const payload = {
      participants,
      listingId,
      conversationType: listingId ? 'listing' : 'direct',
    };
    
    console.log('ChatApiService: Request payload:', payload);

    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    return this.handleResponse<ChatConversation>(response);
  }

  // Message methods
  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    console.log('🔌 CHAT API: getMessages called for conversation:', conversationId);
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const url = `${API_BASE_URL}/chat/conversations/${conversationId}/messages?${params.toString()}`;
    console.log('🔌 CHAT API: getMessages URL:', url);

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    console.log('🔌 CHAT API: getMessages response status:', response.status);

    const result = await this.handleResponse<ChatMessage[]>(response);
    console.log('🔌 CHAT API: getMessages result:', {
      messageCount: result?.length,
      messages: result?.map(m => ({
        id: m.id,
        content: m.content,
        messageType: m.messageType,
        hasListingReference: !!m.listingReference
      }))
    });
    
    return result;
  }

  async sendMessage(conversationId: string, message: {
    content: string;
    messageType: 'text' | 'image' | 'file' | 'listing';
    replyTo?: string;
    attachments?: any[];
    listingReference?: any;
  }): Promise<ChatMessage> {
    console.log('🔍 ChatApiService: sendMessage called with conversationId:', conversationId);
    console.log('🔍 ChatApiService: sendMessage called with message:', message);
    console.log('🔍 ChatApiService: Full API URL:', `${API_BASE_URL}/chat/conversations/${conversationId}/messages`);
    
    const response = await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(message),
      }
    );

    console.log('🔍 ChatApiService: Response status:', response.status);
    console.log('🔍 ChatApiService: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🔍 ChatApiService: Send message failed:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await this.handleResponse<ChatMessage>(response);
    console.log('🔍 ChatApiService: Message sent successfully:', result);
    return result;
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    // This is handled at the conversation level in the backend
    // We'll implement it when we have individual message read tracking
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    console.log('ChatApiService: Marking conversation as read:', conversationId);
    
    await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/read`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );
  }

  // Participant methods
  async updateParticipantStatus(participantId: string, isOnline: boolean): Promise<void> {
    // This would typically be handled by WebSocket connections
    // For now, we'll implement it when we add real-time features
  }

  async getParticipant(participantId: string): Promise<ChatParticipant | null> {
    // Participants are typically retrieved with conversations
    // This method is kept for compatibility but may not be needed
    return null;
  }

  // Search methods
  async searchMessages(userId: string, searchTerm: string): Promise<ChatMessage[]> {
    console.log('ChatApiService: Searching messages with term:', searchTerm);
    
    const response = await fetch(
      `${API_BASE_URL}/chat/search?query=${encodeURIComponent(searchTerm)}`,
      {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );

    return this.handleResponse<ChatMessage[]>(response);
  }

  // Stats methods
  async getChatStats(userId: string): Promise<ChatStats> {
    console.log('ChatApiService: Getting chat stats for user:', userId);
    
    const response = await fetch(
      `${API_BASE_URL}/chat/stats`,
      {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );

    return this.handleResponse<ChatStats>(response);
  }

  // Utility methods
  async deleteConversation(conversationId: string): Promise<void> {
    console.log('ChatApiService: Deleting conversation:', conversationId);
    
    await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );
  }

  async archiveConversation(conversationId: string): Promise<void> {
    console.log('ChatApiService: Archiving conversation:', conversationId);
    
    await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ isActive: false }),
      }
    );
  }

  // Helper method to create a new conversation for a listing
  async createListingConversation(
    listingId: string,
    buyerId: string,
    sellerId: string,
    listingTitle: string
  ): Promise<ChatConversation> {
    console.log('ChatApiService: Creating listing conversation for:', listingId);
    
    const participants = [
      {
        userId: buyerId,
        name: 'Buyer', // This should come from user profile
        avatar: '/images/vectors/profile1.png',
        role: 'buyer' as const,
        isOnline: false,
        lastSeen: new Date(),
        unreadCount: 0,
      },
      {
        userId: sellerId,
        name: 'Seller', // This should come from user profile
        avatar: '/images/vectors/profile2.png',
        role: 'seller' as const,
        isOnline: false,
        lastSeen: new Date(),
        unreadCount: 0,
      },
    ];

    // Use the new getOrCreateConversation method to prevent duplicates
    return this.getOrCreateConversation(participants, listingId);
  }

  /**
   * Get or create conversation between participants
   * This prevents duplicate conversations
   */
  async getOrCreateConversation(
    participants: { userId: string; name: string; avatar: string; role: 'buyer' | 'seller' | 'admin' }[],
    listingId?: string,
    subject?: string
  ): Promise<ChatConversation> {
    console.log('ChatApiService: getOrCreateConversation called with participants:', participants.map(p => p.userId));
    
    // First try to find existing conversation
    try {
      const existingConversation = await this.findExistingConversation(participants, listingId);
      if (existingConversation) {
        console.log('ChatApiService: Found existing conversation:', existingConversation.id);
        return existingConversation;
      }
    } catch (error) {
      console.log('ChatApiService: No existing conversation found, will create new one');
    }

    // If no existing conversation found, create a new one
    console.log('ChatApiService: Creating new conversation');
    return this.createConversation(participants, listingId);
  }

  /**
   * Find existing conversation between participants
   */
  private async findExistingConversation(
    participants: { userId: string }[],
    listingId?: string
  ): Promise<ChatConversation | null> {
    try {
      const participantIds = participants.map(p => p.userId).sort(); // Sort for consistent comparison
      console.log('ChatApiService: Looking for conversation with participants:', participantIds);
      
      // Get conversations for the first participant
      const userConversations = await this.getConversations(participantIds[0]);
      console.log('ChatApiService: Found', userConversations.length, 'conversations for user:', participantIds[0]);
      
      // Filter to find exact participant matches
      for (const conversation of userConversations) {
        // Check if listing matches (if listingId is provided)
        if (listingId && conversation.listingId !== listingId) {
          console.log('ChatApiService: Listing mismatch for conversation', conversation.id, 'expected:', listingId, 'got:', conversation.listingId);
          continue;
        }

        const conversationParticipantIds = conversation.participants.map(p => p.user_id).sort(); // Sort for consistent comparison
        console.log('ChatApiService: Checking conversation', conversation.id, 'participants:', conversationParticipantIds);
        
        // Check for exact participant match (same length and same elements)
        if (participantIds.length === conversationParticipantIds.length &&
            participantIds.every((id, index) => id === conversationParticipantIds[index])) {
          console.log('ChatApiService: Found exact participant match in conversation:', conversation.id);
          return conversation;
        }
      }

      console.log('ChatApiService: No existing conversation found with exact participants');
      return null;
    } catch (error) {
      console.error('ChatApiService: Error finding existing conversation:', error);
      return null;
    }
  }
}

export const chatApiService = new ChatApiService(); 