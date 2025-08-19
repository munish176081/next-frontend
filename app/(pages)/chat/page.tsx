"use client";
import React from 'react';
import { ChatInterface } from '@/_components/chat/ChatInterface';
import { useUser } from "@/_services/hooks/user/use-user";

export default function ChatPage() {
  const { data: user, isLoading } = useUser();

  return (
    <div className="min-h-screen ">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
      <ChatInterface 
        userId={user?.id || ''}
          onBack={() => window.history.back()}
        />
      )}
    </div>
  );
}