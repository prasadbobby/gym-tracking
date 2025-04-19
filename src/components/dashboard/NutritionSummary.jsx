// src/components/dashboard/NutritionSummary.jsx
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Utensils, Droplet } from 'lucide-react';

export default function NutritionSummary({ userId }) {
  const [nutritionData, setNutritionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchNutrition = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // You'd replace this with your actual API call
        const response = await fetch(`/api/nutrition?userId=${userId}&date=${today}`);
        const data = await response.json();
        
        setNutritionData(data);
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNutrition();
  }, [userId]);
  
  if (isLoading) {
    return <div className="h-48 flex items-center justify-center">Loading nutrition data...</div>;
  }
  
  if (!nutritionData) {
    return (
      <div className="text-center py-6">
        <Utensils className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400">No nutrition data for today</p>
        <button className="mt-4 px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
          Log today's food
        </button>
      </div>
    );
  }
  
  const macroData = [
    { name: 'Protein', value: nutritionData.totals.protein_g || 0, color: '#4F46E5' },
    { name: 'Carbs', value: nutritionData.totals.carbs_g || 0, color: '#10B981' },
    { name: 'Fat', value: nutritionData.totals.fat_g || 0, color: '#F59E0B' }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-white">
          <p className="text-sm text-gray-400">Total calories</p>
          <p className="text-2xl font-bold">{nutritionData.totals.calories || 0} kcal</p>
        </div>
        
        <div className="flex items-center">
          <Droplet className="mr-2 text-blue-400" />
          <div>
            <p className="text-sm text-gray-400">Water</p>
            <p className="text-lg font-medium">{nutritionData.water?.totalAmount || 0} ml</p>
          </div>
        </div>
      </div>
      
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={macroData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}g`}
            >
              {macroData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {Object.entries(nutritionData.mealTypes || {})
          .filter(([_, foods]) => foods.length > 0)
          .map(([mealType, _], index) => (
            <div key={index} className="bg-gray-700 p-2 rounded-md">
              <p className="text-white font-medium">{mealType}</p>
              <p className="text-xs text-gray-400">{nutritionData.mealTypesTotals?.[mealType]?.calories || 0} kcal</p>
            </div>
          ))}
      </div>
    </div>
  );
}