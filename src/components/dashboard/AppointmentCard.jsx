// src/components/dashboard/AppointmentCard.jsx
import { Calendar, Clock, User } from 'lucide-react';

export default function AppointmentCard({ appointment }) {
  const formatTime = (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-white">{appointment.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
        </div>
        
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <span>{appointment.trainer?.display_name || 'Unassigned trainer'}</span>
        </div>
      </div>
      
      {appointment.meeting_link && (
        <a 
          href={appointment.meeting_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          Join meeting
        </a>
      )}
    </div>
  );
}