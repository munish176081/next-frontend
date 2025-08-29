import { Meeting, CreateMeetingDto, UpdateMeetingDto } from '@/_types/meeting';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://10.20.20.188:3001') + '/api/v1';

class MeetingApiService {
  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      credentials: 'include',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Schedule a new meeting
  async scheduleMeeting(meetingData: CreateMeetingDto): Promise<Meeting> {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(meetingData),
    });

    return this.handleResponse<Meeting>(response);
  }

  // Get all meetings for the current user
  async getUserMeetings(): Promise<Meeting[]> {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<Meeting[]>(response);
  }

  // Get a specific meeting by ID
  async getMeeting(meetingId: string): Promise<Meeting> {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<Meeting>(response);
  }

  // Update a meeting
  async updateMeeting(meetingId: string, updateData: UpdateMeetingDto): Promise<Meeting> {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updateData),
    });

    return this.handleResponse<Meeting>(response);
  }

  // Cancel a meeting
  async cancelMeeting(meetingId: string): Promise<Meeting> {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/cancel`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<Meeting>(response);
  }

  // Confirm a meeting
  async confirmMeeting(meetingId: string): Promise<Meeting> {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/confirm`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<Meeting>(response);
  }

  // Get meetings for a specific listing
  async getListingMeetings(listingId: string): Promise<Meeting[]> {
    const response = await fetch(`${API_BASE_URL}/meetings/listing/${listingId}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<Meeting[]>(response);
  }

  // Get available time slots for a listing
  async getAvailableSlots(listingId: string, date: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/meetings/available-slots?listingId=${listingId}&date=${date}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<string[]>(response);
  }
}

export const meetingApiService = new MeetingApiService();
