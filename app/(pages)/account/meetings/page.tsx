"use client";

import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard, DashboardTable } from "@/_components/common/dashboard-widgets";
import { useMeetings } from '@/_services/hooks/meetings/use-meetings';
import { CalendarAuthorization } from '@/_components/calendar/calendar-authorization';
import { CalendarProvider } from '@/_contexts/calendar-context';
import { useUser } from '@/_services/hooks/user/use-user';
import { useState } from 'react';
import { MoreHorizontal, Check, X, Info, Video, Calendar, User } from 'lucide-react';
import { MeetingInfoModal } from '@/_components/meetings/meeting-info-modal';

// Meeting Action Dropdown Component
const MeetingActionDropdown = ({ meeting, userRole, onConfirm, onReject, onCancel }: {
  meeting: any;
  userRole: 'seller' | 'buyer';
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const getAvailableActions = () => {
    const actions = [];
    
    // Common actions for all statuses
    actions.push({
      label: 'Meeting Info',
      icon: Info,
      onClick: () => {
        setShowInfoModal(true);
        setIsOpen(false);
      }
    });

    // Status-specific actions
    switch (meeting.status) {
      case 'pending':
        if (userRole === 'seller') {
          actions.push({
            label: 'Accept',
            icon: Check,
            onClick: () => {
              onConfirm(meeting.id);
              setIsOpen(false);
            }
          });
          actions.push({
            label: 'Reject',
            icon: X,
            onClick: () => {
              onReject(meeting.id);
              setIsOpen(false);
            }
          });
        } else if (userRole === 'buyer') {
          actions.push({
            label: 'Cancel',
            icon: X,
            onClick: () => {
              onCancel(meeting.id);
              setIsOpen(false);
            }
          });
        }
        break;
        
      case 'confirmed':
        if (meeting.googleMeetLink) {
          actions.push({
            label: 'Join Meeting',
            icon: Video,
            onClick: () => {
              window.open(meeting.googleMeetLink, '_blank');
              setIsOpen(false);
            }
          });
        }
        if (meeting.calendarEventId) {
          actions.push({
            label: 'View in Calendar',
            icon: Calendar,
            onClick: () => {
              // Open Google Calendar event
              const calendarUrl = `https://calendar.google.com/calendar/event?eid=${meeting.calendarEventId}`;
              window.open(calendarUrl, '_blank');
              setIsOpen(false);
            }
          });
        }
        break;
        
      case 'completed':
        // No additional actions needed
        break;
        
      case 'cancelled_by_buyer':
      case 'cancelled_by_seller':
      case 'cancelled_by_user':
        // No additional actions needed
        break;
        
      default:
        // For other statuses, show basic actions
        break;
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Meeting actions"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-600" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Simple Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] min-w-max">
            {/* Arrow */}
            <div className="absolute -top-1 right-3 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
            <div className="py-2">
              {availableActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-gray-50 focus:text-gray-900"
                >
                  <action.icon className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
              
              {availableActions.length === 1 && (
                <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-100 bg-gray-50">
                  No additional actions available
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Meeting Info Modal */}
      <MeetingInfoModal
        meeting={meeting}
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
};

const Meetings = () => {
  const { meetings, isLoading, confirmMeeting, rejectMeeting, cancelMeeting } = useMeetings();
  const { data: currentUser } = useUser();

  // Transform meetings data to match the original table format, but add functionality to action
  const meetingRows = meetings.map(meeting => {
    const userRole = currentUser?.id === meeting.sellerId ? 'seller' : 'buyer';
    
    return {
      buyer: meeting.buyerName || "Unknown",
      puppy: meeting.listingTitle || "Unknown Listing", 
      date: meeting.date,
      time: meeting.time,
      status: meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1),
      action: (
        <MeetingActionDropdown
          meeting={meeting}
          userRole={userRole}
          onConfirm={confirmMeeting}
          onReject={rejectMeeting}
          onCancel={cancelMeeting}
        />
      )
    };
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Meetings" showTimeFilter={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <CalendarProvider>
      <DashboardLayout title="Meetings" showTimeFilter={false}>
        <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
          <div className="flex flex-col w-full gap-4">
            {/* Calendar Integration Card */}
            <CalendarAuthorization />
            
            {/* Meetings Table */}
            <DashboardCard title="Scheduled Meetings" className="w-full">
              <DashboardTable
                headers={["BUYER", "PUPPY", "DATE", "TIME", "STATUS", "ACTION"]}
                data={meetingRows}
              />
            </DashboardCard>
          </div>
        </div>
      </DashboardLayout>
    </CalendarProvider>
  );
};

export default Meetings;
