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
      case 'tentative':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
      case 'cancelled_by_user':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled_by_buyer':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled_by_seller':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'deleted':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200';
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
      case 'tentative':
        return 'Tentative';
      case 'cancelled':
        return 'Cancelled';
      case 'cancelled_by_user':
        return 'Buyer Cancelled';
      case 'cancelled_by_buyer':
        return 'Buyer Cancelled';
      case 'cancelled_by_seller':
        return 'Seller Cancelled';
      case 'deleted':
        return 'Deleted';
      case 'completed':
        return 'Completed';
      case 'expired':
        return 'Expired';
      case 'rescheduled':
        return 'Rescheduled';
      case 'no_show':
        return 'No Show';
      default:
        return status;
    }
  };

  const handleAcceptMeeting = async () => {
    setIsLoading(true);
    try {
      await meetingApiService.confirmMeeting(meeting.id);
      toast({
        title: "Meeting Accepted",
        description: "The meeting has been accepted successfully.",
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowActions(false);
    }
  };

  const handleRejectMeeting = async () => {
    setIsLoading(true);
    try {
      await meetingApiService.cancelMeeting(meeting.id);
      toast({
        title: "Meeting Rejected",
        description: "The meeting has been rejected successfully.",
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowActions(false);
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
    setShowActions(false);
  };

  const handleSeeMeetingDetails = () => {
    // For now, just show the notes in a toast
    // In the future, this could open a modal or navigate to a details page
    if (meeting.notes) {
      toast({
        title: "Meeting Details",
        description: meeting.notes,
      });
    } else {
      toast({
        title: "Meeting Details",
        description: "No additional details available for this meeting.",
      });
    }
    setShowActions(false);
  };

  const canJoinMeeting = () => {
    const now = new Date();
    const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
    const meetingEndTime = new Date(meetingDateTime.getTime() + meeting.duration * 60000);
    
    return now >= meetingDateTime && now <= meetingEndTime && meeting.status === 'confirmed';
  };

  const canAcceptMeeting = () => {
    // Can accept if status is pending or tentative
    return ['pending', 'tentative'].includes(meeting.status);
  };

  const canRejectMeeting = () => {
    // Can reject if status is pending, confirmed, or tentative
    return ['pending', 'confirmed', 'tentative'].includes(meeting.status);
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      return format(dateTime, 'MMM dd, yyyy - h:mm a');
    } catch {
      return `${date} at ${time}`;
    }
  };

  // Close actions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActions && !(event.target as Element).closest('.actions-container')) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActions]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative">
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
          <div className="relative actions-container">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {/* Three-dot Menu Actions */}
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                {/* Join Meeting */}
                {canJoinMeeting() && (
                  <button
                    onClick={handleJoinMeeting}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Join Meeting
                  </button>
                )}

                {/* See Meeting Details */}
                <button
                  onClick={handleSeeMeetingDetails}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  See Meeting Details
                </button>

                {/* Accept Meeting */}
                {canAcceptMeeting() && (
                  <button
                    onClick={handleAcceptMeeting}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isLoading ? 'Accepting...' : 'Accept Meeting'}
                  </button>
                )}

                {/* Reject Meeting */}
                {canRejectMeeting() && (
                  <button
                    onClick={handleRejectMeeting}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {isLoading ? 'Rejecting...' : 'Reject Meeting'}
                  </button>
                )}

                {/* Copy Meeting Link */}
                {meeting.googleMeetLink && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(meeting.googleMeetLink!);
                      toast({
                        title: "Link Copied",
                        description: "Meeting link copied to clipboard.",
                      });
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2m-6-4l.5-.5m0 0l2.5-2.5M12 12l2.5-2.5M12 12l-.5-.5m0 0l-2.5 2.5M12 12l-2.5 2.5" />
                    </svg>
                    Copy Meeting Link
                  </button>
                )}
              </div>
            )}
          </div>
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

      {/* Quick Actions Bar */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {canJoinMeeting() && (
          <button
            onClick={handleJoinMeeting}
            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Join Meeting
          </button>
        )}
        
        {canAcceptMeeting() && (
          <button
            onClick={handleAcceptMeeting}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Accepting...' : 'Accept'}
          </button>
        )}

        {canRejectMeeting() && (
          <button
            onClick={handleRejectMeeting}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Rejecting...' : 'Reject'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;
