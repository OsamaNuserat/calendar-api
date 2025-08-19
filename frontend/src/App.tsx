import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, RefreshCw, Download, Upload } from 'lucide-react';
import EventModal from './components/EventModal';
import { Event, CreateEventDto } from './types/event';
import { eventService } from './services/eventService';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const fetchedEvents = await eventService.getAllEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      toast.error('Failed to load events');
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setSelectedDate(start);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: CreateEventDto) => {
    try {
      if (selectedEvent) {
        await eventService.updateEvent(selectedEvent.id, eventData);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(eventData);
        toast.success('Event created successfully');
      }
      // Close modal and reset state
      setIsModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
      // Refresh events
      await loadEvents();
    } catch (error) {
      toast.error('Failed to save event');
      console.error('Error saving event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      // Close modal and reset state
      setIsModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
      // Refresh events
      await loadEvents();
    } catch (error) {
      toast.error('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  const handleSyncFromGoogle = async () => {
    try {
      setIsLoading(true);
      await eventService.syncFromGoogleCalendar();
      toast.success('Events synced from Google Calendar');
      loadEvents();
    } catch (error) {
      toast.error('Failed to sync from Google Calendar');
      console.error('Error syncing from Google Calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToGoogle = async () => {
    try {
      setIsLoading(true);
      await eventService.syncToGoogleCalendar();
      toast.success('Events synced to Google Calendar');
      loadEvents();
    } catch (error) {
      toast.error('Failed to sync to Google Calendar');
      console.error('Error syncing to Google Calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">📅 Calendar App</h1>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setSelectedDate(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Add Event</span>
                <span className="sm:hidden">Add</span>
              </button>
              <button
                onClick={loadEvents}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleSyncFromGoogle}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                <Download className="w-5 h-5 mr-2" />
                <span className="hidden md:inline">Sync From Google</span>
                <span className="md:hidden">From Google</span>
              </button>
              <button
                onClick={handleSyncToGoogle}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
                <span className="hidden md:inline">Sync To Google</span>
                <span className="md:hidden">To Google</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="startTime"
            endAccessor="endTime"
            style={{ height: 700 }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            defaultView="month"
            views={['month', 'week', 'day']}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color || '#3b82f6',
                borderRadius: '6px',
                border: 'none',
                color: 'white',
                fontWeight: '500',
              },
            })}
          />
        </div>
      </main>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default App; 