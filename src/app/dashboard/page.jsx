// src/app/dashboard/page.jsx
import { auth } from '@/auth'
import { getUserProfile } from '@/lib/profile'
import { getUserWorkoutPlans } from '@/lib/workouts'
import { getUserMealPlans } from '@/lib/nutrition'
import { getUserAppointments } from '@/lib/appointments'
import { getWorkoutConsistency } from '@/lib/progress'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { 
  DashboardCard, 
  WorkoutPlanCard, 
  MealPlanCard, 
  AppointmentCard,
  WorkoutCalendar,
  NutritionSummary,
  ProgressSummary
} from '@/components/dashboard'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    return redirect('/auth/signin')
  }
  
  // Fetch user data
  const userProfile = await getUserProfile(session.user.id)
  const workoutPlans = await getUserWorkoutPlans(session.user.id)
  const mealPlans = await getUserMealPlans(session.user.id)
  const appointments = await getUserAppointments(session.user.id)
  const consistency = await getWorkoutConsistency(session.user.id, 30)
  
  // Find active plans
  const activeWorkoutPlan = workoutPlans.find(plan => plan.status === 'active')
  const activeMealPlan = mealPlans.find(plan => plan.status === 'active')
  
  // Find upcoming appointments
  const upcomingAppointments = appointments
    .filter(apt => new Date(`${apt.appointment_date}T${apt.start_time}`) > new Date())
    .sort((a, b) => new Date(`${a.appointment_date}T${a.start_time}`) - new Date(`${b.appointment_date}T${b.start_time}`))
    .slice(0, 3)
  
  return (
    <DashboardLayout user={session.user}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome card */}
          <DashboardCard className="col-span-full bg-gradient-to-r from-blue-600 to-indigo-700">
            <h2 className="text-2xl font-bold">Welcome back, {userProfile?.display_name || session.user.name}</h2>
            <p className="mt-2">Here's an overview of your fitness journey</p>
          </DashboardCard>
          
          {/* Workout plan */}
          <DashboardCard title="Current Workout Plan">
            {activeWorkoutPlan ? (
              <WorkoutPlanCard plan={activeWorkoutPlan} />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">No active workout plan</p>
                <a href="/workouts/plans" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
                  Find a workout plan
                </a>
              </div>
            )}
          </DashboardCard>
          
          {/* Meal plan */}
          <DashboardCard title="Current Meal Plan">
            {activeMealPlan ? (
              <MealPlanCard plan={activeMealPlan} />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">No active meal plan</p>
                <a href="/nutrition/meal-plans" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
                  Find a meal plan
                </a>
              </div>
            )}
          </DashboardCard>
          
          {/* Upcoming appointments */}
          <DashboardCard title="Upcoming Appointments">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
                {appointments.length > 3 && (
                  <a href="/appointments" className="block text-sm text-indigo-400 hover:text-indigo-300 text-center">
                    View all appointments
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">No upcoming appointments</p>
                <a href="/appointments/schedule" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
                  Schedule session
                </a>
              </div>
            )}
          </DashboardCard>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workout calendar */}
          <DashboardCard title="Workout Calendar">
            <WorkoutCalendar consistency={consistency} />
          </DashboardCard>
          
          {/* Nutrition summary */}
          <DashboardCard title="Nutrition Summary">
            <NutritionSummary userId={session.user.id} />
          </DashboardCard>
        </div>
        
        {/* Progress summary */}
        <DashboardCard title="Your Progress">
          <ProgressSummary userId={session.user.id} />
        </DashboardCard>
      </div>
    </DashboardLayout>
  )
}