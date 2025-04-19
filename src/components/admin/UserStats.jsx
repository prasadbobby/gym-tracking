// src/components/admin/UserStats.jsx
import { Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function UserStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    new: 0,
    growth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/admin/users/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
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
          <p className="text-sm font-medium text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          
          <div className="mt-4 flex space-x-4 text-sm">
            <div>
              <p className="text-gray-400">Active</p>
              <p className="text-white font-medium">{stats.active}</p>
            </div>
            <div>
              <p className="text-gray-400">New (30d)</p>
              <p className="text-white font-medium">{stats.new}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-600 p-3 rounded-full">
          <Users className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${stats.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {stats.growth >= 0 ? '+' : ''}{stats.growth}%
        </span>
        <span className="text-sm text-gray-400 ml-2">from last month</span>
      </div>
    </div>
  );
}