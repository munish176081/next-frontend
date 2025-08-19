"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ChatConversation, ChatMessage, ChatParticipant } from '@/_types/chat';
import { chatWebSocketService } from '@/_services/chat/chatWebSocketService';
import { chatApiService } from '@/_services/chat/chatApiService';
import { DashboardLayout } from '../common/dashboard-layout';
import { Avatar } from '../ui';
import { useFileUpload } from '@/_services/hooks/upload/use-file-upload';
import { UploadResult } from '@/_services/upload/upload-utils';

interface ChatInterfaceProps {
  userId: string;
  initialConversationId?: string;
  listingId?: string;
  onBack?: () => void;
}

interface AttachmentPreview {
  file: File;
  preview: string;
  type: 'image' | 'document';
  size: string;
}

// File type validation
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
};

const BLOCKED_FILE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'text/html',
  'application/x-executable',
  'application/x-msdownload'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ATTACHMENTS = 3;

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
  
  // Attachment related state
  const [attachmentPreviews, setAttachmentPreviews] = useState<AttachmentPreview[]>([]);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const currentConversationRef = useRef<ChatConversation | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sendingMessageRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload hook
  const { uploadFile, isUploading, progress } = useFileUpload({
    onSuccess: (result) => {
      console.log('✅ File uploaded successfully:', result);
    },
    onError: (error) => {
      console.error('❌ File upload failed:', error);
      setUploadingAttachments(false);
    }
  });


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
    console.log('💬 CHAT INTERFACE: Initial conversation effect triggered:', {
      initialConversationId,
      currentConversation: currentConversation?.id,
      userId
    });

    if (initialConversationId && initialConversationId !== 'new') {
      console.log('💬 CHAT INTERFACE: Loading initial conversation:', initialConversationId);
      loadConversation(initialConversationId);
    } else {
      console.log('💬 CHAT INTERFACE: No initial conversation to load');
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

  // Keep ref in sync with state to avoid stale closures in WebSocket handlers
  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

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
    console.log('📨 Received new message via WebSocket and currentConversation:', data, currentConversationRef.current);
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

    // Skip if this message was sent by the current user (already added locally)
    console.log('🔍 Checking message duplication: senderId=', normalizedMessage.senderId, 'userId=', userId, 'types:', typeof normalizedMessage.senderId, typeof userId);
    if (normalizedMessage.senderId === userId) {
      console.log('🔄 Skipping own message from WebSocket to prevent duplication');
      return;
    }

    // If this message is for the current conversation, add it to the UI
    if (data.conversationId === currentConversationRef.current?.id) {
      console.log('✅ Adding message from other user to current conversation UI');
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
      if (!currentConversationRef.current && conversations.length > 0) {
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
    if (data.conversationId !== currentConversationRef.current?.id) {
      console.log('🔄 Message for different conversation, consider refreshing conversations list');
    }
  };

  const handleUserTyping = (data: any) => {
    console.log('👥 Received typing indicator:', data);
    console.log('👥 Current conversation:', currentConversationRef.current?.id);
    console.log('👥 Data conversation:', data.conversationId);
    console.log('👥 Is typing:', data.isTyping);
    console.log('👥 User ID:', data.userId);

    if (data.conversationId === currentConversationRef.current?.id) {
      console.log('✅ Conversation matches, updating typing users');
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          console.log('📝 Adding user to typing list:', data.userId);
          newSet.add(data.userId);
        } else {
          console.log('📝 Removing user from typing list:', data.userId);
          newSet.delete(data.userId);
        }
        console.log('👥 New typing users set:', Array.from(newSet));
        return newSet;
      });
    } else {
      console.log('❌ Conversation ID mismatch, ignoring typing indicator');
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
    
    // Don't send empty message without attachments
    if (!content.trim() && attachmentPreviews.length === 0) return;
    
    // Prevent double submission
    if (sendingMessageRef.current) {
      console.log('🚫 Message sending already in progress, skipping duplicate call');
      return;
    }
    
    sendingMessageRef.current = true;
    setUploadingAttachments(true);

    try {
      console.log('Sending message:', content);
      console.log('Attachments to upload:', attachmentPreviews);

      let attachments: UploadResult[] = [];

      // Upload attachments if any
      if (attachmentPreviews.length > 0) {
        console.log('📎 Uploading attachments...');
        
        for (const preview of attachmentPreviews) {
          const fileType = preview.type === 'image' ? 'image' : 'document';
          
          // Upload each file using the upload-utils directly
          const uploadResult = await new Promise<UploadResult>((resolve, reject) => {
            import('@/_services/upload/upload-utils').then(({ uploadFile: directUpload }) => {
              directUpload(preview.file, fileType, (progress) => {
                console.log(`📊 Upload progress for ${preview.file.name}:`, progress);
              }).then(resolve).catch(reject);
            });
          });
          
          attachments.push(uploadResult);
        }
        
        console.log('✅ All attachments uploaded:', attachments);
      }

      // Determine message type
      const messageType = attachments.length > 0 
        ? (attachments.some(a => a.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? 'image' : 'file')
        : 'text';

      // Transform upload results to backend-expected format
      const transformedAttachments = attachments.map(uploadResult => ({
        type: uploadResult.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' as const : 'file' as const,
        url: uploadResult.finalUrl,
        name: uploadResult.fileName
        // Note: removing size field as backend validation rejects it
      }));

      console.log('📎 Transformed attachments for backend:', transformedAttachments);

      const newMessage = await chatApiService.sendMessage(currentConversation.id, {
        content: content || '', // Allow empty content if there are attachments
        messageType,
        attachments: transformedAttachments.length > 0 ? transformedAttachments : undefined
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
      console.log('🔍 Sender ID in local message:', normalizedMessage.senderId, 'Current user ID:', userId);

      // Add message to local state immediately
      setMessages(prev => {
        console.log('💬 Adding message locally (sent by user)');
        return [...prev, normalizedMessage];
      });

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

      // Clear attachments after successful send
      setAttachmentPreviews([]);
      setShowAttachmentPreview(false);

    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      // Reset the sending flag
      sendingMessageRef.current = false;
      setUploadingAttachments(false);
    }
  };

  const handleTyping = () => {
    console.log('🎯 handleTyping called, conversationId:', currentConversationRef.current?.id);
    console.log('🎯 WebSocket connected:', wsConnected);
    
    if (!currentConversationRef.current?.id) {
      console.log('❌ No conversation ID, skipping typing indicator');
      return;
    }

    // Notify that user is typing
    console.log('📝 Sending typing indicator (true)');
    chatWebSocketService.sendTyping(currentConversationRef.current.id, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to notify that user has stopped typing
    typingTimeoutRef.current = setTimeout(() => {
      if (currentConversationRef.current?.id) {
        console.log('📝 Sending typing indicator (false) - timeout');
        chatWebSocketService.sendTyping(currentConversationRef.current.id, false);
      }
    }, 2000); // 2 seconds timeout
  };

  // File validation utilities
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check blocked file types first
    if (BLOCKED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: `${file.name}: File type not allowed for security reasons` };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `${file.name}: File size exceeds 10MB limit` };
    }

    // Check if it's an allowed type
    const isImage = ALLOWED_FILE_TYPES.image.includes(file.type);
    const isDocument = ALLOWED_FILE_TYPES.document.includes(file.type);
    
    if (!isImage && !isDocument) {
      return { valid: false, error: `${file.name}: File type not supported` };
    }

    return { valid: true };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createFilePreview = (file: File): Promise<AttachmentPreview> => {
    return new Promise((resolve) => {
      const isImage = ALLOWED_FILE_TYPES.image.includes(file.type);
      
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            file,
            preview: e.target?.result as string,
            type: 'image',
            size: formatFileSize(file.size)
          });
        };
        reader.readAsDataURL(file);
      } else {
        // For documents, create a placeholder preview
        resolve({
          file,
          preview: '', // Will use file icon
          type: 'document',
          size: formatFileSize(file.size)
        });
      }
    });
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check total number of attachments
    if (attachmentPreviews.length + fileArray.length > MAX_ATTACHMENTS) {
      setError(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error!);
      }
    }

    // Show errors if any
    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    // Create previews for valid files
    if (validFiles.length > 0) {
      const newPreviews = await Promise.all(
        validFiles.map(file => createFilePreview(file))
      );
      
      setAttachmentPreviews(prev => [...prev, ...newPreviews]);
      setShowAttachmentPreview(true);
      setError(null);
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  // Remove attachment from preview
  const removeAttachment = (index: number) => {
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
    if (attachmentPreviews.length === 1) {
      setShowAttachmentPreview(false);
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

  // Helper function to group messages by date
  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp).toDateString();
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup.date === messageDate) {
        lastGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message]
        });
      }
    });
    
    return groups;
  };

  // Helper function to format date for separator
  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // const MessageCard = ({ name, avatar, online, unreadCount, time, color, text, unread }: { name: string, avatar: string, online: boolean, unreadCount: number, time: string, color: string, text: string, unread: boolean }) => (
  //   <div onClick={() => setIsVisible(true)} className={`flex flex-col ${online ? "bg-[#F4F2F6] border-r-[#B699CA]" : "border-r-transparent"} pr-12 p-4 gap-1 border-r-[6px] border-b border-b-black/20 relative`}>
  //     <div className="flex gap-2 font-medium items-center relative">
  //       <span className="size-2.5 rounded-full absolute left-[32px] bottom-[6px] border border-white" style={{ backgroundColor: color }}></span>
  //       <span className="size-10 rounded-full overflow-hidden"><img className="w-full h-full object-cover" src={avatar} alt={name} /></span>
  //       {name}
  //       {unreadCount > 0 && (
  //         <span className="size-5 rounded-full bg-[#EE5D50] flex items-center justify-center text-[8px] text-white">{unreadCount}</span>
  //       )}
  //     </div>
  //     <span className={`text-sm whitespace-nowrap text-ellipsis block overflow-hidden ${!unread ? 'text-[#888787]' : ''}`}>{text}</span>
  //     <span className="flex text-[#ADA7A7] flex-col absolute right-3 h-full gap-6">{time}<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.51475 13.3597C1.55872 13.6276 1.81152 13.8091 2.0794 13.7651L6.44474 13.0486C6.71262 13.0046 6.89413 12.7518 6.85016 12.4839C6.80619 12.2161 6.55339 12.0345 6.28551 12.0785L2.40521 12.7154L1.76831 8.83511C1.72434 8.56723 1.47154 8.38572 1.20366 8.42969C0.935779 8.47366 0.754264 8.72646 0.798233 8.99434L1.51475 13.3597ZM10.6188 0.433292L1.60052 12.9934L2.39905 13.5667L11.4173 1.00665L10.6188 0.433292Z" fill={color}/></svg></span>
  //   </div>
  // );

  // Simple MessageCard component based on your design
  const MessageCard = ({ conversation }: { conversation: ChatConversation }) => {
    const otherParticipant = conversation.participants.find(p => p.user_id !== userId);
    const lastMessage = conversation.lastMessage;
    const isActive = currentConversation?.id === conversation.id;
    const isHighlighted = isActive || conversation.unreadCount > 0;

    return (
      <div
        onClick={() => handleConversationSelect(conversation)}
        className={`flex flex-col ${isHighlighted ? "bg-[#F4F2F6] border-r-[#B699CA]" : "border-r-transparent"} pr-12 p-4 gap-1 border-r-[6px] border-b border-b-black/20 relative cursor-pointer hover:bg-gray-50`}
      >
        <div className="flex gap-2 font-medium items-center relative">
          <span className={`size-2.5 rounded-full absolute left-[32px] bottom-[6px] border border-white ${otherParticipant?.isOnline ? 'bg-[#74D27E]' : 'bg-[#CFCFCF]'}`}></span>
          <span className="size-10 rounded-full overflow-hidden">
            {/* <img className="w-full h-full object-cover" src={otherParticipant?.avatar || <Avatar
              className="cursor-pointer !text-3xl "
              name={otherParticipant?.name || 'Unknown User'}
              src={otherParticipant?.avatar || ''}
              rounded="full"
              textSizeRatio={3}
              size="100%"
            />} alt={otherParticipant?.name || 'User'} /> */}
            <Avatar
              className="cursor-pointer !text-3xl w-full h-full object-cover"
              name={otherParticipant?.name || 'Unknown User'}
              src={otherParticipant?.avatar || ''}
              rounded="full"
              textSizeRatio={3}
              size="100%"
            />
          </span>
          <span className="font-semibold">{otherParticipant?.name || 'Unknown User'}</span>
          {conversation.unreadCount > 0 && (
            <span className="size-5 rounded-full bg-[#EE5D50] flex items-center justify-center text-[8px] text-white font-bold">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <span className={`text-sm whitespace-nowrap text-ellipsis block overflow-hidden ${isHighlighted ? 'text-black' : 'text-[#888787]'}`}>
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
    <DashboardLayout title="Inbox" showTimeFilter={false}>
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
                            {/* Simple Chat Header - Matching Static Design */}
              <div className="flex gap-4 border-b border-black/20 p-4 items-center">
                <div className="flex gap-4 font-semibold items-center relative text-[22px] max-md:text-base">
                  <span className="size-6 max-md:size-4 absolute max-md:left-[20px] left-[42px] -top-1">
                    <img src="/images/vectors/blueTick.png" alt="" />
                  </span>
                  <span className={`size-4 max-md:size-2 rounded-full absolute max-md:left-[24px] left-[46px] bottom-[4px] border border-white ${currentConversation.participants.find(p => p.user_id !== userId)?.isOnline ? 'bg-[#74D27E]' : 'bg-[#CFCFCF]'}`}></span>
                  <span className="w-[60px] h-[60px] max-md:w-[30px] max-md:h-[30px] rounded-full overflow-hidden">
                    <Avatar
                      className="cursor-pointer !text-3xl w-full h-full object-cover"
                      name={currentConversation.participants.find(p => p.user_id !== userId)?.name || 'Unknown User'}
                      src={currentConversation.participants.find(p => p.user_id !== userId)?.avatar || ''}
                      rounded="full"
                      textSizeRatio={3}
                      size="100%"
                    />
                  </span>
                  {currentConversation.participants.find(p => p.user_id !== userId)?.name || 'Unknown User'}
                </div>
                <span className="text-[12px] ml-auto font-semibold h-11 px-4 gap-1 border border-[#CBCACA] rounded-full flex items-center justify-center max-md:hidden">
                  <img src="/images/vectors/doubleTick.png" alt="" /> Mark As Read
                </span>
                <span className="text-[32px] font-semibold h-11 w-11 max-md:w-7 max-md:h-7 border border-[#CBCACA] rounded-full flex items-center justify-center max-md:ml-auto">
                  <img className="max-md:w-2.5" src="/images/vectors/3dots.png" alt="" />
                </span>
              </div>

              {/* Messages */}
              <div 
                className={`flex w-full h-full max-h-[576px] max-md:max-h-fit p-4 flex-col gap-6 overflow-y-auto mb-6 relative ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {/* Drag overlay */}
                {isDragOver && (
                  <div className="absolute inset-0 bg-blue-50/90 flex items-center justify-center z-50 pointer-events-none rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📎</div>
                      <p className="text-lg font-semibold text-blue-600">Drop files here</p>
                      <p className="text-sm text-blue-500">Max 3 files, 10MB each</p>
                    </div>
                  </div>
                )}
                {/* Centered User Profile Section - Matching Static Design */}
                <div className="flex flex-col items-center min-h-[175px] max-md:gap-1">
                  <div className="relative flex">
                    <span className="size-6 absolute left-[42px] -top-1 max-md:hidden">
                      <img src="/images/vectors/blueTick.png" alt="" />
                    </span>
                    <span className={`size-4 rounded-full absolute left-[46px] bottom-[4px] border border-white ${currentConversation.participants.find(p => p.user_id !== userId)?.isOnline ? 'bg-[#74D27E]' : 'bg-[#CFCFCF]'}`}></span>
                    <span className="w-[60px] h-[60px] min-w-[60px] rounded-full overflow-hidden">
                      <Avatar
                        className="cursor-pointer !text-3xl w-full h-full object-cover"
                        name={currentConversation.participants.find(p => p.user_id !== userId)?.name || 'Unknown User'}
                        src={currentConversation.participants.find(p => p.user_id !== userId)?.avatar || ''}
                        rounded="full"
                        textSizeRatio={3}
                        size="100%"
                      />
                    </span>
                  </div>
                  <span className="text-[20px] font-semibold mt-2 max-md:mt-1">
                    {currentConversation.participants.find(p => p.user_id !== userId)?.name || 'Unknown User'} (
                    <text className="text-base text-[#8B8B8B] font-normal">
                      {currentConversation.participants.find(p => p.user_id !== userId)?.role === 'buyer' ? 'Buyer' : 
                       currentConversation.participants.find(p => p.user_id !== userId)?.role === 'seller' ? 'Seller' : 'User'}
                    </text>)
                  </span>
                  <span className="text-base text-[#8B8B8B] font-medium">
                    Joined on {(() => {
                      const otherParticipant = currentConversation.participants.find(p => p.user_id !== userId);
                      const joinDate = currentConversation.metadata?.participants && otherParticipant?.role === 'buyer' ? 
                        currentConversation.metadata.participants.buyer?.joinedPlatform : 
                        currentConversation.metadata?.participants?.seller?.joinedPlatform;
                      return joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
                    })()}
                  </span>
                  {/* Always show current inquiry section with fallback */}
                  <span className="text-sm text-[#8B8B8B] font-medium text-center max-md:leading-loose">
                    Current Inquiry: {currentConversation.metadata?.listingDetails?.title || 'General Inquiry'} - 
                    <u className="text-black">
                      Listing ID {currentConversation.metadata?.listingDetails?.id?.slice(-8) || 
                                  currentConversation.listingId?.slice(-8) || 
                                  'GR-2025-001'}
                    </u>
                  </span>
                  <span className="text-sm text-[#8B8B8B] font-medium flex items-center gap-1">
                    <span className={`size-4 rounded-full border border-white ${currentConversation.participants.find(p => p.user_id !== userId)?.isOnline ? 'bg-[#74D27E]' : 'bg-[#CFCFCF]'}`}></span> 
                    {currentConversation.participants.find(p => p.user_id !== userId)?.isOnline ? 'Active' : 'Offline'}
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full gap-6">
                    {groupMessagesByDate(messages).map((group, groupIndex) => (
                      <div key={`group-${groupIndex}`} className="flex flex-col gap-6">
                        {/* Date Separator - Matching Static Design */}
                        {groupIndex > 0 && (
                          <div className="flex items-center justify-center relative">
                            <span className="text-sm font-semibold text-[#878787] px-4 py-2 flex relative z-10 bg-white border-2 border-[#CBCACA] rounded-full">
                              {formatDateSeparator(group.date)}
                            </span>
                            <hr className="bg-red-300 absolute w-full h-px" />
                          </div>
                        )}
                        
                        {/* Messages for this date */}
                        {group.messages.map((message) => (
                          <div key={message.id} className={`flex flex-col relative ${message.senderId === userId ? 'pr-20 ml-auto' : 'pl-20'} w-full max-w-[650px] max-md:${message.senderId === userId ? 'pr-12' : 'pl-12'}`}>
                            <span className={`w-[60px] h-[60px] max-md:w-[30px] max-md:h-[30px] rounded-full overflow-hidden absolute ${message.senderId === userId ? 'right-0' : 'left-0'} bottom-0`}>
                              <Avatar
                                className="cursor-pointer !text-3xl w-full h-full object-cover"
                                name={message.senderId === userId ?  currentConversation.participants.find(p => p.user_id === userId)?.name : currentConversation.participants.find(p => p.user_id !== userId)?.name || 'Unknown User'}
                                src={message.senderId === userId ? currentConversation.participants.find(p => p.user_id === userId)?.avatar : currentConversation.participants.find(p => p.user_id !== userId)?.avatar || ''}
                                rounded="full"
                                textSizeRatio={3}
                                size="100%"
                              />
                            </span>
                            <span className={`text-[#8B8B8B] font-medium flex gap-2 max-md:text-sm ${message.senderId === userId ? 'ml-auto mr-6' : 'ml-6'}`}>
                              {message.senderId === userId ? (
                                <>
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  <strong className="font-medium">Seen</strong>
                                </>
                              ) : (
                                <>
                                  <strong className="font-semibold">{currentConversation.participants.find(p => p.user_id !== userId)?.name}</strong>
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </>
                              )}
                            </span>
                            <div className={`flex rounded-40 ${message.messageType === 'listing' && message.listingReference ? 'flex-col gap-3' : 'flex-col'} max-md:rounded-[20px] bg-[#F4F2F6] p-6 max-md:p-4 relative ${message.senderId === userId ? 'before:w-0 before:h-0 before:border-t-[12px] before:border-t-transparent before:border-b-[12px] before:border-b-transparent before:border-r-[20px] before:border-r-[#F4F2F6] before:absolute before:bottom-[5px] before:-right-[6px] before:-rotate-[30deg]' : 'before:w-0 before:h-0 before:border-t-[12px] before:border-t-transparent before:border-b-[12px] before:border-b-transparent before:border-r-[20px] before:border-r-[#F4F2F6] before:absolute before:bottom-[5px] before:-left-[10px] before:-rotate-[26deg]'}`}>
                              {/* Enhanced Listing Card - Matching Static Design - Show first for listing messages */}
                              {message.messageType === 'listing' && message.listingReference && (
                                <div className="flex bg-white rounded-[20px] border-l-[16px] max-md:border-l-8 border-l-[#EFC951] p-4 w-full gap-4 max-md:flex-col-reverse">
                                  <div className="flex flex-col justify-between">
                                    <span className="text-2xl font-medium max-md:flex-col max-md:flex max-md:text-lg">
                                      {message.listingReference.title} 
                                      <text className="text-base max-md:text-sm text-[#736E6E]"> {message.listingReference.location}</text>
                                    </span>
                                    <span className="text-[#A6A4A4] text-sm max-md:mt-2">
                                      A gentle and playful {message.listingReference.title.split(' ')[0]} pup, 
                                      fully vaccinated and ready to join your family.
                                    </span>
                                    <span className="text-[22px] max-md:mt-2">${message.listingReference.price?.toLocaleString()}</span>
                                  </div>
                                  {message.listingReference.image && (
                                    <span className="w-[127px] min-w-[127px] rounded-xl h-[110px] max-md:w-full max-md:h-auto max-md:min-w-full overflow-hidden relative">
                                      <div className="absolute max-md:w-20 max-md:h-20 w-10 h-10 z-10 flex items-center justify-center">
                                        <span className="bg-yellow-400 max-md:text-sm font-semibold text-black -rotate-45 whitespace-nowrap px-10 block text-center w-min text-[8px]">
                                          Litter Listing
                                        </span>
                                      </div>
                                      <img 
                                        className="w-full h-full object-cover" 
                                        src={message.listingReference.image} 
                                        alt={message.listingReference.title} 
                                      />
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="flex flex-col gap-2 mb-2">
                                  {message.attachments.map((attachment: any, attachIndex: number) => {
                                    const isImage = attachment.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || attachment.type === 'image';
                                    
                                    return (
                                      <div key={attachIndex} className="relative">
                                        {isImage ? (
                                          // Image attachment
                                          <div className="relative max-w-sm rounded-lg overflow-hidden border">
                                            <img 
                                              src={attachment.url} 
                                              alt={attachment.name}
                                              className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                              onClick={() => window.open(attachment.url, '_blank')}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                                              <p className="text-xs truncate">{attachment.name}</p>
                                            </div>
                                          </div>
                                        ) : (
                                          // Document attachment
                                          <div 
                                            className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors max-w-sm"
                                            onClick={() => window.open(attachment.url, '_blank')}
                                          >
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                              <span className="text-lg">
                                                {attachment.name?.endsWith('.pdf') ? '📄' : 
                                                 attachment.name?.match(/\.(doc|docx)$/i) ? '📝' : 
                                                 attachment.name?.match(/\.(xls|xlsx)$/i) ? '📊' : 
                                                 attachment.name?.match(/\.(ppt|pptx)$/i) ? '📈' : '📎'}
                                              </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium text-sm truncate text-gray-800">{attachment.name}</p>
                                              <p className="text-xs text-gray-500">
                                                {attachment.size ? formatFileSize(attachment.size) : 'Click to download'}
                                              </p>
                                            </div>
                                            <div className="flex-shrink-0 text-blue-600">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {/* Message Content */}
                              {message.content && (
                                <span className="text-[#4A4A4A] font-medium text-[18px] max-md:text-sm">{message.content}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
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
                  onChange={handleTyping}
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
                  <input 
                    ref={fileInputRef}
                    className="absolute w-full h-full top-0 left-0 cursor-pointer opacity-0" 
                    type="file" 
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files);
                        e.target.value = ''; // Reset input
                      }
                    }}
                  />
                  <img className='max-md:max-h-4' src="/images/vectors/attachment.png" alt="Attach files" />
                </span>
                <span className="h-full w-16 max-md:w-7 max-md:min-w-7 min-w-16 flex items-center justify-center relative">
                  <img className='max-md:max-h-4' src="/images/vectors/smile.png" alt="" />
                </span>
                <hr className="bg-black/20 flex h-12 w-0.5 ml-4 max-md:ml-2" />
                <span 
                  className="h-full w-24 max-md:w-10 max-md:min-w-10 min-w-24 flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Type something..."]') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      handleSendMessage(input.value.trim());
                      input.value = '';
                    }
                  }}
                >
                  <img className='max-md:h-6' src="/images/vectors/sendBtn.png" alt="Send" />
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

      {/* Attachment Preview Modal - WhatsApp Style */}
      {showAttachmentPreview && attachmentPreviews.length > 0 && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {attachmentPreviews.length} file{attachmentPreviews.length > 1 ? 's' : ''} selected
              </h3>
              <button 
                onClick={() => {
                  setShowAttachmentPreview(false);
                  setAttachmentPreviews([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Attachments Preview */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {attachmentPreviews.map((attachment, index) => (
                  <div key={index} className="border rounded-lg p-3 flex items-center gap-3">
                    {/* File Preview */}
                    <div className="flex-shrink-0">
                      {attachment.type === 'image' ? (
                        <img 
                          src={attachment.preview} 
                          alt={attachment.file.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-2xl">
                            {attachment.file.name.endsWith('.pdf') ? '📄' : 
                             attachment.file.name.match(/\.(doc|docx)$/i) ? '📝' : 
                             attachment.file.name.match(/\.(xls|xlsx)$/i) ? '📊' : 
                             attachment.file.name.match(/\.(ppt|pptx)$/i) ? '📈' : '📎'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{attachment.file.name}</p>
                      <p className="text-xs text-gray-500">{attachment.size}</p>
                      <p className="text-xs text-gray-400 capitalize">{attachment.file.type.split('/')[1]} file</p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeAttachment(index)}
                      className="flex-shrink-0 text-red-500 hover:text-red-700 p-1"
                      title="Remove file"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Message Input */}
            <div className="p-4 border-t">
              <input
                type="text"
                placeholder="Add a message (optional)..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    handleSendMessage(target.value);
                    target.value = '';
                  }
                }}
              />
            </div>

            {/* Progress Indicator */}
            {(uploadingAttachments || isUploading) && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">
                    {progress ? `Uploading... ${Math.round(progress.progress)}%` : 'Preparing upload...'}
                  </span>
                </div>
                {progress && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowAttachmentPreview(false);
                  setAttachmentPreviews([]);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const messageInput = document.querySelector('input[placeholder="Add a message (optional)..."]') as HTMLInputElement;
                  const message = messageInput?.value || '';
                  handleSendMessage(message);
                  if (messageInput) messageInput.value = '';
                }}
                disabled={uploadingAttachments || isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingAttachments || isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>📎</span>
                    Send {attachmentPreviews.length} file{attachmentPreviews.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}; 