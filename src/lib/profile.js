// src/lib/profile.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      body_measurements(*, date),
      progress_photos(*, date)
    `)
    .eq('id', userId)
    .order('date', { foreignTable: 'body_measurements', ascending: false })
    .order('date', { foreignTable: 'progress_photos', ascending: false })
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
  
  if (error) throw error
  return data
}

export async function addBodyMeasurements(userId, measurementsData) {
  const { data, error } = await supabase
    .from('body_measurements')
    .insert([{
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      ...measurementsData
    }])
  
  if (error) throw error
  return data
}

export async function uploadProgressPhoto(userId, photoFile, photoType) {
  // Upload photo to Supabase Storage
  const fileName = `${userId}/${Date.now()}-${photoType}.jpg`
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('progress-photos')
    .upload(fileName, photoFile)
  
  if (uploadError) throw uploadError
  
  // Get public URL
  const { data: urlData } = supabase
    .storage
    .from('progress-photos')
    .getPublicUrl(fileName)
  
  // Save reference to database
  const { data, error } = await supabase
    .from('progress_photos')
    .insert([{
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      photo_url: urlData.publicUrl,
      photo_type: photoType
    }])
  
  if (error) throw error
  return data
}