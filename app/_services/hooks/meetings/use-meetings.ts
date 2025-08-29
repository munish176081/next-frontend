import { useState, useEffect, useCallback } from 'react';
import { Meeting, CreateMeetingDto, UpdateMeetingDto } from '@/_types/meeting';
import { meetingApiService } from '@/_services/meetings/meetingApiService';
import { toast } from '@/_hooks/use-toast';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Schedule a new meeting
  const scheduleMeeting = useCallback(async (meetingData: CreateMeetingDto): Promise<Meeting | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const newMeeting = await meetingApiService.scheduleMeeting(meetingData);
      
      setMeetings(prev => [newMeeting, ...prev]);
      
      toast({
        title: "Success!",
        description: "Meeting scheduled successfully.",
      });
      
      return newMeeting;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule meeting';
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
    meetings,
    isLoading,
    error,
    fetchMeetings,
    scheduleMeeting,
    updateMeeting,
    cancelMeeting,
    confirmMeeting,
    getListingMeetings,
    getAvailableSlots,
    getMeetingsByStatus,
    getUpcomingMeetings,
    getPastMeetings,
    clearError,
  };
};
