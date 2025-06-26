export type MeetingStatusEnum = "confirmed" | "pending" | "cancelled";

export interface Meeting {
  id: string;
  listing: string;
  type: string;
  date: string;
  time: string;
  meetingWith: string;
  status: MeetingStatusEnum;
  action: string;
}
