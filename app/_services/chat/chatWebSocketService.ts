import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  conversationId: string;
  message: any;
  senderId: string;
  timestamp: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface ReadReceipt {
  conversationId: string;
  userId: string;
  username: string;
  messageIds: string[];
  readAt: Date;
}

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}

class ChatWebSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners = new Map<string, Set<Function>>();

  constructor() {
    this.setupReconnection();
  }

  async connect(sessionId: string): Promise<boolean> {
    if (this.socket?.connected || this.isConnecting) {
      console.log('ChatWebSocketService: Already connected or connecting, returning true');
      return true;
    }

    try {
      this.isConnecting = true;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      console.log('ChatWebSocketService: Connecting to WebSocket at:', backendUrl);
      console.log('ChatWebSocketService: Using session ID:', sessionId);

      this.socket = io(backendUrl, {
        auth: { sessionId },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventHandlers();
      
      return new Promise((resolve) => {
        this.socket!.on('connect', () => {
          console.log('ChatWebSocketService: ✅ Connected to WebSocket successfully!');
          console.log('ChatWebSocketService: Socket ID:', this.socket!.id);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve(true);
        });

        this.socket!.on('connect_error', (error) => {
          console.error('ChatWebSocketService: ❌ Connection error:', error);
          console.error('ChatWebSocketService: Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          this.isConnecting = false;
          resolve(false);
        });

        this.socket!.on('error', (error) => {
          console.error('ChatWebSocketService: ❌ Socket error:', error);
        });

        this.socket!.on('disconnect', (reason) => {
          console.log('ChatWebSocketService: 🔌 Disconnected from WebSocket, reason:', reason);
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.isConnecting) {
            console.log('ChatWebSocketService: ⏰ Connection timeout after 10 seconds');
            this.isConnecting = false;
            resolve(false);
          }
        }, 10000);
      });

    } catch (error) {
      console.error('ChatWebSocketService: ❌ Connection failed with exception:', error);
      this.isConnecting = false;
      return false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      console.log('ChatWebSocketService: Disconnecting from WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('ChatWebSocketService: Connected to WebSocket');
      this.emit('connection_status_change', true);
    });

    this.socket.on('disconnect', () => {
      console.log('ChatWebSocketService: Disconnected from WebSocket');
      this.emit('connection_status_change', false);
      this.emit('disconnected', {});
    });

    this.socket.on('error', (error) => {
      console.error('ChatWebSocketService: WebSocket error:', error);
      this.emit('error', error);
    });

    // Chat events
    this.socket.on('new_message', (data: WebSocketMessage) => {
      console.log('ChatWebSocketService: Received new message:', data);
      this.emit('new_message', data);
    });

    this.socket.on('message_sent', (data: { conversationId: string; message: any; timestamp: Date }) => {
      console.log('ChatWebSocketService: Message sent confirmation:', data);
      this.emit('message_sent', data);
    });

    this.socket.on('user_typing', (data: TypingIndicator) => {
      console.log('ChatWebSocketService: User typing indicator:', data);
      this.emit('user_typing', data);
    });

    this.socket.on('messages_read', (data: ReadReceipt) => {
      console.log('ChatWebSocketService: Messages read receipt:', data);
      this.emit('messages_read', data);
    });

    this.socket.on('user_status_changed', (data: UserStatus) => {
      console.log('ChatWebSocketService: User status changed:', data);
      this.emit('user_status_changed', data);
    });

    // Room events
    this.socket.on('joined_conversation', (data: { conversationId: string }) => {
      console.log('ChatWebSocketService: Joined conversation:', data);
      this.emit('joined_conversation', data);
    });

    this.socket.on('left_conversation', (data: { conversationId: string }) => {
      console.log('ChatWebSocketService: Left conversation:', data);
      this.emit('left_conversation', data);
    });
  }

  private setupReconnection(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('ChatWebSocketService: Network online, attempting reconnection...');
        this.attemptReconnection();
      });

      window.addEventListener('focus', () => {
        if (!this.socket?.connected && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log('ChatWebSocketService: Window focused, attempting reconnection...');
          this.attemptReconnection();
        }
      });
    }
  }

  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('ChatWebSocketService: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`ChatWebSocketService: Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    // Get session ID from localStorage or cookies
    const sessionId = this.getSessionId();
    if (!sessionId) {
      console.log('ChatWebSocketService: No session ID available for reconnection');
      return;
    }

    setTimeout(async () => {
      const success = await this.connect(sessionId);
      if (!success) {
        this.attemptReconnection();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private getSessionId(): string | null {
    // Try to get session ID from various sources
    if (typeof window !== 'undefined') {
      // Check cookies first - this is how the backend session system works
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'connect.sid') {
          return value;
        }
      }
      
      // Check localStorage as fallback
      const localSessionId = localStorage.getItem('sessionId');
      if (localSessionId) return localSessionId;
    }
    return null;
  }

  // Room management
  async joinConversation(conversationId: string): Promise<void> {
    if (!this.socket?.connected) {
      console.warn('ChatWebSocketService: Cannot join conversation, not connected');
      return;
    }

    console.log('ChatWebSocketService: Joining conversation:', conversationId);
    this.socket.emit('join_conversation', { conversationId });
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (!this.socket?.connected) {
      console.warn('ChatWebSocketService: Cannot leave conversation, not connected');
      return;
    }

    console.log('ChatWebSocketService: Leaving conversation:', conversationId);
    this.socket.emit('leave_conversation', { conversationId });
  }

  // Typing indicators
  async sendTyping(conversationId: string, isTyping: boolean): Promise<void> {
    console.log('🔌 ChatWebSocketService: sendTyping called with:', { conversationId, isTyping });
    console.log('🔌 Socket connected:', this.socket?.connected);
    
    if (!this.socket?.connected) {
      console.warn('ChatWebSocketService: Cannot send typing indicator, not connected');
      return;
    }
    
    console.log('🔌 Emitting typing event to server');
    this.socket.emit('typing', { conversationId, isTyping });
  }

  // Read receipts
  async markMessagesAsRead(conversationId: string, messageIds: string[]): Promise<void> {
    if (!this.socket?.connected) {
      console.warn('ChatWebSocketService: Cannot send read receipt, not connected');
      return;
    }

    this.socket.emit('mark_read', { conversationId, messageIds });
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('ChatWebSocketService: Error in event listener:', error);
        }
      });
    }
  }

  // Utility methods
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.socket?.connected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const chatWebSocketService = new ChatWebSocketService(); 