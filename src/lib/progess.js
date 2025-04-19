// src/lib/progress.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function getWorkoutHistory(userId, startDate = null, endDate = null) {
  let query = supabase
    .from('workout_logs')
    .select(`
      *,
      exercise_logs(
        *,
        exercise:exercise_id(*),
        set_logs(*)
      )
    `)
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
  
  if (startDate) {
    query = query.gte('start_time', startDate)
  }
  
  if (endDate) {
    query = query.lte('start_time', endDate)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getBodyMeasurementHistory(userId) {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getProgressPhotos(userId) {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getPersonalRecords(userId) {
  // This query finds the highest weight for each exercise
  const { data: exerciseData, error: exerciseError } = await supabase
    .from('exercises')
    .select('id, name, muscle_groups')
  
  if (exerciseError) throw exerciseError
  
  const personalRecords = []
  
  for (const exercise of exerciseData) {
    // Find the highest weight for this exercise
    const { data: setData, error: setError } = await supabase.rpc(
      'get_max_weight_for_exercise',
      { 
        user_id_param: userId,
        exercise_id_param: exercise.id
      }
    )
    
    if (setError) throw setError
    
    if (setData && setData.length > 0) {
      personalRecords.push({
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        muscle_groups: exercise.muscle_groups,
        max_weight: setData[0].max_weight,
        reps: setData[0].reps,
        date: setData[0].created_at
      })
    }
  }
  
  return personalRecords
}

export async function getWorkoutConsistency(userId, days = 30) {
  // Get start date (X days ago)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  // Get workout logs for date range
  const { data, error } = await supabase
    .from('workout_logs')
    .select('start_time')
    .eq('user_id', userId)
    .gte('start_time', startDate.toISOString())
    .order('start_time', { ascending: true })
  
  if (error) throw error
  
  // Create a map of dates with workouts
  const workoutDays = {}
  data.forEach(log => {
    const date = new Date(log.start_time).toISOString().split('T')[0]
    workoutDays[date] = (workoutDays[date] || 0) + 1
  })
  
  // Create array of all days in range with workout status
  const allDays = []
  const currentDate = new Date(startDate)
  const endDate = new Date()
  
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0]
    allDays.push({
      date: dateString,
      hasWorkout: Boolean(workoutDays[dateString]),
      workoutCount: workoutDays[dateString] || 0
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return allDays
}