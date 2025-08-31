"use client";

import React from 'react';
import { X, Calendar, Clock, User, FileText, Video, MapPin } from 'lucide-react';

interface MeetingInfoModalProps {
  meeting: any;
  isOpen: boolean;
  onClose: () => void;
}

export const MeetingInfoModal: React.FC<MeetingInfoModalProps> = ({
  meeting,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatDuration = (durationMinutes: number) => {
    if (durationMinutes === 60) return '1 hour';
    if (durationMinutes === 90) return '1.5 hours';
    if (durationMinutes === 120) return '2 hours';
    return `${durationMinutes} minutes`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Meeting Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Listing Title */}
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 text-left">Listing</h3>
                <p className="text-gray-600">{meeting.listingTitle}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 text-left">Date</h3>
                <p className="text-gray-600">{formatDate(meeting.date)}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 text-left">Time</h3>
                <p className="text-gray-600">{formatTime(meeting.time)}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 text-left">Duration</h3>
                <p className="text-gray-600">{formatDuration(meeting.duration)}</p>
              </div>
            </div>

            {/* Buyer */}
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 text-left">Buyer</h3>
                <p className="text-gray-600 text-left">{meeting.buyerName}</p>
                <p className="text-sm text-gray-500 text-left">{meeting.buyerEmail}</p>
              </div>
            </div>

            {/* Seller */}
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 text-left">Seller</h3>
                <p className="text-gray-600 text-left">{meeting.sellerName}</p>
                <p className="text-sm text-gray-500 text-left">{meeting.sellerEmail}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 text-left">Status</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  meeting.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  meeting.status === 'cancelled' || meeting.status.includes('cancelled') ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Google Meet Link */}
            {meeting.googleMeetLink && (
              <div className="flex items-start space-x-3">
                <Video className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 text-left">Meeting Link</h3>
                  <a
                    href={meeting.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {meeting.googleMeetLink}
                  </a>
                </div>
              </div>
            )}

            {/* Notes */}
            {meeting.notes && (
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 text-left">Notes</h3>
                  <p className="text-gray-600 text-left">{meeting.notes}</p>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 text-left">Created</h3>
                <p className="text-gray-600">
                  {new Date(meeting.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
