// src/components/dashboard/ProgressSummary.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Scale, Ruler } from 'lucide-react';

export default function ProgressSummary({ userId }) {
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metric, setMetric] = useState('weight');
  
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // You'd replace this with your actual API call
        const response = await fetch(`/api/progress/stats?userId=${userId}`);
        const data = await response.json();
        
        setProgressData(data);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProgress();
  }, [userId]);
  
  if (isLoading) {
    return <div className="h-48 flex items-center justify-center">Loading progress data...</div>;
  }
  
  if (!progressData) {
    return (
      <div className="text-center py-6">
        <TrendingUp className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400">No progress data available</p>
        <button className="mt-4 px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
          Log measurements
        </button>
      </div>
    );
  }
  
  const getMetricData = () => {
    switch(metric) {
      case 'weight':
        return progressData.weight;
      case 'bodyFat':
        return progressData.bodyFat;
      case 'measurements':
        return progressData.measurements;
      default:
        return progressData.weight;
    }
  };
  
  const metricData = getMetricData();
  
  // Calculate change stats
  const calculateChange = () => {
    if (metricData?.length < 2) return { value: 0, percent: 0 };
    
    const latest = metricData[metricData.length - 1].value;
    const oldest = metricData[0].value;
    const change = latest - oldest;
    const percent = ((change / oldest) * 100).toFixed(1);
    
    return { value: change, percent };
  };
  
  const change = calculateChange();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">
            {metric === 'weight' ? 'Weight Progress' : 
             metric === 'bodyFat' ? 'Body Fat Progress' : 'Measurements Progress'}
          </h3>
          
          {change.value !== 0 && (
            <div className="flex items-center text-sm">
              <span className={change.value > 0 ? 'text-red-400' : 'text-green-400'}>
                {change.value > 0 ? '+' : ''}{change.value.toFixed(1)} 
                {metric === 'weight' ? ' kg' : metric === 'bodyFat' ? '%' : ' cm'}
              </span>
              <span className="text-gray-400 ml-2">({change.percent}%)</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`p-2 rounded-md ${metric === 'weight' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setMetric('weight')}
          >
            <Scale className="h-4 w-4" />
          </button>
          
          <button 
            className={`p-2 rounded-md ${metric === 'bodyFat' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setMetric('bodyFat')}
          >
            <div className="h-4 w-4 flex items-center justify-center text-xs">%</div>
          </button>
          
          <button 
            className={`p-2 rounded-md ${metric === 'measurements' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setMetric('measurements')}
          >
            <Ruler className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="h-48">
        {metricData?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metricData}>
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF' }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.375rem' }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
                formatter={(value) => [`${value} ${metric === 'weight' ? 'kg' : metric === 'bodyFat' ? '%' : 'cm'}`, '']}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4F46E5" 
                strokeWidth={2} 
                dot={{ fill: '#4F46E5', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No {metric} data available
          </div>
        )}
      </div>
    </div>
  );
}