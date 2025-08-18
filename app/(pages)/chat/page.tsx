"use client";
import React from 'react';
import { ChatInterface } from '@/_components/chat/ChatInterface';

export default function ChatPage() {
  // For now, using a hardcoded user ID - this should come from your auth system
  const userId = "test-user-id"; // Replace with actual user ID from your auth

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatInterface 
        userId={userId}
        onBack={() => window.history.back()}
      />
    </div>
  );
}