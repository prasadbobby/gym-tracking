// src/lib/workouts.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function getExerciseLibrary(query = '', filters = {}) {
  let queryBuilder = supabase
    .from('exercises')
    .select('*')
  
  // Apply text search if provided
  if (query) {
    queryBuilder = queryBuilder.ilike('name', `%${query}%`)
  }
  
  // Apply filters if provided
  if (filters.muscleGroups && filters.muscleGroups.length > 0) {
    queryBuilder = queryBuilder.contains('muscle_groups', filters.muscleGroups)
  }
  
  if (filters.equipment && filters.equipment.length > 0) {
    queryBuilder = queryBuilder.contains('equipment', filters.equipment)
  }
  
  if (filters.difficulty) {
    queryBuilder = queryBuilder.eq('difficulty', filters.difficulty)
  }
  
  const { data, error } = await queryBuilder
  
  if (error) throw error
  return data
}

export async function getWorkoutTemplates(isAdmin = false, userId = null) {
  let queryBuilder = supabase
    .from('workout_templates')
    .select(`
      *,
      workout_template_exercises(
        *,
        exercises(*)
      )
    `)
    .order('created_at', { ascending: false })
  
  // If not admin, only show public templates or user's own templates
  if (!isAdmin && userId) {
    queryBuilder = queryBuilder.or(`is_public.eq.true,created_by.eq.${userId}`)
  }
  
  const { data, error } = await queryBuilder
  
  if (error) throw error
  return data
}

export async function createWorkoutTemplate(templateData, exercises) {
  // First create the template
  const { data: template, error: templateError } = await supabase
    .from('workout_templates')
    .insert([templateData])
    .select()
  
  if (templateError) throw templateError
  
  // Then add exercises to the template
  if (exercises && exercises.length > 0) {
    const templateExercises = exercises.map((exercise, index) => ({
      workout_template_id: template[0].id,
      exercise_id: exercise.id,
      order_index: index,
      sets: exercise.sets,
      reps: exercise.reps,
      rest_time: exercise.restTime,
      notes: exercise.notes
    }))
    
    const { error: exercisesError } = await supabase
      .from('workout_template_exercises')
      .insert(templateExercises)
    
    if (exercisesError) throw exercisesError
  }
  
  return template[0]
}

export async function assignWorkoutPlan(userId, planData, workouts) {
  // Create the workout plan
  const { data: plan, error: planError } = await supabase
    .from('user_workout_plans')
    .insert([{
      user_id: userId,
      ...planData
    }])
    .select()
  
  if (planError) throw planError
  
  // Add workouts to the plan
  if (workouts && workouts.length > 0) {
    const planWorkouts = workouts.map(workout => ({
      plan_id: plan[0].id,
      workout_template_id: workout.templateId,
      day_of_week: workout.dayOfWeek,
      scheduled_date: workout.scheduledDate
    }))
    
    const { error: workoutsError } = await supabase
      .from('plan_workouts')
      .insert(planWorkouts)
    
    if (workoutsError) throw workoutsError
  }
  
  return plan[0]
}

export async function getUserWorkoutPlans(userId) {
  const { data, error } = await supabase
    .from('user_workout_plans')
    .select(`
      *,
      plan_workouts(
        *,
        workout_template:workout_templates(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function logWorkout(workoutData, exercisesData) {
  // Create workout log
  const { data: workout, error: workoutError } = await supabase
    .from('workout_logs')
    .insert([workoutData])
    .select()
  
  if (workoutError) throw workoutError
  
  // Log exercises
  if (exercisesData && exercisesData.length > 0) {
    const exerciseLogs = []
    
    for (const [index, exercise] of exercisesData.entries()) {
      // Create exercise log
      const { data: exerciseLog, error: exerciseError } = await supabase
        .from('exercise_logs')
        .insert([{
          workout_log_id: workout[0].id,
          exercise_id: exercise.id,
          order_index: index
        }])
        .select()
      
      if (exerciseError) throw exerciseError
      
      // Log sets for each exercise
      if (exercise.sets && exercise.sets.length > 0) {
        const setLogs = exercise.sets.map((set, setIndex) => ({
          exercise_log_id: exerciseLog[0].id,
          set_number: setIndex + 1,
          weight: set.weight,
          reps: set.reps,
          rpe: set.rpe,
          duration: set.duration,
          notes: set.notes
        }))
        
        const { error: setsError } = await supabase
          .from('set_logs')
          .insert(setLogs)
        
        if (setsError) throw setsError
      }
      
      exerciseLogs.push(exerciseLog[0])
    }
    
    return { workout: workout[0], exercises: exerciseLogs }
  }
  
  return { workout: workout[0], exercises: [] }
}