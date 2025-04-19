// src/components/dashboard/MealPlanCard.jsx
import Link from 'next/link';
import { Utensils, ChevronRight } from 'lucide-react';

export default function MealPlanCard({ plan }) {
  return (
    <Link href={`/nutrition/meal-plans/${plan.id}`} className="block">
      <div className="flex items-center justify-between hover:bg-gray-700 p-3 rounded-lg transition duration-200">
        <div className="flex items-center">
          <div className="bg-green-600 p-3 rounded-lg mr-4">
            <Utensils className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white">{plan.meal_plan?.name || plan.name}</h3>
            <p className="text-gray-400 text-sm">
              {plan.meal_plan?.diet_type || 'Custom plan'} • {plan.meal_plan?.calories || '---'} cal
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
}