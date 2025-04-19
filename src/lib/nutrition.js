// src/lib/nutrition.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function getMealPlans(isAdmin = false, userId = null) {
  let queryBuilder = supabase
    .from('meal_plans')
    .select(`
      *,
      meals(
        *,
        food_items(*)
      )
    `)
    .eq('is_template', true)
    .order('created_at', { ascending: false })
  
  // If not admin, filter by created_by
  if (!isAdmin && userId) {
    queryBuilder = queryBuilder.or(`created_by.is.null,created_by.eq.${userId}`)
  }
  
  const { data, error } = await queryBuilder
  
  if (error) throw error
  return data
}

export async function getUserMealPlans(userId) {
  const { data, error } = await supabase
    .from('user_meal_plans')
    .select(`
      *,
      meal_plan:meal_plans(
        *,
        meals(
          *,
          food_items(*)
        )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createMealPlan(mealPlanData, meals) {
  // Create the meal plan
  const { data: mealPlan, error: mealPlanError } = await supabase
    .from('meal_plans')
    .insert([mealPlanData])
    .select()
  
  if (mealPlanError) throw mealPlanError
  
  // Add meals to the plan
  if (meals && meals.length > 0) {
    for (const meal of meals) {
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert([{
          meal_plan_id: mealPlan[0].id,
          ...meal
        }])
        .select()
      
      if (mealError) throw mealError
      
      // Add food items to the meal
      if (meal.foodItems && meal.foodItems.length > 0) {
        const foodItems = meal.foodItems.map((item, index) => ({
          meal_id: mealData[0].id,
          order_index: index,
          ...item
        }))
        
        const { error: foodError } = await supabase
          .from('food_items')
          .insert(foodItems)
        
        if (foodError) throw foodError
      }
    }
  }
  
  return mealPlan[0]
}

export async function assignMealPlan(userId, mealPlanId, assignmentData) {
  const { data, error } = await supabase
    .from('user_meal_plans')
    .insert([{
      user_id: userId,
      meal_plan_id: mealPlanId,
      ...assignmentData
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function logFoodItem(userId, foodData) {
  const { data, error } = await supabase
    .from('food_diary')
    .insert([{
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      ...foodData
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function getDailyNutrition(userId, date) {
  const { data, error } = await supabase
    .from('food_diary')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  
  // Calculate totals
  const totals = data.reduce((acc, item) => {
    acc.calories += item.calories || 0
    acc.protein_g += item.protein_g || 0
    acc.carbs_g += item.carbs_g || 0
    acc.fat_g += item.fat_g || 0
    return acc
  }, { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })
  
  // Group by meal type
  const mealTypes = data.reduce((acc, item) => {
    const mealType = item.meal_type || 'Other'
    if (!acc[mealType]) acc[mealType] = []
    acc[mealType].push(item)
    return acc
  }, {})
  
  return { logs: data, totals, mealTypes }
}

export async function logWaterIntake(userId, amount) {
  const { data, error } = await supabase
    .from('water_logs')
    .insert([{
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      amount_ml: amount
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function getDailyWaterIntake(userId, date) {
  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  
  const totalAmount = data.reduce((sum, log) => sum + (log.amount_ml || 0), 0)
  
  return { logs: data, totalAmount }
}