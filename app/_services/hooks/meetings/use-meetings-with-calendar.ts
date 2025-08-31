import { useState, useEffect, useCallback } from 'react';
import { Meeting, CreateMeetingDto, UpdateMeetingDto } from '@/_types/meeting';
import { meetingApiService } from '@/_services/meetings/meetingApiService';
import { toast } from '@/_hooks/use-toast';
import { useCalendar } from '@/_contexts/calendar-context';
import { parseAxiosError } from '@/_utils/parse-axios-error';

interface CreateMeetingWithCalendarDto extends CreateMeetingDto {
  enableCalendarIntegration?: boolean;
}

export const useMeetingsWithCalendar = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isAuthorized: isCalendarAuthorized, 
    getValidToken,
    authorize: authorizeCalendar 
  } = useCalendar();

  // Fetch all meetings for the current user
  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userMeetings = await meetingApiService.getUserMeetings();
      setMeetings(userMeetings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meetings';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhanced meeting scheduling with calendar integration
  const scheduleMeetingWithCalendar = useCallback(async (
    meetingData: CreateMeetingWithCalendarDto
  ): Promise<Meeting | null> => {
    try {
      setIsLoading(true);
      setError(null);

      let accessToken: string | null = null;
      
      // Get calendar access token if integration is enabled and user is authorized
      if (meetingData.enableCalendarIntegration && isCalendarAuthorized) {
        accessToken = await getValidToken();
        if (!accessToken) {
          toast({
            title: "Calendar Token Expired",
            description: "Please re-authorize calendar access to enable automatic invites.",
            variant: "destructive",
          });
        }
      }

      // Prepare meeting data with access token if available
      const meetingPayload = {
        ...meetingData,
        ...(accessToken && { access_token: accessToken })
      };

      // Remove the enableCalendarIntegration flag before sending to API
      const { enableCalendarIntegration, ...apiPayload } = meetingPayload;

      const newMeeting = await meetingApiService.scheduleMeeting(apiPayload);
      
      setMeetings(prev => [newMeeting, ...prev]);
      
      // Enhanced success message based on calendar integration
      const successMessage = accessToken 
        ? "Meeting scheduled with automatic calendar invites and Google Meet link!"
        : "Meeting scheduled successfully.";
      
      const descriptionMessage = accessToken
        ? "Attendees will receive email invitations with Google Meet link."
        : meetingData.enableCalendarIntegration && !isCalendarAuthorized
        ? "Connect your calendar to enable automatic invites."
        : undefined;
      
      toast({
        title: "Success!",
        description: successMessage,
        variant: "default",
      });

      if (descriptionMessage) {
        // Show additional info about calendar features
        setTimeout(() => {
          toast({
            title: "Calendar Integration",
            description: descriptionMessage,
            variant: "default",
          });
        }, 1000);
      }
      
      return newMeeting;
    } catch (err) {
      console.log('🔍 Error caught in scheduleMeetingWithCalendar:', err);
      
      // Parse structured error response from backend
      const errorData = parseAxiosError(err);
      console.log('📋 Parsed error data:', errorData);
      
      let errorMessage = 'Failed to schedule meeting';
      let errorTitle = 'Error';
      
      if (errorData?.message) {
        // Handle structured error response (like duplicate meeting)
        if (errorData.existingMeeting) {
          // This is a duplicate meeting error
          errorTitle = 'Meeting Already Exists';
          errorMessage = `${errorData.message}. You have a ${errorData.existingMeeting.status} meeting on ${errorData.existingMeeting.date} at ${errorData.existingMeeting.time}.`;
          
          // Show suggestions if available
          if (errorData.suggestions && errorData.suggestions.length > 0) {
            const suggestion = errorData.suggestions[0]; // Show first suggestion
            errorMessage += ` Suggestion: ${suggestion}`;
          }
        } else {
          // Other structured errors (availability, etc.)
          errorMessage = errorData.message;
          if (errorData.suggestion) {
            errorMessage += `. ${errorData.suggestion}`;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isCalendarAuthorized, getValidToken]);

  // Legacy method for backward compatibility
  const scheduleMeeting = useCallback(async (meetingData: CreateMeetingDto): Promise<Meeting | null> => {
    return scheduleMeetingWithCalendar({
      ...meetingData,
      enableCalendarIntegration: isCalendarAuthorized,
    });
  }, [scheduleMeetingWithCalendar, isCalendarAuthorized]);

  // Update an existing meeting
  const updateMeeting = useCallback(async (meetingId: string, updateData: UpdateMeetingDto): Promise<Meeting | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedMeeting = await meetingApiService.updateMeeting(meetingId, updateData);
      
      setMeetings(prev => prev.map(meeting => 
        meeting.id === meetingId ? updatedMeeting : meeting
      ));
      
      toast({
        title: "Success!",
        description: "Meeting updated successfully.",
      });
      
      return updatedMeeting;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update meeting';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel a meeting
  const cancelMeeting = useCallback(async (meetingId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const cancelledMeeting = await meetingApiService.cancelMeeting(meetingId);
      
      setMeetings(prev => prev.map(meeting => 
        meeting.id === meetingId ? cancelledMeeting : meeting
      ));
      
      toast({
        title: "Success!",
        description: "Meeting cancelled successfully.",
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel meeting';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Confirm a meeting (seller only)
  const confirmMeeting = useCallback(async (meetingId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const confirmedMeeting = await meetingApiService.confirmMeeting(meetingId);
      
      setMeetings(prev => prev.map(meeting => 
        meeting.id === meetingId ? confirmedMeeting : meeting
      ));
      
      toast({
        title: "Success!",
        description: "Meeting confirmed successfully.",
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm meeting';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get meetings for a specific listing
  const getListingMeetings = useCallback(async (listingId: string): Promise<Meeting[]> => {
    try {
      setError(null);
      return await meetingApiService.getListingMeetings(listingId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listing meetings';
      setError(errorMessage);
      return [];
    }
  }, []);

  // Get available time slots for a listing
  const getAvailableSlots = useCallback(async (listingId: string, date: string): Promise<string[]> => {
    try {
      setError(null);
      return await meetingApiService.getAvailableSlots(listingId, date);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available slots';
      setError(errorMessage);
      // Return default slots if API fails
      return [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];
    }
  }, []);

  // Prompt user to authorize calendar if not already done
  const promptCalendarAuthorization = useCallback(async (): Promise<boolean> => {
    if (isCalendarAuthorized) {
      return true;
    }

    const shouldAuthorize = window.confirm(
      'Would you like to connect your Google Calendar to automatically send meeting invites with Google Meet links?'
    );

    if (shouldAuthorize) {
      try {
        await authorizeCalendar();
        return true;
      } catch (error) {
        toast({
          title: "Authorization Failed",
          description: "Failed to authorize calendar access. You can try again later.",
          variant: "destructive",
        });
        return false;
      }
    }

    return false;
  }, [isCalendarAuthorized, authorizeCalendar]);

  // Filter meetings by status
  const getMeetingsByStatus = useCallback((status: string) => {
    return meetings.filter(meeting => meeting.status === status);
  }, [meetings]);

  // Get upcoming meetings
  const getUpcomingMeetings = useCallback(() => {
    const now = new Date();
    return meetings.filter(meeting => {
      const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
      return meetingDateTime > now && !['cancelled', 'completed'].includes(meeting.status);
    });
  }, [meetings]);

  // Get past meetings
  const getPastMeetings = useCallback(() => {
    const now = new Date();
    return meetings.filter(meeting => {
      const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
      return meetingDateTime < now || ['cancelled', 'completed'].includes(meeting.status);
    });
  }, [meetings]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return {
    // Core meeting functionality
    meetings,
    isLoading,
    error,
    fetchMeetings,
    scheduleMeeting, // Legacy method
    scheduleMeetingWithCalendar, // Enhanced method
    updateMeeting,
    cancelMeeting,
    confirmMeeting,
    getListingMeetings,
    getAvailableSlots,
    getMeetingsByStatus,
    getUpcomingMeetings,
    getPastMeetings,
    clearError,
    
    // Calendar integration
    isCalendarAuthorized,
    promptCalendarAuthorization,
  };
};
