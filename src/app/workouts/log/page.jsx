"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getExerciseLibrary, logWorkout } from '@/lib/workouts'
import { auth } from '@/auth'
import { Search, Plus, X, Save, Clock, ChevronDown, ChevronUp } from 'lucide-react'

export default function LogWorkoutPage() {
  const [session, setSession] = useState(null)
  const [exercises, setExercises] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredExercises, setFilteredExercises] = useState([])
  const [selectedExercises, setSelectedExercises] = useState([])
  const [workoutName, setWorkoutName] = useState('')
  const [startTime, setStartTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [showExerciseList, setShowExerciseList] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchSession = async () => {
      const userSession = await auth()
      setSession(userSession)
    }

    const fetchExercises = async () => {
      const exerciseData = await getExerciseLibrary()
      setExercises(exerciseData)
      setFilteredExercises(exerciseData)
    }

    fetchSession()
    fetchExercises()
  }, [])

  useEffect(() => {
    const filtered = exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredExercises(filtered)
  }, [searchQuery, exercises])

  const addExercise = (exercise) => {
    setSelectedExercises([...selectedExercises, {
      id: exercise.id,
      name: exercise.name,
      sets: [{ weight: '', reps: '', completed: false }]
    }])
    setShowExerciseList(false)
    setSearchQuery('')
  }

  const removeExercise = (index) => {
    const updated = [...selectedExercises]
    updated.splice(index, 1)
    setSelectedExercises(updated)
  }

  const addSet = (exerciseIndex) => {
    const updated = [...selectedExercises]
    updated[exerciseIndex].sets.push({ weight: '', reps: '', completed: false })
    setSelectedExercises(updated)
  }

  const removeSet = (exerciseIndex, setIndex) => {
    const updated = [...selectedExercises]
    updated[exerciseIndex].sets.splice(setIndex, 1)
    setSelectedExercises(updated)
  }

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updated = [...selectedExercises]
    updated[exerciseIndex].sets[setIndex][field] = value
    setSelectedExercises(updated)
  }

  const toggleSetCompletion = (exerciseIndex, setIndex) => {
    const updated = [...selectedExercises]
    updated[exerciseIndex].sets[setIndex].completed = 
      !updated[exerciseIndex].sets[setIndex].completed
    setSelectedExercises(updated)
  }

  const handleSaveWorkout = async () => {
    if (selectedExercises.length === 0) {
      alert('Please add at least one exercise to your workout')
      return
    }

    setIsLoading(true)

    try {
      const workoutData = {
        user_id: session.user.id,
        workout_name: workoutName || 'Quick Workout',
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString()
      }

      const exercisesData = selectedExercises.map(exercise => ({
        id: exercise.id,
        sets: exercise.sets.map(set => ({
          weight: parseFloat(set.weight) || 0,
          reps: parseInt(set.reps) || 0,
          completed: set.completed
        }))
      }))

      await logWorkout(workoutData, exercisesData)
      router.push('/workouts/history')
    } catch (error) {
      console.error('Error saving workout:', error)
      alert('Failed to save workout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout user={session?.user}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <label htmlFor="workout-name" className="block text-sm font-medium text-gray-400 mb-1">
                Workout Name
              </label>
              <input
                type="text"
                id="workout-name"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="My Workout"
                className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 w-full md:w-64 text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex items-center text-gray-400">
              <Clock className="w-5 h-5 mr-2" />
              <span>Started: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowExerciseList(true)
                }}
                onFocus={() => setShowExerciseList(true)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {showExerciseList && (
              <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center justify-between"
                      onClick={() => addExercise(exercise)}
                    >
                      <div>
                        <p className="text-white">{exercise.name}</p>
                        <p className="text-xs text-gray-400">{exercise.muscle_groups?.join(', ')}</p>
                      </div>
                      <Plus className="h-5 w-5 text-indigo-400" />
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-400">No exercises found</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {selectedExercises.length > 0 ? (
          <div className="space-y-6">
            {selectedExercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                  <button
                    onClick={() => removeExercise(exerciseIndex)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-400">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Weight</div>
                    <div className="col-span-4">Reps</div>
                    <div className="col-span-3">Actions</div>
                  </div>
                  
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-12 gap-2 mb-2 items-center">
                      <div className="col-span-1 text-gray-400">{setIndex + 1}</div>
                      <div className="col-span-4">
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                            className={`w-full bg-gray-700 border rounded-md px-3 py-1 text-white focus:ring-indigo-500 focus:border-indigo-500 ${
                              set.completed ? 'border-green-500' : 'border-gray-600'
                            }`}
                            placeholder="kg"
                          />
                        </div>
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                          className={`w-full bg-gray-700 border rounded-md px-3 py-1 text-white focus:ring-indigo-500 focus:border-indigo-500 ${
                            set.completed ? 'border-green-500' : 'border-gray-600'
                          }`}
                          placeholder="reps"
                        />
                      </div>
                      <div className="col-span-3 flex space-x-2">
                        <button
                          onClick={() => toggleSetCompletion(exerciseIndex, setIndex)}
                          className={`px-2 py-1 rounded-md ${
                            set.completed
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          {set.completed ? '✓' : ' '}
                        </button>
                        <button
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => addSet(exerciseIndex)}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Set
                </button>
              </div>
            ))}
            
            <div className="mt-8">
              <button
                onClick={handleSaveWorkout}
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" /> Complete Workout
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-400 mb-6">No exercises added to your workout yet</p>
            <p className="text-gray-400">Use the search box above to add exercises</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}