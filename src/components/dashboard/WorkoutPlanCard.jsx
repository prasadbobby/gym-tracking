// src/components/dashboard/WorkoutPlanCard.jsx
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';

export default function WorkoutPlanCard({ plan }) {
  return (
    <Link href={`/workouts/plans/${plan.id}`} className="block">
      <div className="flex items-center justify-between hover:bg-gray-700 p-3 rounded-lg transition duration-200">
        <div className="flex items-center">
          <div className="bg-indigo-600 p-3 rounded-lg mr-4">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white">{plan.meal_plan?.name || plan.name}</h3>
            <p className="text-gray-400 text-sm">
              {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
}