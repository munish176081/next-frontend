"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChatInterface } from '@/_components/chat/ChatInterface';
import { DashboardLayout } from '@/_components/common/dashboard-layout';
import { useUser } from '@/_services/hooks/user/use-user';

const NewChat = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = searchParams.get('listingId');
  const { data: user, isLoading: isLoadingUser } = useUser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) {
      setError('No listing ID provided');
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [listingId]);

  if (isLoadingUser) {
    return (
      <DashboardLayout title="New Conversation" showTimeFilter={false}>
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
      <DashboardLayout title="New Conversation" showTimeFilter={false}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">User not authenticated</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="New Conversation" showTimeFilter={false}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-CPrimary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="New Conversation" showTimeFilter={false}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-CPrimary text-white rounded-lg hover:bg-CPrimary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="New Conversation" showTimeFilter={false}>
      <div className="flex items-center justify-between pb-4 mb-4">
        <span className="text-[32px] max-md:text-lg font-semibold flex items-center gap-2">
          New Conversation
        </span>
        <button
          onClick={() => router.push('/chat')}
          className="px-4 py-2 text-CPrimary border border-CPrimary rounded-lg hover:bg-CPrimary hover:text-white transition-colors"
        >
          Back to Inbox
        </button>
      </div>

      <ChatInterface
        userId={user.id}
        initialConversationId="new"
        listingId={listingId || undefined}
      />
    </DashboardLayout>
  );
};

export default NewChat; 