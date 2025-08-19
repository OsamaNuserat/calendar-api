import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { X, Trash2 } from 'lucide-react';
import { Event, CreateEventDto } from '../types/event';
import { format } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  onSave: (eventData: CreateEventDto) => void;
  onDelete: (eventId: string) => void;
  selectedDate?: Date | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  selectedDate,
}) => {
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    location: '',
    allDay: false,
    color: '#3b82f6',
    attendees: [],
  });

  const [attendeeEmail, setAttendeeEmail] = useState('');

  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        title: event.title,
        description: event.description || '',
        startTime: format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"),
        location: event.location || '',
        allDay: event.allDay || false,
        color: event.color || '#3b82f6',
        attendees: event.attendees || [],
      });
    } else {
      // Creating new event
      const startDate = selectedDate || new Date();
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
      
      setFormData({
        title: '',
        description: '',
        startTime: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        location: '',
        allDay: false,
        color: '#3b82f6',
        attendees: [],
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddAttendee = () => {
    if (attendeeEmail && !formData.attendees?.includes(attendeeEmail)) {
      setFormData({
        ...formData,
        attendees: [...(formData.attendees || []), attendeeEmail],
      });
      setAttendeeEmail('');
    }
  };

  const handleRemoveAttendee = (email: string) => {
    setFormData({
      ...formData,
      attendees: formData.attendees?.filter(a => a !== email) || [],
    });
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-lg mx-auto mt-8 bg-white rounded-xl shadow-2xl border border-gray-100 w-full mx-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      style={{
        overlay: {
          zIndex: 1000,
        },
        content: {
          border: 'none',
          borderRadius: '12px',
          padding: '0',
          maxHeight: '90vh',
          overflow: 'auto',
          width: '100%',
          maxWidth: '500px',
        }
      }}
    >
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
              placeholder="Enter event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              placeholder="Enter location"
            />
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-gray-900 cursor-pointer">
              All day event
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-sm text-gray-500">Choose event color</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Attendees
            </label>
            <div className="flex space-x-3 mb-3">
              <input
                type="email"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              <button
                type="button"
                onClick={handleAddAttendee}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
              >
                Add
              </button>
            </div>
            {formData.attendees && formData.attendees.length > 0 && (
              <div className="space-y-2">
                {formData.attendees.map((email, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-700 font-medium">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(email)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {event && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center px-6 py-3 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm"
            >
              {event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EventModal; 