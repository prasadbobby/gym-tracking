// src/components/dashboard/WorkoutCalendar.jsx
import { useEffect, useState } from 'react';
import { Calendar, CheckSquare } from 'lucide-react';

export default function WorkoutCalendar({ consistency }) {
  const [calendarDays, setCalendarDays] = useState([]);
  
  useEffect(() => {
    // Get current month days
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty spaces for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', date: null, hasWorkout: false });
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayData = consistency?.find(d => d.date === dateString);
      
      days.push({
        day: i,
        date: dateString,
        hasWorkout: !!dayData?.hasWorkout,
        workoutCount: dayData?.workoutCount || 0
      });
    }
    
    setCalendarDays(days);
  }, [consistency]);
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-gray-400 text-sm">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`relative aspect-square flex items-center justify-center rounded-md
              ${day.day ? 'bg-gray-700' : 'bg-transparent'} 
              ${day.hasWorkout ? 'border border-indigo-500' : ''}
            `}
          >
            <span className={day.hasWorkout ? 'text-white font-medium' : 'text-gray-400'}>
              {day.day}
            </span>
            
            {day.hasWorkout && (
              <div className="absolute bottom-1 right-1">
                <CheckSquare size={10} className="text-indigo-400" />
              </div>
            )}
            
            {day.workoutCount > 1 && (
              <div className="absolute top-1 right-1 bg-indigo-600 rounded-full w-4 h-4 flex items-center justify-center">
                <span className="text-white text-[9px]">{day.workoutCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 border border-indigo-500 mr-1"></div>
          <span>Workout completed</span>
        </div>
        
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}