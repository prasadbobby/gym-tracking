// src/lib/appointments.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function getAvailableTrainers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, email')
    .eq('role', 'trainer')
  
  if (error) throw error
  return data
}

export async function getTrainerAvailability(trainerId, date) {
  const { data, error } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('trainer_id', trainerId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled')
  
  if (error) throw error
  
  // Default available hours (9 AM to 5 PM)
  const workHours = { start: 9, end: 17 }
  const appointmentSlots = []
  
  // Generate 30-minute slots
  for (let hour = workHours.start; hour < workHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (minute === 30 && hour === workHours.end - 1) continue
      
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const endHour = minute === 30 ? hour + 1 : hour
      const endMinute = minute === 30 ? 0 : 30
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
      
      // Check if slot is available
      const isBooked = data.some(appointment => {
        return (startTime >= appointment.start_time && startTime < appointment.end_time) ||
               (endTime > appointment.start_time && endTime <= appointment.end_time) ||
               (startTime <= appointment.start_time && endTime >= appointment.end_time)
      })
      
      appointmentSlots.push({
        startTime,
        endTime,
        available: !isBooked
      })
    }
  }
  
  return appointmentSlots
}

export async function bookAppointment(userId, appointmentData) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      user_id: userId,
      ...appointmentData
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

// src/lib/appointments.js (continued)
export async function getUserAppointments(userId) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        trainer:trainer_id(id, display_name, email)
      `)
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
    
    if (error) throw error
    return data
  }
  
  export async function getTrainerAppointments(trainerId) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        user:user_id(id, display_name, email)
      `)
      .eq('trainer_id', trainerId)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
    
    if (error) throw error
    return data
  }
  
  export async function updateAppointmentStatus(appointmentId, status, meetingLink = null) {
    const updateData = { status }
    if (meetingLink) updateData.meeting_link = meetingLink
    
    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
    
    if (error) throw error
    return data[0]
  }