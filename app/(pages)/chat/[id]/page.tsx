"use client";
import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ChatInterface } from '@/_components/chat/ChatInterface';
import { DashboardLayout } from '@/_components/common/dashboard-layout';
import { useUser } from '@/_services/hooks/user/use-user';

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: user, isLoading: isLoadingUser } = useUser();
  
  const conversationId = params.id as string;
  const listingId = searchParams.get('listingId');

  if (isLoadingUser) {
    return (
      <DashboardLayout title="Inbox" showTimeFilter={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-CPrimary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Inbox" showTimeFilter={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">User not authenticated</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Inbox" showTimeFilter={true}>
      <ChatInterface
        userId={user.id}
        initialConversationId={conversationId}
        listingId={listingId}
      />
    </DashboardLayout>
  );
} 