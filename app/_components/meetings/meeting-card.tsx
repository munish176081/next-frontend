"use client";

import React, { useState } from 'react';
import { Meeting, MeetingStatusEnum } from '@/_types/meeting';
import { meetingApiService } from '@/_services/meetings/meetingApiService';
import { toast } from '@/_hooks/use-toast';
import { format } from 'date-fns';

interface MeetingCardProps {
  meeting: Meeting;
  onUpdate?: () => void;
  userRole: 'buyer' | 'seller';
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onUpdate, userRole }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: MeetingStatusEnum) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: MeetingStatusEnum) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const handleConfirmMeeting = async () => {
    if (userRole !== 'seller') return;
    
    setIsLoading(true);
    try {
      await meetingApiService.confirmMeeting(meeting.id);
      toast({
        title: "Meeting Confirmed",
        description: "The meeting has been confirmed successfully.",
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelMeeting = async () => {
    setIsLoading(true);
    try {
      await meetingApiService.cancelMeeting(meeting.id);
      toast({
        title: "Meeting Cancelled",
        description: "The meeting has been cancelled successfully.",
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = () => {
    if (meeting.googleMeetLink) {
      window.open(meeting.googleMeetLink, '_blank');
    } else {
      toast({
        title: "No Meeting Link",
        description: "Meeting link is not available yet.",
        variant: "destructive",
      });
    }
  };

  const canJoinMeeting = () => {
    const now = new Date();
    const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
    const meetingEndTime = new Date(meetingDateTime.getTime() + meeting.duration * 60000);
    
    return now >= meetingDateTime && now <= meetingEndTime && meeting.status === 'confirmed';
  };

  const canCancelMeeting = () => {
    const now = new Date();
    const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
    const hoursUntilMeeting = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilMeeting >= 24 && ['pending', 'confirmed'].includes(meeting.status);
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      return format(dateTime, 'MMM dd, yyyy - h:mm a');
    } catch {
      return `${date} at ${time}`;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{meeting.listingTitle}</h3>
          <p className="text-sm text-gray-600">{meeting.listingType}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(meeting.status)}`}>
            {getStatusText(meeting.status)}
          </span>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Meeting Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDateTime(meeting.date, meeting.time)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{meeting.duration} minutes</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>
            Meeting with {userRole === 'buyer' ? meeting.sellerName : meeting.buyerName}
          </span>
        </div>

        {meeting.notes && (
          <div className="text-sm text-gray-600">
            <p className="font-medium">Notes:</p>
            <p className="mt-1">{meeting.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {canJoinMeeting() && (
              <button
                onClick={handleJoinMeeting}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Join Meeting
              </button>
            )}

            {userRole === 'seller' && meeting.status === 'pending' && (
              <button
                onClick={handleConfirmMeeting}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Confirming...' : 'Confirm'}
              </button>
            )}

            {canCancelMeeting() && (
              <button
                onClick={handleCancelMeeting}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Cancelling...' : 'Cancel'}
              </button>
            )}

            {meeting.googleMeetLink && (
              <button
                onClick={() => navigator.clipboard.writeText(meeting.googleMeetLink!)}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Copy Link
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!showActions && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {canJoinMeeting() && (
            <button
              onClick={handleJoinMeeting}
              className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Join Meeting
            </button>
          )}
          
          {meeting.status === 'pending' && userRole === 'seller' && (
            <button
              onClick={handleConfirmMeeting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingCard;
