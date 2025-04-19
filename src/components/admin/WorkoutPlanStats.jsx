// src/components/admin/WorkoutPlanStats.jsx
import { Dumbbell } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WorkoutPlanStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    usage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/admin/workouts/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (isLoading) {
    return <div className="bg-gray-700 p-6 rounded-lg shadow animate-pulse h-32"></div>;
  }
  
  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">Workout Plans</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          
          <div className="mt-4 flex space-x-4 text-sm">
            <div>
              <p className="text-gray-400">Active</p>
              <p className="text-white font-medium">{stats.active}</p>
            </div>
            <div>
              <p className="text-gray-400">Completed</p>
              <p className="text-white font-medium">{stats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-600 p-3 rounded-full">
          <Dumbbell className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-gray-600 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stats.usage}%` }}></div>
        </div>
        <p className="text-sm text-gray-400 mt-1">{stats.usage}% usage rate</p>
      </div>
    </div>
  );
}