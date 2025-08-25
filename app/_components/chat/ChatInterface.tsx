"use client";
import React, { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { ChatConversation, ChatMessage, ChatParticipant } from '@/_types/chat';
import { chatWebSocketService } from '@/_services/chat/chatWebSocketService';
import { chatApiService } from '@/_services/chat/chatApiService';
import { DashboardLayout } from '../common/dashboard-layout';
import { Avatar } from '../ui';
import { useFileUpload } from '@/_services/hooks/upload/use-file-upload';
import { UploadResult } from '@/_services/upload/upload-utils';
import { ArrowDown, ArrowDownIcon } from 'lucide-react';

interface ChatInterfaceProps {
  userId: string;
  initialConversationId?: string;
  listingId?: string;
  onBack?: () => void;
}

interface AttachmentPreview {
  file: File;
  preview: string;
  type: 'image' | 'document' | 'voice';
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
  ],
  voice: ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg']
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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Typing indicators for all conversations - use ref to prevent unnecessary re-renders
  const [conversationTypingStates, setConversationTypingStates] = useState<Map<string, Set<string>>>(new Map());
  const conversationTypingStatesRef = useRef<Map<string, Set<string>>>(new Map());

  // Track processed messages to prevent duplicates
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<string>>(new Set());

  // Attachment related state
  const [attachmentPreviews, setAttachmentPreviews] = useState<AttachmentPreview[]>([]);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState<boolean>(false);

  // Smart scrolling state
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // New conversation notification state
  const [showNewConversationNotification, setShowNewConversationNotification] = useState(false);
  const [newConversationInfo, setNewConversationInfo] = useState<{ id: string; senderName: string } | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [lastRecordingDuration, setLastRecordingDuration] = useState(0); // Preserve duration for preview
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showRecordingOverlay, setShowRecordingOverlay] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showAudioPreview, setShowAudioPreview] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const currentConversationRef = useRef<ChatConversation | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sendingMessageRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousMessageCountRef = useRef<number>(0);

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

  // Smart scrolling functions
  const checkIfUserAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;

    const container = messagesContainerRef.current;
    const threshold = 20; // Reduced threshold to 20px for more responsive detection

    const scrollPosition = container.scrollTop;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const distanceFromBottom = maxScroll - scrollPosition;

    const isAtBottom = distanceFromBottom < threshold;

    console.log('🔍 Scroll position check:', {
      scrollTop: scrollPosition,
      maxScroll,
      distanceFromBottom,
      threshold,
      isAtBottom,
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight
    });

    setIsUserAtBottom(isAtBottom);
    return isAtBottom;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    console.log('🔽 scrollToBottom called with behavior:', behavior);
    console.log('🔽 messagesEndRef current:', messagesEndRef.current);
    console.log('🔽 messagesContainerRef current:', messagesContainerRef.current);

    if (messagesContainerRef.current) {
      console.log('🔽 Scrolling messagesContainer to bottom');
      const container = messagesContainerRef.current;
      const targetScrollTop = container.scrollHeight - container.clientHeight;

      if (behavior === 'smooth') {
        // Smooth scrolling
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      } else {
        // Instant scrolling
        container.scrollTop = targetScrollTop;
      }

      setShowNewMessageIndicator(false);
      setHasNewMessages(false);
      console.log('🔽 Scroll completed to position:', targetScrollTop);
    } else if (messagesEndRef.current) {
      console.log('🔽 Fallback: Using scrollIntoView on messagesEndRef');
      messagesEndRef.current.scrollIntoView({ behavior });
      setShowNewMessageIndicator(false);
      setHasNewMessages(false);
    } else {
      console.log('🔽 No refs available for scrolling');
    }
  }, []);

  // Mark messages as read when they come into view
  const markVisibleMessagesAsRead = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const messageElements = container.querySelectorAll('[data-message-id]');

    messageElements.forEach((messageElement) => {
      const messageId = messageElement.getAttribute('data-message-id');
      if (!messageId) return;

      const rect = messageElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Check if message is visible in the container
      if (rect.top >= containerRect.top && rect.bottom <= containerRect.bottom) {
        // Message is visible, mark as read if it's from another user and not already read
        const message = messages.find((m: ChatMessage) => m.id === messageId);
        if (message && message.senderId !== userId && !message.isRead) {
          markMessageAsRead(messageId);
        }
      }
    });
  }, [userId, messages, currentConversation]);

  // Check scroll position when messages change
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      console.log('📱 Messages changed, checking scroll position');
      const isAtBottom = checkIfUserAtBottom();
      console.log('📱 Initial scroll check result:', isAtBottom);
    }
  }, [messages, checkIfUserAtBottom]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Prevent scroll event from bubbling up to parent page
    e.stopPropagation();

    console.log('🔄 Scroll event triggered');

    const isAtBottom = checkIfUserAtBottom();

    console.log('🔄 Scroll result - isAtBottom:', isAtBottom);

    // If user scrolled to bottom, hide the new message indicator
    if (isAtBottom && showNewMessageIndicator) {
      setShowNewMessageIndicator(false);
      setHasNewMessages(true);
    }

    // Update the user's scroll position state
    setIsUserAtBottom(isAtBottom);

    // Mark visible messages as read when scrolling
    markVisibleMessagesAsRead();
  }, [checkIfUserAtBottom, showNewMessageIndicator, markVisibleMessagesAsRead]);

  // Handle new messages with smart scrolling
  const handleNewMessages = useCallback((newMessages: ChatMessage[]) => {
    const wasAtBottom = checkIfUserAtBottom();
    console.log('🎯 new messages debug:', newMessages);
    console.log('🔍 Current processed message IDs:', Array.from(processedMessageIds));

    // Filter out messages that might have already been processed via WebSocket
    const uniqueNewMessages = newMessages.filter(newMsg => {
      // Check if this message already exists in the current messages array
      const messageExists = messages.some(existingMsg => existingMsg.id === newMsg.id);
      if (messageExists) {
        console.log('⚠️ Skipping duplicate message (already in messages):', newMsg.id);
        return false;
      }

      // Check if this message has already been processed via WebSocket
      const alreadyProcessed = processedMessageIds.has(newMsg.id);
      if (alreadyProcessed) {
        console.log('⚠️ Skipping duplicate message (already processed via WebSocket):', newMsg.id);
        return false;
      }

      console.log('✅ Message is unique and will be processed:', newMsg.id);
      return true;
    });

    // If all messages were already processed via WebSocket, don't update conversations
    if (newMessages.length > 0 && uniqueNewMessages.length === 0) {
      console.log('🚫 All messages were already processed via WebSocket, skipping conversation list update');
      return;
    }

    if (uniqueNewMessages.length === 0) {
      console.log('⚠️ No unique new messages to process');
      return;
    }

    console.log('✅ Processing unique new messages:', uniqueNewMessages.length);
    const hasNewIncomingMessages = uniqueNewMessages.some(msg => msg.senderId !== userId);

    if (hasNewIncomingMessages) {
      if (wasAtBottom) {
        // User is at bottom, auto-scroll to show new message
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      } else {
        // User is scrolled up, show indicator
        setShowNewMessageIndicator(true);
        setHasNewMessages(true);
      }
    }
  }, [checkIfUserAtBottom, scrollToBottom, userId, messages, processedMessageIds]);

  // Function to join all conversation rooms
  const joinAllConversationRooms = useCallback(() => {
    if (wsConnected && conversations.length > 0) {
      console.log('🚪 Joining all conversation rooms:', conversations.length);

      // Track which conversations we've already joined to prevent duplicates
      const joinedConversations = new Set();

      conversations.forEach((conversation, index) => {
        if (joinedConversations.has(conversation.id)) {
          console.log(`🚪 [${index + 1}/${conversations.length}] Skipping duplicate join for conversation:`, conversation.id);
          return;
        }

        console.log(`🚪 [${index + 1}/${conversations.length}] Joining room for conversation:`, conversation.id);
        chatWebSocketService.joinConversation(conversation.id);
        joinedConversations.add(conversation.id);
      });

      console.log('🚪 All conversation rooms joined');
    }
  }, [wsConnected, conversations, chatWebSocketService]);

  // Function to handle new conversations being added
  const handleNewConversation = useCallback((conversationId: string) => {
    console.log('🚪 New conversation detected, joining room:', conversationId);
    if (wsConnected) {
      chatWebSocketService.joinConversation(conversationId);
    }
  }, [wsConnected, chatWebSocketService]);



  // Handle WebSocket new message with smart scrolling
  const handleWebSocketNewMessage = useCallback((data: any) => {
    console.log('🔴 DEBUG: new_message event received!', data);

    // Mark this message as processed to prevent duplicate handling
    const messageId = data.message.id;

    // Check if message was already processed
    if (processedMessageIds.has(messageId)) {
      console.log('⚠️ Message already processed, skipping:', messageId);
      return;
    }

    setProcessedMessageIds(prev => new Set(prev).add(messageId));
    console.log('✅ Message marked as processed:', messageId);

    // Check if user is at bottom before adding the message
    const wasAtBottom = checkIfUserAtBottom();

    // Add the message to state ONLY if it's for the currently active conversation
    if (data.conversationId === currentConversationRef.current?.id) {
      console.log('💬 Adding message to active conversation:', messageId);
      setMessages(prev => {
        const normalizedMessage = {
          id: messageId,
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

        const newMessages = [...prev, normalizedMessage];

        // If user was at bottom, auto-scroll to show new message
        if (wasAtBottom && data.message.sender_id !== userId) {
          setTimeout(() => scrollToBottom('smooth'), 100);
        } else if (data.message.sender_id !== userId) {
          // User is scrolled up, show indicator
          setShowNewMessageIndicator(true);
          setHasNewMessages(true);
        }

        return newMessages;
      });
    } else {
      console.log('💬 Message received for non-active conversation:', data.conversationId);
      // Update conversation list to reflect new message and unread count
      setConversations(prev => {
        console.log('🔄 Updating conversation list for non-active conversation:', data.conversationId);
        console.log('🔄 Previous unread count:', prev.find(c => c.id === data.conversationId)?.unreadCount);
        console.log('🔄 Current conversations state:', prev.map(c => ({ id: c.id, unreadCount: c.unreadCount })));

        return prev.map(conv => {
          if (conv.id === data.conversationId) {
            const newUnreadCount = (conv.unreadCount || 0) + 1;
            console.log('🔄 New unread count will be:', newUnreadCount);
            console.log('🔄 Updating conversation:', conv.id, 'from', conv.unreadCount, 'to', newUnreadCount);

            // Update the conversation with new message info
            return {
              ...conv,
              lastMessage: {
                id: messageId,
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
              },
              updatedAt: data.message.timestamp || new Date(),
              unreadCount: newUnreadCount
            };
          }
          return conv;
        });
      });
    }
  }, [checkIfUserAtBottom, scrollToBottom, userId]);

  // Scroll to bottom when messages change (only if user is at bottom)
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = previousMessageCountRef.current;

    if (currentMessageCount > previousMessageCount) {
      // New messages were added
      const newMessages = messages.slice(previousMessageCount);
      handleNewMessages(newMessages);
    }

    previousMessageCountRef.current = currentMessageCount;
  }, [messages, handleNewMessages]);

  // Initial scroll to bottom when conversation loads
  useEffect(() => {
    if (messages.length > 0 && isUserAtBottom) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [currentConversation?.id, isUserAtBottom]);

  // Check scroll position when messages container is available
  useEffect(() => {
    if (messagesContainerRef.current) {
      checkIfUserAtBottom();
    }
  }, [messages.length, checkIfUserAtBottom]);

  // Mark visible messages as read when messages change or conversation changes
  useEffect(() => {
    if (messages.length > 0 && currentConversation) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        markVisibleMessagesAsRead();
      }, 100);
    }
  }, [messages, currentConversation?.id, markVisibleMessagesAsRead]);

  // Clean up scroll indicators when component unmounts
  useEffect(() => {
    return () => {
      setShowNewMessageIndicator(false);
      setHasNewMessages(false);
      setIsUserAtBottom(true);
    };
  }, []);

  // Clean up recording when component unmounts
  useEffect(() => {
    return () => {
      // Only cleanup on component unmount (no dependencies)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (recordingStream) {
        recordingStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Handle clicking outside emoji picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showEmojiPicker]);


  // Simple WebSocket connection
  useEffect(() => {
    const connectWebSocket = async () => {
      // Connection guard to prevent multiple simultaneous connections
      let isConnecting = false;

      try {
        // Prevent multiple simultaneous connection attempts
        if (isConnecting) {
          console.log('WebSocket connection already in progress, skipping');
          return;
        }

        // Check if already connected
        if (chatWebSocketService.isConnected()) {
          console.log('WebSocket already connected, skipping connection attempt');
          setWsConnected(true);
          return;
        }

        isConnecting = true;
        console.log('Starting WebSocket connection...');

        const sessionId = await getSessionId();
        if (!sessionId) {
          console.log('No session ID found, skipping WebSocket connection');
          isConnecting = false;
          return;
        }

        console.log('Attempting WebSocket connection with session ID:', sessionId);
        console.log('🔧 DEBUG: Session ID type:', typeof sessionId, 'value:', sessionId);
        console.log('🔧 DEBUG: Session ID starts with test-session-:', sessionId?.startsWith('test-session-'));
        const connected = await chatWebSocketService.connect(sessionId);

        if (connected) {
          console.log('WebSocket connected successfully');
          setWsConnected(true);
          isConnecting = false;

          // Set up event listeners for real-time updates
          console.log('🔧 Setting up WebSocket event listeners...');

          // Add debug wrapper for new_message event
          const debugHandleNewMessage = (data: any) => {
            console.log('🔴 DEBUG: new_message event received!', data);
            console.log('🔴 DEBUG: Event timestamp:', new Date().toISOString());
            handleNewMessage(data);
          };

          // Add debug logging for the 'on' method to see if events are being registered
          const originalOn = chatWebSocketService.on;
          chatWebSocketService.on = function (event: string, callback: Function) {
            console.log('🔧 DEBUG: Registering event listener for:', event);
            return originalOn.call(this, event, callback);
          };

          chatWebSocketService.on('new_message', debugHandleNewMessage);
          chatWebSocketService.on('user_typing', handleUserTyping);
          chatWebSocketService.on('conversation_created', handleConversationCreated);
          chatWebSocketService.on('error', handleError);
          chatWebSocketService.on('connection_status_change', handleConnectionChange);

          // Note: Backend doesn't send conversation_created events, so we rely on
          // the new_message event and automatic conversation refresh

          // Restore original method
          chatWebSocketService.on = originalOn;

          console.log('🔧 Verifying event listeners are set up...');
          console.log('🔧 WebSocket service type:', typeof chatWebSocketService);
          console.log('🔧 WebSocket service connected:', chatWebSocketService.isConnected());

          console.log('✅ WebSocket event listeners set up successfully');

          // Check initial scroll position after setup
          setTimeout(() => {
            if (messagesContainerRef.current) {
              console.log('📱 Initial scroll position check after WebSocket setup');
              const isAtBottom = checkIfUserAtBottom();
              console.log('📱 Initial scroll state:', isAtBottom);
            }
          }, 1000);

          // Join all conversation rooms to receive real-time messages from all conversations
          // Add a small delay to ensure WebSocket connection is fully established
          setTimeout(() => {
            if (conversations.length > 0) {
              console.log('🚪 Joining all conversation rooms for real-time updates:', conversations.length);
              conversations.forEach((conversation, index) => {
                console.log(`🚪 [${index + 1}/${conversations.length}] Attempting to join room for conversation:`, conversation.id);
                chatWebSocketService.joinConversation(conversation.id);
                console.log(`🚪 [${index + 1}/${conversations.length}] Join command sent for conversation:`, conversation.id);
              });
              console.log('🚪 All room join commands completed');
            } else {
              console.log('⚠️ No conversations available to join rooms for');
            }
          }, 500); // Reduced delay to 500ms for faster room joining
        } else {
          console.log('WebSocket connection failed');
          setWsConnected(false);
          isConnecting = false;
        }
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setWsConnected(false);
        isConnecting = false;
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

    // Prevent multiple connections by checking if already connected
    const connectionCheckInterval = setInterval(() => {
      const actualStatus = chatWebSocketService.isConnected();
      if (actualStatus && wsConnected) {
        // Already connected, no need to do anything
        return;
      }
      if (actualStatus && !wsConnected) {
        // WebSocket is connected but UI state is wrong, sync it
        setWsConnected(true);
      }
    }, 2000); // Check every 2 seconds

    // Set up periodic connection status check to keep UI in sync
    const statusCheckInterval = setInterval(() => {
      const actualStatus = chatWebSocketService.isConnected();
      if (actualStatus !== wsConnected) {
        setWsConnected(actualStatus);
      }
    }, 5000); // Check every 5 seconds instead of 2 seconds

    // Set up periodic conversations refresh as backup for new conversations
    const conversationsRefreshInterval = setInterval(() => {
      if (wsConnected && conversations.length > 0) {
        console.log('🔄 Periodic conversations refresh (backup mechanism)');
        console.log('🔄 Current conversations count:', conversations.length);
        console.log('🔄 Current conversation IDs:', conversations.map(c => c.id));
        loadConversations();
      } else {
        console.log('🔄 Skipping periodic refresh - WebSocket not connected or no conversations');
      }
    }, 30000); // Refresh every 30 seconds

    // Set up periodic scroll position check to keep button state in sync
    const scrollCheckInterval = setInterval(() => {
      if (messagesContainerRef.current && messages.length > 0) {
        console.log('🔄 Periodic scroll position check');
        checkIfUserAtBottom();
      }
    }, 2000); // Check every 2 seconds

    return () => {
      clearInterval(retryInterval);
      clearInterval(connectionCheckInterval);
      clearInterval(statusCheckInterval);
      clearInterval(conversationsRefreshInterval);
      clearInterval(scrollCheckInterval);
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
    if (wsConnected && conversations.length > 0) {
      console.log('🚪 WebSocket connected, joining all conversation rooms:', conversations.length);
      // Join all conversation rooms to receive messages from all conversations
      conversations.forEach((conversation, index) => {
        console.log(`🚪 [${index + 1}/${conversations.length}] Joining room for conversation:`, conversation.id);
        chatWebSocketService.joinConversation(conversation.id);
      });
      console.log('🚪 All conversation rooms joined after WebSocket connection');
    }
  }, [wsConnected, conversations]);

  // Auto-join new conversations when they're added to the list
  useEffect(() => {
    if (wsConnected && conversations.length > 0) {
      // This effect will run whenever conversations change, ensuring new ones are joined
      console.log('🚪 Conversations updated, ensuring all rooms are joined:', conversations.length);
      joinAllConversationRooms();
    }
  }, [conversations, wsConnected, joinAllConversationRooms]);

  // Auto-join conversation room when WebSocket connects
  useEffect(() => {
    if (wsConnected && currentConversation?.id) {
      console.log('🚪 Auto-joining conversation room after WebSocket connection:', currentConversation.id);
      chatWebSocketService.joinConversation(currentConversation.id);
    }
  }, [wsConnected, currentConversation?.id]);

  // Keep refs in sync with state to avoid stale closures in WebSocket handlers
  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  // Keep typing states ref in sync with state
  useEffect(() => {
    conversationTypingStatesRef.current = conversationTypingStates;
  }, [conversationTypingStates]);

  // Debug: Log connection status changes
  useEffect(() => {
    console.log('🔍 ChatInterface: wsConnected state changed to:', wsConnected);
    console.log('🔍 ChatInterface: WebSocket service connected:', chatWebSocketService.isConnected());
  }, [wsConnected]);

  // Simple helper functions
  const getSessionId = async (): Promise<string | null> => {
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

    console.log('❌ CRITICAL: No session ID found in any source!');
    console.log('❌ Available cookies:', document.cookie);
    console.log('❌ Available localStorage keys:', Object.keys(localStorage));
    console.log('❌ This means user is not properly authenticated!');

    // Debug cookie visibility issues
    console.log('🔍 DEBUG: Cookie visibility check:');
    console.log('🔍 Current domain:', window.location.hostname);
    console.log('🔍 Current port:', window.location.port);
    console.log('🔍 Current protocol:', window.location.protocol);
    console.log('🔍 Full URL:', window.location.href);

    // Try to access cookies in different ways
    try {
      const allCookies = document.cookie;
      console.log('🔍 document.cookie raw:', allCookies);
      console.log('🔍 document.cookie length:', allCookies.length);

      if (allCookies.length === 0) {
        console.log('🔍 WARNING: document.cookie is completely empty!');
        console.log('🔍 This suggests a cookie visibility issue');
      }
    } catch (error) {
      console.error('🔍 Error accessing cookies:', error);
    }

    // Since cookies are HttpOnly, try to get session ID via API call
    try {
      console.log('🔧 Attempting to get session ID via API call...');
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/v1/auth/session`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔧 Session API response:', data);
        if (data.sessionId) {
          console.log('✅ Got session ID via API:', data.sessionId);
          return data.sessionId;
        }
      }
    } catch (error) {
      console.error('🔧 Error getting session via API:', error);
    }

    // Don't use test session - return null to see the real issue
    return null;
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

        // Join WebSocket rooms for all conversations to receive real-time messages
        if (wsConnected && data.length > 0) {
          console.log('🚪 Joining WebSocket rooms for all loaded conversations');
          // Add small delay to ensure WebSocket is ready
          setTimeout(() => {
            data.forEach((conversation, index) => {
              console.log(`🚪 Loading: [${index + 1}/${data.length}] Joining room for conversation:`, conversation.id);
              chatWebSocketService.joinConversation(conversation.id);
            });
            console.log('🚪 Loading: All conversation rooms joined');
          }, 200); // Reduced delay for faster room joining
        }

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
        setMessages([]); // Clear any previous messages
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
      setLoadingMessages(true);

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

      // Mark conversation as read when messages are loaded
      if (normalizedMessages.length > 0) {
        markConversationAsRead(conversationId);

        // Mark individual messages as read
        normalizedMessages.forEach(message => {
          if (message.senderId !== userId && !message.isRead) {
            markMessageAsRead(message.id);
          }
        });
      }

      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handle real-time messages from other users
  const handleNewMessage = (data: any) => {

    console.log('🔄 Handling new message:', data);
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

    if (normalizedMessage.senderId === userId) {
      console.log('🔄 Skipping own message from WebSocket to prevent duplication');
      return;
    }

    // If this message is for the current conversation, add it to the UI
    if (data.conversationId === currentConversationRef.current?.id) {
      console.log('✅ Adding message from other user to current conversation UI');

      // Check if user is at bottom before adding the message
      const wasAtBottom = checkIfUserAtBottom();

      setMessages(prev => {
        const exists = prev.some(msg => msg.id === normalizedMessage.id);
        if (exists) {
          console.log('⚠️ Duplicate message ignored:', normalizedMessage.id);
          return prev;
        }
      
        const newMessages = [...prev, normalizedMessage];
        console.log('🔍 Updated messages array:', newMessages);
      
        // If user was at bottom, auto-scroll
        if (wasAtBottom && data.message.sender_id !== userId) {
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight;
            }
          }, 100);
      
          // Mark as read
          setTimeout(() => {
            markMessageAsRead(data.message.id);
          }, 500);
        } else if (data.message.sender_id !== userId) {
          // User is scrolled up
          setShowNewMessageIndicator(true);
          setHasNewMessages(true);
        }
      
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

            // Show new message indicator since this is a new conversation
            if (data.message.sender_id !== userId) {
              setShowNewMessageIndicator(true);
              setHasNewMessages(true);
            }

            return newMessages;
          });
        }
      }
    }

    // Update conversation list smoothly without causing flickering
    setConversations(prev => {
      console.log('🔄 Updating conversations list with new message');
      console.log('🔄 Message conversation ID:', data.conversationId);
      console.log('🔄 Current conversations count:', prev.length);

      // Check if this conversation already exists in our list
      const existingConversation = prev.find(conv => conv.id === data.conversationId);

      if (existingConversation) {
        console.log('✅ Found existing conversation:', existingConversation.id);
        
        // Only update if there's an actual change to prevent unnecessary re-renders
        const currentLastMessage = existingConversation.lastMessage;
        const hasMessageChange = !currentLastMessage || 
          currentLastMessage.id !== normalizedMessage.id ||
          currentLastMessage.content !== normalizedMessage.content;
        
        if (!hasMessageChange) {
          console.log('🔄 No message change detected, skipping update');
          return prev;
        }
        
        // Update existing conversation smoothly using Object.assign for better performance
        const updated = prev.map(conv =>
          conv.id === data.conversationId
            ? Object.assign({}, conv, {
              lastMessage: normalizedMessage,
              updatedAt: new Date(),
              // Increment unread count only for incoming messages (not from current user)
              unreadCount: data.message.sender_id !== userId ? conv.unreadCount + 1 : conv.unreadCount
            })
            : conv
        );

        console.log('✅ Updated existing conversation with new message');
        return updated;
      } else {
        // This is a new conversation that we don't have locally
        console.log('🆕 New conversation detected for message:', data.conversationId);
        console.log('🆕 This should be handled by conversation_created event');
        console.log('🆕 Waiting for conversation_created event instead of fetching manually');
        
        // Don't fetch here to avoid duplicates - let conversation_created event handle it
        return prev;
      }
    });

    // Clear typing indicator for the sender when a message is received
    console.log('📝 Message received, clearing typing indicator for sender:', normalizedMessage.senderId);
    console.log('📝 Before clearing - conversationTypingStates for conversation:', conversationTypingStates.get(data.conversationId));
    setConversationTypingStates(prev => {
      const newMap = new Map(prev);
      const currentTypingUsers = newMap.get(data.conversationId);
      console.log('📝 Current typing users in conversation:', currentTypingUsers ? Array.from(currentTypingUsers) : 'none');
      console.log('📝 Does sender have typing indicator?', currentTypingUsers?.has(normalizedMessage.senderId));
      
      if (currentTypingUsers && currentTypingUsers.has(normalizedMessage.senderId)) {
        const newTypingUsers = new Set(currentTypingUsers);
        newTypingUsers.delete(normalizedMessage.senderId);
        if (newTypingUsers.size === 0) {
          newMap.delete(data.conversationId);
          console.log('📝 Deleted conversation from typing states (no more typing users)');
        } else {
          newMap.set(data.conversationId, newTypingUsers);
          console.log('📝 Updated conversation typing users:', Array.from(newTypingUsers));
        }
        console.log('📝 Successfully cleared typing indicator for sender in conversation:', data.conversationId);
      } else {
        console.log('📝 No typing indicator found for sender, nothing to clear');
      }
      console.log('📝 Final conversationTypingStates:', Object.fromEntries(newMap));
      return newMap;
    });

    // Also clear from active conversation typing if it's the current conversation
    if (data.conversationId === currentConversationRef.current?.id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(normalizedMessage.senderId);
        return newSet;
      });
    }

    // If this message is for a conversation that's not currently loaded, 
    // we might want to refresh the conversations list to show the new message
    if (data.conversationId !== currentConversationRef.current?.id) {
      console.log('🔄 Message for different conversation, consider refreshing conversations list');
    }
  };

  // Handle new conversation creation events from WebSocket
  const handleConversationCreated = (data: any) => {
    console.log('🆕 Received conversation_created event:', data);
    
    if (!data.conversation) {
      console.error('❌ Invalid conversation_created event data:', data);
      return;
    }

    // Check if current user is a participant in this conversation
    const participantUserIds = data.participantUserIds || [];
    const isParticipant = participantUserIds.includes(userId);
    
    console.log('🔍 Checking if user is participant:', {
      currentUserId: userId,
      participantUserIds,
      isParticipant
    });
    
    if (!isParticipant) {
      console.log('🚫 Current user is not a participant in this conversation, ignoring event');
      return;
    }
    
    const newConversation = data.conversation;
    
    // Check if conversation already exists in our list
    const existingConversation = conversations.find(conv => conv.id === newConversation.id);
    if (existingConversation) {
      console.log('🔄 Conversation already exists in list, skipping:', newConversation.id);
      return;
    }
    
    // Add the new conversation to the beginning of the list (most recent)
    setConversations(prev => {
      console.log('🆕 Adding new conversation to list:', newConversation.id);
      return [newConversation, ...prev];
    });
    
    // Show notification about new conversation
    const otherParticipant = newConversation.participants.find((p: any) => p.user_id !== userId);
    const senderName = otherParticipant?.name || 'Someone';
    setNewConversationInfo({ id: newConversation.id, senderName });
    setShowNewConversationNotification(true);
    
    // Auto-hide notification after 10 seconds
    setTimeout(() => {
      setShowNewConversationNotification(false);
      setNewConversationInfo(null);
    }, 10000);
    
    console.log('✅ New conversation added to list:', newConversation.id);
  };



  const handleUserTyping = (data: any) => {
    const typingEventKey = `${data.conversationId}-${data.userId}-${data.isTyping}`;
    console.log('🔑 Typing event key:', typingEventKey);

    // Handle typing for active conversation
    if (data.conversationId === currentConversationRef.current?.id) {
      console.log('✅ Active conversation, updating typing users');
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
      console.log('❌ Not active conversation, skipping typingUsers update');
    }

    // Handle typing for all conversations (including non-active ones)
    console.log('⌨️ Updating typing state for conversation:', data.conversationId);
    setConversationTypingStates(prev => {
      // Only update if there's an actual change
      const currentTypingUsers = prev.get(data.conversationId);
      const hasUser = currentTypingUsers?.has(data.userId);

      console.log('⌨️ Current typing users for conversation:', Array.from(currentTypingUsers || []));
      console.log('⌨️ User already typing:', hasUser);
      console.log('condition check:', {
        isTyping: data.isTyping,
        hasUser: hasUser,
        shouldAdd: data.isTyping && !hasUser,
        shouldRemove: !data.isTyping && hasUser
      });

      if (data.isTyping && !hasUser) {
        // Add typing user to conversation
        const newMap = new Map(prev);
        const newTypingUsers = new Set(currentTypingUsers || []);
        newTypingUsers.add(data.userId);
        newMap.set(data.conversationId, newTypingUsers);
        console.log(`⌨️ User ${data.username || data.userId} started typing in conversation ${data.conversationId}`);
        console.log('⌨️ New conversation typing states:', Object.fromEntries(newMap));
        return newMap;
      } else if (!data.isTyping && hasUser) {
        // Remove typing user from conversation
        console.log('🛑 STOPPING TYPING - Before removal:', {
          conversationId: data.conversationId,
          userId: data.userId,
          hasUser,
          currentTypingUsers: Array.from(currentTypingUsers || [])
        });
        
        const newMap = new Map(prev);
        const newTypingUsers = new Set(currentTypingUsers);
        newTypingUsers.delete(data.userId);
        
        console.log('🛑 After deletion, newTypingUsers size:', newTypingUsers.size);
        console.log('🛑 After deletion, newTypingUsers:', Array.from(newTypingUsers));
        
        if (newTypingUsers.size === 0) {
          newMap.delete(data.conversationId);
          console.log('🛑 Deleted conversation from typing map entirely');
        } else {
          newMap.set(data.conversationId, newTypingUsers);
          console.log('🛑 Updated conversation with remaining typing users');
        }
        console.log(`⌨️ User ${data.username || data.userId} stopped typing in conversation ${data.conversationId}`);
        console.log('⌨️ New conversation typing states:', Object.fromEntries(newMap));
        return newMap;
      }

      console.log('⌨️ No change in typing state, skipping update');
      // No change, return the same reference to prevent unnecessary re-renders
      return prev;
    });
    
    // Use setTimeout to log the actual updated state after React processes the update
    setTimeout(() => {
      console.log('👥 After handleUserTyping - ACTUAL final conversationTypingStates:', Object.fromEntries(conversationTypingStatesRef.current));
    }, 0);
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

    // Create a temporary loading message with attachments
    const tempMessageId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage & { isTemp?: boolean } = {
      id: tempMessageId,
      conversationId: currentConversation.id,
      senderId: userId,
      content: content || '',
      messageType: (attachmentPreviews.length > 0 ? (attachmentPreviews.some(p => p.type === 'image') ? 'image' : 'file') : 'text') as 'text' | 'image' | 'file' | 'listing',
      replyTo: undefined,
      attachments: attachmentPreviews.map((preview, index) => ({
        id: `temp-attachment-${index}`,
        type: preview.type === 'image' ? 'image' : 'file',
        url: preview.preview,
        name: preview.file.name,
        size: preview.file.size
      })),
      listingReference: undefined,
      isRead: false,
      readBy: [],
      timestamp: new Date(),
      isTemp: true // Mark as temporary
    };

    // Add temporary message to UI immediately
    setMessages(prev => [...prev, tempMessage]);

    // Force scroll to bottom immediately when temporary message is added
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 50);

    try {
      console.log('Sending message:', content);
      console.log('Attachments to upload:', attachmentPreviews);

      let attachments: UploadResult[] = [];

      // Upload attachments if any
      if (attachmentPreviews.length > 0) {
        console.log('📎 Uploading attachments...');

                 for (const preview of attachmentPreviews) {
           // Upload voice files as documents since the upload utility doesn't have a voice type
           const fileType = preview.type === 'image' ? 'image' : 'document';

           console.log('📎 Uploading file:', preview.file.name, 'original type:', preview.type, 'upload type:', fileType);

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

      // Replace temporary message with real message
      setMessages(prev => {
        console.log('💬 Replacing temporary message with real message');
        return prev.map(msg => msg.id === tempMessageId ? normalizedMessage : msg);
      });

      // Always scroll to bottom for user's own messages
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);

      // Update conversation's last message - only if there's an actual change
      setCurrentConversation(prev => {
        if (!prev) return null;
        
        // Only update if there's an actual change
        if (prev.lastMessage?.id === normalizedMessage.id) {
          return prev; // No change needed
        }
        
        // Use Object.assign for better performance and to prevent unnecessary re-renders
        return Object.assign({}, prev, {
          lastMessage: normalizedMessage,
          updatedAt: new Date()
        });
      });

      // Don't update conversations list immediately - let the WebSocket handle it
      // This prevents the sudden reload behavior in the chat list
      // The conversation will be updated when the WebSocket sends the new_message event
      console.log('Skipping immediate conversation list update to prevent flickering');

      console.log('Local state updated with new message');

      // Clear attachments after successful send
      setAttachmentPreviews([]);
      setShowAttachmentPreview(false);
      
      // Clear typing indicator after message is sent
      console.log('📝 Message sent, clearing typing indicator for conversation:', currentConversation.id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      // Send typing false to clear typing indicator
      chatWebSocketService.sendTyping(currentConversation.id, false);

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

  const handleEmojiSelect = (emojiObject: any) => {
    // Try to find the active input field
    let input = document.activeElement as HTMLInputElement;

    // If no active input, try to find the main chat input
    if (!input || input.tagName !== 'INPUT') {
      input = document.querySelector('input[placeholder="Type something..."]') as HTMLInputElement;
    }

    // If still no input, try the modal input
    if (!input) {
      input = document.querySelector('input[placeholder="Add a message..."]') as HTMLInputElement;
    }

    if (input) {
      const cursorPos = input.selectionStart || 0;
      const textBefore = input.value.substring(0, cursorPos);
      const textAfter = input.value.substring(cursorPos);
      input.value = textBefore + emojiObject.emoji + textAfter;

      // Set cursor position after the emoji
      const newCursorPos = cursorPos + emojiObject.emoji.length;
      input.setSelectionRange(newCursorPos, newCursorPos);

      // Focus back to input
      input.focus();

      // Trigger typing indicator only for main chat input
      if (input.placeholder === "Type something...") {
        handleTyping();
      }
    }

    // Close emoji picker
    setShowEmojiPicker(false);
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

    // Reset scroll indicators for new conversation
    setShowNewMessageIndicator(false);
    setHasNewMessages(false);
    setIsUserAtBottom(true);

    // Clear previous messages and load new ones
    setMessages([]);
    setLoadingMessages(true);

    // Load messages for this conversation
    loadMessages(conversation.id);

    // Mark conversation as read when selected - do this immediately for better UX
    if (conversation.unreadCount > 0) {
      console.log('🎯 Conversation has unread messages, marking as read:', conversation.unreadCount);
      markConversationAsRead(conversation.id);
    }

    // Mark all incoming messages as read when conversation is selected
    if (messages.length > 0) {
      const unreadMessages = messages.filter(message =>
        message.senderId !== userId && !message.isRead
      );

      if (unreadMessages.length > 0) {
        console.log('🎯 Found unread messages, marking them as read:', unreadMessages.length);
        unreadMessages.forEach(message => {
          markMessageAsRead(message.id);
        });
      }
    }

    // Join WebSocket room for this conversation if connected
    if (wsConnected) {
      console.log('🚪 Joining WebSocket room for selected conversation:', conversation.id);
      chatWebSocketService.joinConversation(conversation.id);
    }

    // Ensure scroll to bottom after a short delay to let messages load
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 200);

    console.log('✅ ChatInterface: Conversation selected and loaded:', conversation.id);
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    try {
      // Update local state immediately for better UX
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );

      // Update current conversation if it's the selected one
      setCurrentConversation(prev =>
        prev?.id === conversationId
          ? { ...prev, unreadCount: 0 }
          : prev
      );

      // Call backend API to mark as read
      await chatApiService.markConversationAsRead(conversationId, userId);

      console.log('✅ Conversation marked as read:', conversationId);
    } catch (error) {
      console.error('❌ Failed to mark conversation as read:', error);
    }
  };

  // Mark individual message as read
  const markMessageAsRead = async (messageId: string) => {
    try {
      // Check if message was unread before marking as read
      const messageToRead = messages.find(msg => msg.id === messageId);
      const wasUnread = messageToRead && messageToRead.senderId !== userId && !messageToRead.isRead;

      // Update local message state
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, isRead: true, readBy: [...(msg.readBy || []), userId] }
            : msg
        )
      );

      // If message was unread, decrement the conversation unread count
      if (wasUnread && currentConversation) {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversation.id
              ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - 1) }
              : conv
          )
        );

        // Also update current conversation state
        setCurrentConversation(prev =>
          prev ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) } : prev
        );
      }

      // Call backend API to mark message as read
      await chatApiService.markMessageAsRead(messageId, userId);

      console.log('✅ Message marked as read:', messageId);

      // Check if all messages in current conversation are now read
      // If so, ensure conversation unread count is 0
      if (currentConversation) {
        const allMessagesRead = messages.every(msg =>
          msg.senderId === userId || msg.isRead || msg.id === messageId
        );

        if (allMessagesRead) {
          console.log('🎯 All messages read, ensuring conversation unread count is 0');
          setConversations(prev =>
            prev.map(conv =>
              conv.id === currentConversation.id
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          );
          setCurrentConversation(prev =>
            prev ? { ...prev, unreadCount: 0 } : prev
          );
        }
      }
    } catch (error) {
      console.error('❌ Failed to mark message as read:', error);
    }
  };

  const handleBackToList = () => {
    setIsVisible(false);
    setCurrentConversation(null);
    setMessages([]);

    // Reset scroll indicators
    setShowNewMessageIndicator(false);
    setHasNewMessages(false);
    setIsUserAtBottom(true);
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

  // Voice recording functions
  const startRecording = async () => {
    try {
      console.log('🎤 Starting voice recording...');
      console.log('🎤 Current state before start:', {
        isRecording,
        hasMediaRecorder: !!mediaRecorder,
        hasStream: !!recordingStream,
        recordingDuration,
        audioChunksLength: audioChunks.length
      });

      // Clean up any existing recording state first
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (recordingStream) {
        recordingStream.getTracks().forEach(track => track.stop());
        setRecordingStream(null);
      }

      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        setMediaRecorder(null);
      }

      // Reset all recording state
      setIsRecording(false);
      setRecordingDuration(0);
      setLastRecordingDuration(0);
      setAudioChunks([]);
      setShowRecordingOverlay(false);
      setAudioLevel(0);
      setShowAudioPreview(false);
      setRecordedAudioUrl(null);

      console.log('🎤 State cleaned up, starting fresh recording...');

      // Check if we're in a secure context (HTTPS required for media access)
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('Microphone access requires a secure context (HTTPS). Please access this page via HTTPS.');
      }

      // Check if browser supports required APIs
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder API not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      console.log('✅ Browser APIs supported, requesting microphone access...');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted, stream obtained:', stream);
      setRecordingStream(stream);

            // Create MediaRecorder with proper error handling
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus' // Good quality, small file size
        });
      } catch (e) {
        // Fallback to default settings if codec not supported
        console.warn('🎤 Opus codec not supported, falling back to default');
        recorder = new MediaRecorder(stream);
      }

      console.log('🎤 MediaRecorder created with mimeType:', recorder.mimeType);

      // Create a local chunks array to avoid state race conditions
      let localAudioChunks: Blob[] = [];

      // Set up event handlers
      recorder.ondataavailable = (event) => {
        console.log('🎤 Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          localAudioChunks.push(event.data);
          setAudioChunks(prev => {
            console.log('🎤 Adding chunk, total chunks:', prev.length + 1);
            return [...prev, event.data];
          });
        }
      };

      recorder.onstop = () => {
        console.log('🎤 Recording stopped, chunks collected:', localAudioChunks.length);

        // Use local chunks array instead of state to avoid race conditions
        if (localAudioChunks.length > 0) {
          const audioBlob = new Blob(localAudioChunks, { type: recorder.mimeType || 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log('🎤 Created audio URL:', audioUrl);
          
          setRecordedAudioUrl(audioUrl);
          setShowAudioPreview(true);
          
          // Also update the state with the local chunks
          setAudioChunks(localAudioChunks);
        } else {
          console.error('🎤 No audio chunks available!');
        }
      };

      recorder.onerror = (event) => {
        console.error('🎤 MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
      };

      setMediaRecorder(recorder);

      // Start recording
      console.log('🎤 Starting MediaRecorder...');
      recorder.start(100); // Request data every 100ms for better chunking
      
      // Set recording state
      setIsRecording(true);
      setRecordingDuration(0);
      setShowRecordingOverlay(true);
      
      console.log('🎤 Setting up timer...');
      
      // Start timer with proper cleanup
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      recordingTimerRef.current = setInterval(() => {
        console.log('🕐 Timer interval executing...');
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          console.log('🕐 Timer tick - prev:', prev, 'new:', newDuration);
          return newDuration;
        });
      }, 1000);
      
      console.log('🎤 Timer started, ref:', !!recordingTimerRef.current);

      // Monitor audio levels for visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      console.log('✅ Voice recording started successfully');

    } catch (error) {
      console.error('❌ Failed to start voice recording:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access to record voice messages.');
        } else if (error.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError('Failed to start recording: ' + error.message);
        }
      } else {
        setError('Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    try {
      console.log('🛑 Stopping voice recording...');
      console.log('🛑 Current state before stop:', {
        isRecording,
        hasMediaRecorder: !!mediaRecorder,
        mediaRecorderState: mediaRecorder?.state,
        hasTimer: !!recordingTimerRef.current,
        recordingDuration
      });

      // Stop MediaRecorder
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        console.log('🛑 Stopping MediaRecorder...');
        mediaRecorder.stop();
      }

      // Stop timer
      if (recordingTimerRef.current) {
        console.log('🛑 Clearing timer...');
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Stop all tracks in the stream
      if (recordingStream) {
        console.log('🛑 Stopping stream tracks...');
        recordingStream.getTracks().forEach(track => {
          console.log('🛑 Stopping track:', track.kind, track.readyState);
          track.stop();
        });
      }

      // Save the current duration for preview before resetting
      setLastRecordingDuration(recordingDuration);
      console.log('🛑 Saving duration for preview:', recordingDuration);

      // Update UI state
      setIsRecording(false);
      setShowRecordingOverlay(false);
      setAudioLevel(0);

      console.log('✅ Voice recording stopped successfully');

    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      setError('Failed to stop recording. Please try again.');
    }
  };

  const handleMicClick = () => {
    console.log('🎤 Mic clicked! Current state:', {
      isRecording,
      mediaRecorder: !!mediaRecorder,
      navigator: typeof navigator,
      mediaDevices: navigator?.mediaDevices,
      getUserMedia: navigator?.mediaDevices?.getUserMedia,
      MediaRecorder: typeof MediaRecorder,
      isSecureContext: typeof window !== 'undefined' ? window.isSecureContext : 'unknown'
    });

    if (isRecording) {
      console.log('🛑 Stopping recording...');
      stopRecording();
    } else {
      console.log('🎤 Starting recording...');
      startRecording();
    }
  };

  const formatRecordingDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio preview and playback functions
  const playAudioPreview = () => {
    if (audioRef.current && recordedAudioUrl) {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const pauseAudioPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
  };

  const handleAudioTimeUpdate = () => {
    // This will be used for progress bar if needed
  };

  const reRecordAudio = () => {
    console.log('🔄 Re-recording audio...');
    
    // Clean up current audio preview
    setShowAudioPreview(false);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setAudioChunks([]);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    
    // Reset recording state
    setRecordingDuration(0);
    setLastRecordingDuration(0);
    setAudioLevel(0);
    
    // Start new recording
    startRecording();
  };

  const sendVoiceMessage = async () => {
    if (audioChunks.length === 0) {
      console.error('❌ No audio chunks available for sending');
      setError('No audio recorded. Please try recording again.');
      return;
    }

    try {
      console.log('🎤 Sending voice message...');
      console.log('🎤 Audio chunks available:', audioChunks.length);
      console.log('🎤 Total audio size:', audioChunks.reduce((total, chunk) => total + chunk.size, 0), 'bytes');

      // Create audio file from chunks with proper MIME type
      const mimeType = mediaRecorder?.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: mimeType });

      console.log('🎤 Created audio file:', {
        name: audioFile.name,
        size: audioFile.size,
        type: audioFile.type
      });

      // Add to attachment previews (will be handled by existing send logic)
      const voicePreview: AttachmentPreview = {
        file: audioFile,
        preview: recordedAudioUrl || '',
        type: 'voice',
        size: formatFileSize(audioFile.size)
      };

      setAttachmentPreviews([voicePreview]);
      setShowAttachmentPreview(true);
      setShowAudioPreview(false);

      console.log('✅ Voice message prepared for sending');

    } catch (error) {
      console.error('❌ Error preparing voice message:', error);
      setError('Failed to prepare voice message. Please try again.');
    }
  };

  // Simple MessageCard component based on your design - Memoized to prevent unnecessary re-renders
  const MessageCard = React.memo(({ 
    conversation, 
    currentConversationId, 
    userId,
    conversationTypingStates
  }: { 
    conversation: ChatConversation;
    currentConversationId?: string;
    userId: string;
    conversationTypingStates: Map<string, Set<string>>;
  }) => {
    const otherParticipant = conversation.participants.find(p => p.user_id !== userId);
    const lastMessage = conversation.lastMessage;
    const isActive = currentConversationId === conversation.id;
    const isHighlighted = isActive; // Only highlight the currently selected conversation

    // Get typing state for this conversation - use useMemo to prevent unnecessary recalculations
    const typingState = React.useMemo(() => {
      const typingUsers = conversationTypingStates.get(conversation.id);
      // Only show typing indicator for other users, not the current user
      const otherUserTyping = typingUsers && Array.from(typingUsers).some(typingUserId => typingUserId !== userId);
      return { isTyping: otherUserTyping };
    }, [conversation.id, userId, conversationTypingStates]);
    
    const { isTyping } = typingState;

    return (
      <div
        onClick={() => handleConversationSelect(conversation)}
        className={`flex flex-col ${isHighlighted ? "bg-[#F4F2F6] border-r-[#B699CA]" : "border-r-transparent"} pr-12 p-4 gap-1 border-r-[6px] border-b border-b-black/20 relative cursor-pointer hover:bg-gray-50`}
      >
        <div className="flex gap-2 font-medium items-center relative">
          <span className={`size-2.5 rounded-full absolute left-[32px] bottom-[6px] border border-white ${otherParticipant?.isOnline ? 'bg-[#74D27E]' : 'bg-[#CFCFCF]'}`}></span>
          {/* Unread indicator - subtle left border */}
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
          {conversation.unreadCount > 0 && !isActive && (
            <span className="size-5 rounded-full bg-[#EE5D50] flex items-center justify-center text-[8px] text-white font-bold">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <span className={`text-sm whitespace-nowrap text-ellipsis block overflow-hidden ${isHighlighted ? 'text-black' : 'text-[#888787]'}`}>
          {!isActive && isTyping ? (
            // Show typing indicator instead of last message when typing
            <span className="flex items-center space-x-1 text-[#74D27E]">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-[#74D27E] rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-[#74D27E] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-[#74D27E] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-[#74D27E] font-normal">typing...</span>
            </span>
          ) : (
            // Show last message when not typing
            lastMessage ? (
              lastMessage.content ? (
                lastMessage.content
              ) : lastMessage.attachments && lastMessage.attachments.length > 0 ? (
                lastMessage.attachments.some(att => att.type === 'image' || att.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ?
                  'Image' :
                  'Attachment'
              ) : lastMessage.messageType === 'listing' ?
                'Listing' :
                'Message'
            ) : 'No messages yet'
          )}
        </span>
        <span className="flex text-[#ADA7A7] flex-col absolute right-3 h-full gap-6">
          {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.51475 13.3597C1.55872 13.6276 1.81152 13.8091 2.0794 13.7651L6.44474 13.0486C6.71262 13.0046 6.89413 12.7518 6.85016 12.4839C6.80619 12.2161 6.55339 12.0345 6.28551 12.0785L2.40521 12.7154L1.76831 8.83511C1.72434 8.56723 1.47154 8.38572 1.20366 8.42969C0.935779 8.47366 0.754264 8.72646 0.798233 8.99434L1.51475 13.3597ZM10.6188 0.433292L1.60052 12.9934L2.39905 13.5667L11.4173 1.00665L10.6188 0.433292Z" fill={otherParticipant?.isOnline ? '#74D27E' : '#CFCFCF'} />
          </svg>
        </span>
      </div>
    );
  });

  // Memoize conversation list to prevent re-renders when only typing indicator changes
  const conversationList = React.useMemo(() => {
    console.log('🔄 conversationList memoized, dependencies changed:', {
      conversationsCount: conversations.length,
      currentConversationId: currentConversation?.id
    });
    
    // Create a stable reference for the conversation list
    // This prevents unnecessary re-renders when the array reference changes but content is the same
    const stableConversations = conversations.map(conversation => ({
      id: conversation.id,
      lastMessageId: conversation.lastMessage?.id || 'no-message',
      unreadCount: conversation.unreadCount,
      conversation: conversation
    }));
    
    return stableConversations.map(({ id, lastMessageId, unreadCount, conversation }) => (
      <MessageCard 
        key={`${id}-${lastMessageId}-${unreadCount}`}
        conversation={conversation}
        // Pass stable references to prevent unnecessary re-renders
        currentConversationId={currentConversation?.id}
        userId={userId}
        conversationTypingStates={conversationTypingStates}
      />
    ));
  }, [conversations, currentConversation?.id, userId, conversationTypingStates]); // Add conversationTypingStates for typing indicators

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
      {/* New Conversation Notification */}
      {showNewConversationNotification && newConversationInfo && (
        <div className="fixed top-20 right-4 z-50 bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-right duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                New message from {newConversationInfo.senderName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Click to view the conversation
              </p>
            </div>
            <button
              onClick={() => {
                setShowNewConversationNotification(false);
                setNewConversationInfo(null);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                // Find and select the new conversation
                const newConversation = conversations.find(c => c.id === newConversationInfo.id);
                if (newConversation) {
                  setCurrentConversation(newConversation);
                  setIsVisible(true);
                  loadMessages(newConversation.id);
                  setShowNewConversationNotification(false);
                  setNewConversationInfo(null);
                }
              }}
              className="flex-1 bg-green-600 text-white text-xs px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              View Conversation
            </button>
            <button
              onClick={() => {
                setShowNewConversationNotification(false);
                setNewConversationInfo(null);
              }}
              className="flex-1 bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
            {conversationList}
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
                  <div className="flex flex-col">
                    <span>{currentConversation.participants.find(p => p.user_id !== userId)?.name || 'Unknown User'}</span>
                    {/* Typing Indicator under user name */}
                    {(() => {
                      console.log('🔍 Rendering typing indicator check:');
                      console.log('🔍 typingUsers.size:', typingUsers.size);
                      console.log('🔍 typingUsers contents:', Array.from(typingUsers));
                      console.log('🔍 currentConversation.id:', currentConversation.id);
                      console.log('🔍 conversationTypingStates for current conversation:', conversationTypingStates.get(currentConversation.id));

                      // Check both typingUsers and conversationTypingStates for current conversation
                      const currentConversationTypingUsers = conversationTypingStates.get(currentConversation.id);
                      const shouldShowTypingIndicator = typingUsers.size > 0 || (currentConversationTypingUsers && currentConversationTypingUsers.size > 0);

                      console.log('🔍 Should show typing indicator:', shouldShowTypingIndicator);
                      console.log('🔍 Current conversation typing users:', currentConversationTypingUsers ? Array.from(currentConversationTypingUsers) : []);

                      return null;
                    })()}
                    {(() => {
                      // Get typing users for current conversation, excluding current user
                      const currentConversationTypingUsers = conversationTypingStates.get(currentConversation.id);
                      const otherUsersTyping = currentConversationTypingUsers && 
                        Array.from(currentConversationTypingUsers).some(typingUserId => typingUserId !== userId);
                      
                      return otherUsersTyping ? (
                        <div className="flex items-center space-x-2 text-sm mt-1">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-[#74D27E] rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-[#74D27E] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-[#74D27E] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-[#74D27E] font-normal text-xs">typing...</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
                <button
                  onClick={() => markConversationAsRead(currentConversation.id)}
                  disabled={currentConversation.unreadCount === 0}
                  className={`text-[12px] ml-auto font-semibold h-11 px-4 gap-1 border border-[#CBCACA] rounded-full flex items-center justify-center max-md:hidden transition-colors ${currentConversation.unreadCount > 0
                      ? 'hover:bg-[#F4F2F6] cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <img src="/images/vectors/doubleTick.png" alt="" />
                  {currentConversation.unreadCount > 0 ? 'Mark As Read' : 'All Read'}
                </button>
                <span className="text-[32px] font-semibold h-11 w-11 max-md:w-7 max-md:h-7 border border-[#CBCACA] rounded-full flex items-center justify-center max-md:ml-auto">
                  <img className="max-md:w-2.5" src="/images/vectors/3dots.png" alt="" />
                </span>
              </div>

              {/* Messages */}
              <div className="relative flex-1">
                <div
                  className={`flex w-full h-full max-h-[576px] max-md:max-h-fit p-4 flex-col gap-6 overflow-y-auto mb-6 relative ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''}`}
                  style={{
                    overscrollBehavior: 'contain' // Prevents scroll chaining
                  }}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onScroll={handleScroll}
                  onWheel={(e) => {
                    // Handle wheel events for smooth scrolling within container
                    const container = e.currentTarget;
                    const { scrollTop, scrollHeight, clientHeight } = container;

                    // If scrolling up at the top or down at the bottom, stop propagation
                    // Note: preventDefault() is not allowed on passive wheel events
                    if (
                      (e.deltaY < 0 && scrollTop <= 0) || // Scrolling up at top
                      (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight - 1) // Scrolling down at bottom
                    ) {
                      e.stopPropagation();
                    }

                    // Force scroll position check on wheel events
                    setTimeout(() => {
                      console.log('🔄 Wheel event triggered, checking scroll position');
                      checkIfUserAtBottom();
                    }, 50);
                  }}
                  onTouchStart={(e) => {
                    // Prevent touch events from interfering with scroll
                    e.stopPropagation();
                  }}
                  ref={messagesContainerRef}
                >
                  {/* Drag overlay */}
                  {isDragOver && (
                    <div className="absolute inset-0 bg-blue-50/90 flex items-center justify-center z-50 pointer-events-none rounded-lg">
                      <div className="text-center">
                        <div className="mb-2">
                          <svg className="w-12 h-12 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </div>
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

                  {loadingMessages ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-CPrimary mx-auto mb-4"></div>
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
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
                            <div
                              key={message.id}
                              data-message-id={message.id}
                              className={`flex flex-col relative ${message.senderId === userId ? 'pr-20 ml-auto' : 'pl-20'} w-full max-w-[650px] max-md:${message.senderId === userId ? 'pr-12' : 'pl-12'}`}
                            >
                              <span className={`w-[60px] h-[60px] max-md:w-[30px] max-md:h-[30px] rounded-full overflow-hidden absolute ${message.senderId === userId ? 'right-0' : 'left-0'} bottom-0`}>
                                <Avatar
                                  className="cursor-pointer !text-3xl w-full h-full object-cover"
                                  name={message.senderId === userId ? currentConversation.participants.find(p => p.user_id === userId)?.name : currentConversation.participants.find(p => p.user_id !== userId)?.name || 'Unknown User'}
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
                                    {/* Show read status based on message.readBy array */}
                                    {message.readBy && message.readBy.length > 0 ? (
                                      <strong className="font-medium text-green-600">Seen</strong>
                                    ) : (
                                      <strong className="font-medium text-gray-500">Delivered</strong>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <strong className="font-semibold">{currentConversation.participants.find(p => p.user_id !== userId)?.name}</strong>
                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {/* Show unread indicator for incoming messages */}
                                    {!message.isRead && (
                                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">New</span>
                                    )}
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
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  {attachment.name?.endsWith('.pdf') ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                                  ) : attachment.name?.match(/\.(doc|docx)$/i) ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                  ) : attachment.name?.match(/\.(xls|xlsx)$/i) ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                  ) : attachment.name?.match(/\.(ppt|pptx)$/i) ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                  ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                  )}
                                                </svg>
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate text-gray-800">{attachment.name}</p>
                                                <p className="text-xs text-gray-500">
                                                  {attachment.size ? formatFileSize(attachment.size) : 'Click to download'}
                                                </p>
                                              </div>
                                              <div className="flex-shrink-0 text-blue-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
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

                                {/* Loading Indicator for Temporary Messages */}
                                {(message as any).isTemp && (
                                  <div className="flex items-center gap-2 mt-3 text-[#8B8B8B] text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B699CA]"></div>
                                    <span>Sending...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}



                  {/* New Message Indicator Arrow - Inside chat area */}
                  {showNewMessageIndicator && (
                    <div
                      className="absolute bottom-4 right-4 z-10 cursor-pointer hover:scale-110 transition-transform duration-200 animate-bounce"
                      onClick={() => scrollToBottom('smooth')}
                      title="New messages below - Click to scroll down"
                    >
                      <div className="bg-[#74D27E] text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {hasNewMessages && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                            {messages.filter(msg => msg.senderId !== userId).length}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Scroll to Bottom Button - Inside chat area when not at bottom */}
                  {(() => {
                    console.log('🔍 Rendering scroll-to-bottom button check:');
                    console.log('🔍 isUserAtBottom:', isUserAtBottom);
                    console.log('🔍 showNewMessageIndicator:', showNewMessageIndicator);
                    console.log('🔍 Should show scroll button:', !isUserAtBottom && !showNewMessageIndicator);
                    return null;
                  })()}


                  <div ref={messagesEndRef} />

                </div>
                {!isUserAtBottom && !showNewMessageIndicator && (
                  <div
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer hover:scale-110 transition-transform duration-200"
                    onClick={() => {
                      console.log('🔽 Scroll to bottom button clicked');
                      console.log('🔽 messagesEndRef current:', messagesEndRef.current);
                      scrollToBottom('smooth');
                    }}
                    title="Scroll to bottom"
                  >
                    <div className="bg-gray-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center">
                      <ArrowDownIcon className='w-4 h-4' />
                    </div>
                  </div>
                )}
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
                <span
                  className={`h-full w-16 max-md:w-7 max-md:min-w-7 min-w-16 flex items-center justify-center relative cursor-pointer transition-all duration-200 ${isRecording ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-100'}`}
                  onClick={handleMicClick}
                  title={isRecording ? 'Click to stop recording' : 'Click to start recording'}
                >
                  {isRecording ? (
                    // Recording state - red mic icon with timer
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-600 font-medium">
                        {formatRecordingDuration(recordingDuration)}
                      </span>
                    </div>
                  ) : (
                    // Normal state - mic icon
                    <img className='max-md:max-h-4' src="/images/vectors/mic.png" alt="Voice message" />
                  )}
                </span>
                <span className="h-full w-16 max-md:w-7 max-md:min-w-7 min-w-16 flex items-center justify-center relative">
                  <input
                    ref={fileInputRef}
                    className="absolute w-full h-full top-0 left-0 cursor-pointer opacity-0"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.webm,.mp3,.wav,.ogg"
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
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-full h-full flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                  >
                    <img className='max-md:max-h-4' src="/images/vectors/smile.png" alt="Emoji" />
                  </button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50 animate-in slide-in-from-bottom-2 duration-200">
                      <div className="bg-white rounded-[20px] shadow-xl border border-gray-200 overflow-hidden">
                        <EmojiPicker
                          onEmojiClick={handleEmojiSelect}
                          autoFocusSearch={false}
                          searchDisabled={false}
                          skinTonesDisabled={true}
                          width={320}
                          height={400}
                        />
                      </div>
                    </div>
                  )}
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

      {/* Voice Recording Overlay */}
      {showRecordingOverlay && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-8 shadow-xl border border-black/10">
            {/* Recording Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">Recording Voice Message</h3>
              <p className="text-sm text-[#8B8B8B]">Speak clearly into your microphone</p>
            </div>

            {/* Audio Level Visualization */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${i < (audioLevel / 12.75) ? 'bg-red-500' : 'bg-gray-200'
                    }`}
                  style={{
                    height: `${Math.max(8, (audioLevel / 12.75) * 2)}px`
                  }}
                />
              ))}
            </div>

                         {/* Recording Timer */}
             <div className="text-center mb-6">
               <div className="text-3xl font-mono font-bold text-red-500">
                 {formatRecordingDuration(recordingDuration)}
               </div>
               <p className="text-sm text-[#8B8B8B] mt-1">Recording duration ({recordingDuration}s)</p>
             </div>

            {/* Recording Controls */}
            <div className="flex gap-4">
              <button
                                 onClick={() => {
                   setShowRecordingOverlay(false);
                   setAudioChunks([]);
                   setIsRecording(false);
                   setRecordingDuration(0);
                   setLastRecordingDuration(0);
                   if (recordingStream) {
                     recordingStream.getTracks().forEach(track => track.stop());
                   }
                   if (recordingTimerRef.current) {
                     clearInterval(recordingTimerRef.current);
                     recordingTimerRef.current = null;
                   }
                 }}
                className="flex-1 py-4 text-[#4A4A4A] bg-[#F4F2F6] rounded-[20px] hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={stopRecording}
                className="flex-1 py-4 bg-red-500 text-white rounded-[20px] hover:bg-red-600 transition-colors font-medium"
              >
                Stop Recording
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Preview Overlay */}
      {showAudioPreview && recordedAudioUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-8 shadow-xl border border-black/10">
            {/* Audio Preview Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">Voice Message Preview</h3>
              <p className="text-sm text-[#8B8B8B]">Listen to your recording</p>
            </div>

            {/* Audio Player */}
            <div className="mb-6">
              <audio
                ref={audioRef}
                src={recordedAudioUrl}
                onEnded={handleAudioEnded}
                onTimeUpdate={handleAudioTimeUpdate}
                className="w-full"
                controls
              />
            </div>

                         {/* Recording Info */}
             <div className="text-center mb-6 p-4 bg-[#F4F2F6] rounded-[20px]">
               <div className="text-lg font-semibold text-[#4A4A4A]">
                 Duration: {formatRecordingDuration(lastRecordingDuration)}
               </div>
               <p className="text-sm text-[#8B8B8B] mt-1">Voice message ready to send (Debug: {lastRecordingDuration}s)</p>
             </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={reRecordAudio}
                className="flex-1 py-4 text-[#4A4A4A] bg-[#F4F2F6] rounded-[20px] hover:bg-gray-200 transition-colors font-medium"
              >
                Re-record
              </button>
              <button
                onClick={sendVoiceMessage}
                className="flex-1 py-4 bg-blue-500 text-white rounded-[20px] hover:bg-blue-600 transition-colors font-medium"
              >
                Send Voice Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram-Style Attachment Preview Modal */}
      {showAttachmentPreview && attachmentPreviews.length > 0 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full max-h-[85vh] overflow-hidden shadow-xl border border-black/10">
            {/* Clean Header */}
            <div className="flex items-center justify-between p-5 border-b border-black/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F4F2F6] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#4A4A4A]">
                    {attachmentPreviews.length} file{attachmentPreviews.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-[#8B8B8B]">Ready to send</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAttachmentPreview(false);
                  setAttachmentPreviews([]);
                }}
                className="w-10 h-10 bg-[#F4F2F6] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Attachments List - Clean & Simple */}
            <div className="p-5 max-h-80 overflow-y-auto">
              <div className="space-y-4">
                {attachmentPreviews.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-[#F4F2F6] rounded-[20px]">
                    {/* File Icon */}
                    <div className="w-16 h-16 bg-white rounded-[16px] flex items-center justify-center shadow-sm">
                      {attachment.type === 'image' ? (
                        <img
                          src={attachment.preview}
                          alt={attachment.file.name}
                          className="w-14 h-14 object-cover rounded-[12px]"
                        />
                      ) : attachment.type === 'voice' ? (
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-[#4A4A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {attachment.file.name.endsWith('.pdf') ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          ) : attachment.file.name.match(/\.(doc|docx)$/i) ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          ) : attachment.file.name.match(/\.(xls|xlsx)$/i) ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          ) : attachment.file.name.match(/\.(ppt|pptx)$/i) ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          )}
                        </svg>
                      )}
                    </div>

                    {/* File Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#4A4A4A] text-base truncate">{attachment.file.name}</p>
                      <p className="text-sm text-[#8B8B8B] mt-1">{attachment.size}</p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeAttachment(index)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                      title="Remove file"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input - Clean & Simple */}
            <div className="px-5 pb-4">
              <div className="relative flex items-center bg-[#F4F2F6] rounded-[20px] p-2">
                <input
                  type="text"
                  placeholder="Add a message..."
                  className="flex-1 bg-transparent border-0 px-3 py-2 text-[#4A4A4A] placeholder-[#8B8B8B] focus:outline-none focus:ring-0 text-base"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      const message = target.value;

                      if (message.trim() || attachmentPreviews.length > 0) {
                        // Close modal immediately
                        setShowAttachmentPreview(false);

                        // Send message with attachments
                        handleSendMessage(message);

                        // Clear input
                        target.value = '';
                      }
                    }
                  }}
                />

                {/* Emoji Button for Modal */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors mr-2"
                  title="Add emoji"
                >
                  <svg className="w-5 h-5 text-[#8B8B8B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Emoji Picker for Modal */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-50 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-white rounded-[20px] shadow-xl border border-gray-200 overflow-hidden">
                      <EmojiPicker
                        onEmojiClick={handleEmojiSelect}
                        autoFocusSearch={false}
                        searchDisabled={false}
                        skinTonesDisabled={true}
                        width={280}
                        height={350}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress - Clean & Simple */}
            {(uploadingAttachments || isUploading) && (
              <div className="px-5 pb-4">
                <div className="bg-[#F4F2F6] p-4 rounded-[20px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B699CA]"></div>
                    <span className="text-sm text-[#4A4A4A]">
                      {progress ? `Uploading ${Math.round(progress.progress)}%` : 'Preparing...'}
                    </span>
                  </div>
                  {progress && (
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className="bg-[#B699CA] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons - Clean & Simple */}
            <div className="flex gap-3 p-5 border-t border-black/20">
              <button
                onClick={() => {
                  setShowAttachmentPreview(false);
                  setAttachmentPreviews([]);
                }}
                className="flex-1 py-4 text-[#4A4A4A] bg-[#F4F2F6] rounded-[20px] hover:bg-gray-200 transition-colors font-medium text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const messageInput = document.querySelector('input[placeholder="Add a message..."]') as HTMLInputElement;
                  const message = messageInput?.value || '';

                  // Close modal immediately
                  setShowAttachmentPreview(false);

                  // Send message with attachments
                  handleSendMessage(message);

                  // Clear input
                  if (messageInput) messageInput.value = '';

                  // Clear attachment previews (they will be handled in handleSendMessage)
                }}
                disabled={uploadingAttachments || isUploading}
                className="flex-1 py-4 bg-black text-white rounded-[20px] hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-base shadow-sm"
              >
                {uploadingAttachments || isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}; 