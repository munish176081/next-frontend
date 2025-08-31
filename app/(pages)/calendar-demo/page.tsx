'use client';

import React, { useState } from 'react';
import { CalendarProvider, useCalendar } from '../../_contexts/calendar-context';
import { CalendarAuthorization, CalendarAuthorizationCompact, CalendarStatus } from '../../_components/calendar/calendar-authorization';
import { useMeetingsWithCalendar } from '../../_services/hooks/meetings/use-meetings-with-calendar';
import { Button } from '../../_components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../_components/ui/card';
import { Input } from '../../_components/ui/form-fields/input';
import Textarea from '../../_components/ui/form-fields/textarea';
import { Calendar, Clock, Users, Video, CheckCircle, AlertCircle } from 'lucide-react';

function CalendarDemoContent() {
  const { 
    isAuthorized, 
    isLoading: calendarLoading, 
    getValidToken,
    authorize 
  } = useCalendar();
  
  const { 
    scheduleMeetingWithCalendar, 
    isLoading: meetingLoading 
  } = useMeetingsWithCalendar();

  const [testMeetingData, setTestMeetingData] = useState({
    listingId: 'demo-listing-123',
    date: '2024-12-21',
    time: '15:00',
    duration: 60,
    timezone: 'Asia/Kolkata',
    notes: 'Test meeting for OAuth calendar integration demo - Golden Retriever puppy viewing',
    enableCalendarIntegration: true,
  });

  const [testResults, setTestResults] = useState<any>(null);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setTestMeetingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testTokenAccess = async () => {
    if (!isAuthorized) {
      alert('Please authorize calendar access first');
      return;
    }

    try {
      const token = await getValidToken();
      if (token) {
        alert(`✅ Access token retrieved successfully!\nToken: ${token.substring(0, 20)}...`);
      } else {
        alert('❌ Failed to get access token');
      }
    } catch (error) {
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testMeetingCreation = async () => {
    try {
      setTestResults(null);
      const result = await scheduleMeetingWithCalendar(testMeetingData);
      setTestResults(result);
    } catch (error) {
      setTestResults({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🗓️ OAuth Calendar Integration Demo</h1>
        <p className="text-muted-foreground">
          Test the complete OAuth calendar integration with automatic meeting invites and Google Meet links.
        </p>
      </div>

      {/* Calendar Authorization Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <CalendarAuthorization />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Integration Status
            </CardTitle>
            <CardDescription>
              Current status of your calendar integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Calendar Status</span>
              <CalendarStatus />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Features Available</span>
              <div className="text-sm text-right">
                <div className={`flex items-center gap-1 ${isAuthorized ? 'text-green-600' : 'text-gray-400'}`}>
                  {isAuthorized ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Auto Invites
                </div>
                <div className={`flex items-center gap-1 ${isAuthorized ? 'text-green-600' : 'text-gray-400'}`}>
                  {isAuthorized ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Google Meet
                </div>
              </div>
            </div>

            <Button 
              onClick={testTokenAccess} 
              disabled={!isAuthorized || calendarLoading}
              variant="outline"
              className="w-full"
            >
              Test Token Access
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Compact Authorization Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Compact Authorization Component</CardTitle>
          <CardDescription>
            This is how the calendar authorization would appear in meeting forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarAuthorizationCompact />
        </CardContent>
      </Card>

      {/* Meeting Creation Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Test Meeting Creation with Calendar Integration
          </CardTitle>
          <CardDescription>
            Create a test meeting to verify OAuth calendar functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1.5">Date</label>
              <input
                type="date"
                value={testMeetingData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="px-4 py-2 text-sm h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1.5">Time</label>
              <input
                type="time"
                value={testMeetingData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="px-4 py-2 text-sm h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <Input
              label="Duration (minutes)"
              type="number"
              value={testMeetingData.duration.toString()}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              min="15"
              max="180"
            />
            
            <Input
              label="Timezone"
              value={testMeetingData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            />
          </div>

          <Textarea
            label="Meeting Notes"
            value={testMeetingData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableCalendar"
              checked={testMeetingData.enableCalendarIntegration}
              onChange={(e) => handleInputChange('enableCalendarIntegration', e.target.checked)}
            />
            <label htmlFor="enableCalendar" className="text-sm">Enable Calendar Integration</label>
          </div>

          <Button 
            onClick={testMeetingCreation}
            disabled={meetingLoading}
            className="w-full"
          >
            {meetingLoading ? 'Creating Meeting...' : 'Create Test Meeting'}
          </Button>

          {testResults && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Test Results:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            OAuth Integration Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">✅ With OAuth (Current)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Automatic email invitations sent</li>
                <li>• Real Google Meet links generated</li>
                <li>• Events in user's personal calendar</li>
                <li>• Email reminders configured</li>
                <li>• Professional meeting experience</li>
                <li>• No manual invitation process</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">❌ Previous Service Account</h4>
              <ul className="space-y-1 text-sm">
                <li>• Could not add attendees</li>
                <li>• Could not create Meet links</li>
                <li>• Events in service calendar only</li>
                <li>• Manual invitation required</li>
                <li>• Poor user experience</li>
                <li>• Limited functionality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            How to Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Connect Google Calendar" above</li>
            <li>Authorize the application with your Google account</li>
            <li>Once connected, test the token access</li>
            <li>Create a test meeting with calendar integration enabled</li>
            <li>Check your Google Calendar for the created event</li>
            <li>Verify that you received email invitations (if using real emails)</li>
            <li>Check if Google Meet link was generated</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CalendarDemoPage() {
  return (
    <CalendarProvider>
      <CalendarDemoContent />
    </CalendarProvider>
  );
}


