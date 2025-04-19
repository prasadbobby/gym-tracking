// src/app/admin/page.jsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/profile'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import {
  UserStats,
  WorkoutPlanStats,
  MealPlanStats,
  AppointmentStats,
  RecentUsers,
  PendingAppointments
} from '@/components/admin'

export default async function AdminDashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    return redirect('/auth/signin')
  }
  
  // Check if user is admin
  const userProfile = await getUserProfile(session.user.id)
  
  if (userProfile?.role !== 'admin') {
    return redirect('/dashboard')
  }
  
  return (
    <DashboardLayout user={session.user}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UserStats />
          <WorkoutPlanStats />
          <MealPlanStats />
          <AppointmentStats />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent User Registrations</h2>
            <RecentUsers />
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Pending Appointments</h2>
            <PendingAppointments />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-300">Total Workouts Logged</h3>
              <p className="text-2xl font-bold mt-2">3,542</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-300">Most Popular Exercise</h3>
              <p className="text-2xl font-bold mt-2">Bench Press</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-300">Most Active User</h3>
              <p className="text-2xl font-bold mt-2">John Doe</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}