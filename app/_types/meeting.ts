export type MeetingStatusEnum = 
  | "confirmed" 
  | "pending" 
  | "cancelled" 
  | "completed" 
  | "expired"
  | "tentative"
  | "deleted"
  | "cancelled_by_user"
  | "cancelled_by_buyer"
  | "cancelled_by_seller"
  | "rescheduled"
  | "no_show";

export interface Meeting {
  id: string;
  listingId: string;
  listingTitle: string;
  listingType: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  date: string;
  time: string;
  duration: number; // in minutes
  timezone: string;
  status: MeetingStatusEnum;
  googleMeetLink?: string;
  calendarEventId?: string;
  meetingId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingDto {
  listingId: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  notes?: string;
}

export interface UpdateMeetingDto {
  date?: string;
  time?: string;
  duration?: number;
  timezone?: string;
  status?: MeetingStatusEnum;
  notes?: string;
}
