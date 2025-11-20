"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/_hooks/use-toast';
import { meetingApiService } from '@/_services/meetings/meetingApiService';
import { CreateMeetingDto } from '@/_types/meeting';
import { useMeetingsWithCalendar } from '@/_services/hooks/meetings/use-meetings-with-calendar';
import { useCalendar } from '@/_contexts/calendar-context';
import { CalendarAuthorizationCompact } from '../calendar/calendar-authorization-compact';
import { DatePicker } from '@/_components/ui/date-picker';

const meetingSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(180, 'Duration cannot exceed 3 hours'),
  notes: z.string().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingScheduleFormProps {
  listingId: string;
  listingTitle: string;
  sellerName: string;
  onMeetingScheduled?: () => void;
  onCancel?: () => void;
}

const MeetingScheduleForm: React.FC<MeetingScheduleFormProps> = ({
  listingId,
  listingTitle,
  sellerName,
  onMeetingScheduled,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Calendar integration hooks
  const { scheduleMeetingWithCalendar } = useMeetingsWithCalendar();
  const { isAuthorized: isCalendarAuthorized } = useCalendar();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      notes: '', // Ensure this is explicitly set to empty string
    },
  });

  const watchedDate = watch('date');
  const watchedDuration = watch('duration');

  // Fetch available time slots when date or duration changes
  useEffect(() => {
    if (watchedDate) {
      setSelectedDate(watchedDate);
      fetchAvailableSlots(watchedDate);
    }
  }, [watchedDate, watchedDuration]);

  const fetchAvailableSlots = async (date: string) => {
    try {
      const slots = await meetingApiService.getAvailableSlots(listingId, date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // If API fails, provide default slots
      setAvailableSlots([
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ]);
    }
  };

  const onSubmit = async (data: MeetingFormData) => {
    if (!data.date || !data.time) {
      toast({
        title: "Validation Error",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Debug: Log the form data
      console.log('Form data being submitted:', data);
      console.log('Notes field value:', data.notes);
      
      // Sanitize notes field - remove any code-like content
      let sanitizedNotes = data.notes || '';
      if (sanitizedNotes.includes('import') || sanitizedNotes.includes('export') || sanitizedNotes.includes('./dto')) {
        console.warn('Notes field contains code-like content, clearing it');
        sanitizedNotes = '';
      }

      const meetingData = {
        listingId,
        date: data.date,
        time: data.time,
        duration: data.duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: sanitizedNotes,
        enableCalendarIntegration: isCalendarAuthorized, // Enable if user has authorized calendar
      };

      console.log('Meeting data being sent to API:', meetingData);
      console.log('Calendar authorized:', isCalendarAuthorized);
      
      // Use calendar-integrated meeting creation
      const meeting = await scheduleMeetingWithCalendar(meetingData);
      
      // Only call onMeetingScheduled if meeting was successfully created
      if (meeting) {
        onMeetingScheduled?.();
      }
      
      // Note: Success/error toasts are handled by the scheduleMeetingWithCalendar hook
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      // Error toasts are handled by the scheduleMeetingWithCalendar hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow scheduling up to 30 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Schedule Meeting</h3>
        <p className="text-gray-600">
          Schedule a meeting with <span className="font-medium">{sellerName}</span> about{' '}
          <span className="font-medium">{listingTitle}</span>
        </p>
      </div>

      {/* Calendar Integration */}
      <div className="mb-6">
        <CalendarAuthorizationCompact />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date *
          </label>
          <DatePicker
            date={watchedDate ? new Date(watchedDate) : undefined}
            setDate={(date) => {
              if (date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                setValue('date', `${year}-${month}-${day}`, { shouldValidate: true });
              } else {
                setValue('date', '', { shouldValidate: true });
              }
            }}
            min={new Date(getMinDate())}
            max={new Date(getMaxDate())}
            error={errors.date?.message}
            placeholder="Select a date"
            className={errors.date ? 'border-red-500' : ''}
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Time *
          </label>
          <select
            {...register('time')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.time ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Duration *
          </label>
          <select
            {...register('duration', { valueAsNumber: true })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.duration ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Any specific topics you'd like to discuss..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Meeting Information</h4>
            <div className="mt-2 text-sm text-blue-700">
              <p>• A Google Meet link will be generated and sent to both parties</p>
              <p>• You'll receive email confirmations for the meeting</p>
              <p>• You can reschedule or cancel up to 24 hours before the meeting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduleForm;
