// src/components/layouts/DashboardLayout.jsx
"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from '@/auth'
import { 
  Home, 
  Dumbbell, 
  Calendar, 
  PieChart, 
  Utensils, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function DashboardLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Workouts', href: '/workouts', icon: Dumbbell },
    { name: 'Nutrition', href: '/nutrition', icon: Utensils },
    { name: 'Progress', href: '/progress', icon: PieChart },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]
  
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Workout Plans', href: '/admin/workout-plans', icon: Dumbbell },
    { name: 'Meal Plans', href: '/admin/meal-plans', icon: Utensils },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]
  
  const isAdmin = user?.role === 'admin'
  const items = isAdmin ? adminNavigation : navigation
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-900/80" aria-hidden="true" />
        
        <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 overflow-y-auto">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="GymtrackAPH"
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="text-white text-xl font-bold">GymtrackAPH</span>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                  pathname === item.href
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    pathname === item.href
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-white'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
            
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white group"
            >
              <LogOut
                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white"
                aria-hidden="true"
              />
              Sign Out
            </button>
          </nav>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-gray-800">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="flex items-center px-4">
            <Image
              src="/logo.png"
              alt="GymtrackAPH"
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="text-white text-xl font-bold">GymtrackAPH</span>
          </div>
          
          <nav className="mt-5 flex-1 px-2 pb-4 space-y-1">
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                  pathname === item.href
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    pathname === item.href
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-white'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
            
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white group"
            >
              <LogOut
                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white"
                aria-hidden="true"
              />
              Sign Out
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-gray-800 shadow">
          <button
            type="button"
            className="px-4 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <h1 className="text-2xl font-semibold text-white">
                {pathname === '/dashboard' ? 'Dashboard' : 
                 pathname === '/workouts' ? 'Workouts' :
                 pathname === '/nutrition' ? 'Nutrition' :
                 pathname === '/progress' ? 'Progress' :
                 pathname === '/appointments' ? 'Appointments' :
                 pathname === '/profile' ? 'Profile' :
                 pathname === '/settings' ? 'Settings' :
                 pathname.startsWith('/admin') ? `Admin ${pathname.split('/')[2] || 'Dashboard'}` :
                 'GymtrackAPH'}
              </h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* User profile dropdown */}
              <div className="relative ml-3">
                <div className="flex items-center">
                  <span className="hidden md:inline-block text-sm font-medium text-white mr-2">
                    {user?.name || 'User'}
                  </span>
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={user?.image || 'https://ui-avatars.com/api/?name=User&background=random'}
                    alt="User"
                    width={32}
                    height={32}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1 p-6 bg-gray-900 text-white">
          {children}
        </main>
      </div>
    </div>
  )
}