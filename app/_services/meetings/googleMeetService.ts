class GoogleMeetService {
  /**
   * Generate a Google Meet link
   * This creates a simple Google Meet link that can be used for meetings
   */
  static generateMeetLink(meetingTitle: string, startTime: string, duration: number): string {
    // Create a unique meeting ID based on title and time
    const meetingId = this.generateMeetingId(meetingTitle, startTime);
    
    // Generate Google Meet link
    const meetLink = `https://meet.google.com/${meetingId}`;
    
    return meetLink;
  }

  /**
   * Generate a unique meeting ID
   */
  private static generateMeetingId(title: string, startTime: string): string {
    // Create a hash from title and start time
    const combined = `${title}-${startTime}`;
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to base36 and take first 12 characters
    const base36 = Math.abs(hash).toString(36);
    return base36.padEnd(12, '0').substring(0, 12);
  }

  /**
   * Create a Google Calendar event with Google Meet
   * This opens Google Calendar with pre-filled meeting details
   */
  static createCalendarEvent(meetingData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    attendees: string[];
    location?: string;
  }): string {
    const {
      title,
      description,
      startTime,
      endTime,
      attendees,
      location = 'Google Meet'
    } = meetingData;

    // Format dates for Google Calendar
    const startDate = new Date(startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // Create Google Calendar URL
    const calendarUrl = new URL('https://calendar.google.com/calendar/render');
    calendarUrl.searchParams.set('action', 'TEMPLATE');
    calendarUrl.searchParams.set('text', title);
    calendarUrl.searchParams.set('details', description);
    calendarUrl.searchParams.set('dates', `${startDate}/${endDate}`);
    calendarUrl.searchParams.set('location', location);
    calendarUrl.searchParams.set('add', 'true');
    
    // Add attendees
    attendees.forEach(email => {
      calendarUrl.searchParams.append('add', email);
    });

    return calendarUrl.toString();
  }

  /**
   * Generate a meeting invitation email template
   */
  static generateInvitationEmail(meetingData: {
    title: string;
    date: string;
    time: string;
    duration: number;
    meetLink: string;
    hostName: string;
    attendeeName: string;
    notes?: string;
  }): { subject: string; body: string } {
    const { title, date, time, duration, meetLink, hostName, attendeeName, notes } = meetingData;
    
    const subject = `Meeting Invitation: ${title}`;
    
    const body = `
Dear ${attendeeName},

You have been invited to a meeting by ${hostName}.

Meeting Details:
- Title: ${title}
- Date: ${date}
- Time: ${time}
- Duration: ${duration} minutes
- Meeting Link: ${meetLink}

${notes ? `Notes: ${notes}` : ''}

To join the meeting, click on the link above or copy and paste it into your browser.

Best regards,
${hostName}

---
This meeting was scheduled through Pups4Sale.
    `.trim();

    return { subject, body };
  }

  /**
   * Check if a meeting time is available
   * This is a simple check - in a real implementation, you'd check against calendar availability
   */
  static isTimeSlotAvailable(startTime: string, duration: number, existingMeetings: Array<{ startTime: string; duration: number }>): boolean {
    const proposedStart = new Date(startTime);
    const proposedEnd = new Date(proposedStart.getTime() + duration * 60000);

    for (const meeting of existingMeetings) {
      const existingStart = new Date(meeting.startTime);
      const existingEnd = new Date(existingStart.getTime() + meeting.duration * 60000);

      // Check for overlap
      if (proposedStart < existingEnd && proposedEnd > existingStart) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get available time slots for a given date
   * This provides business hours with 30-minute intervals
   */
  static getAvailableTimeSlots(date: string, existingMeetings: Array<{ startTime: string; duration: number }> = []): string[] {
    const slots = [];
    const businessHours = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    for (const time of businessHours) {
      const startTime = `${date}T${time}`;
      if (this.isTimeSlotAvailable(startTime, 30, existingMeetings)) {
        slots.push(time);
      }
    }

    return slots;
  }
}

export default GoogleMeetService;
