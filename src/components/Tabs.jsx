'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ScaleIcon } from 'lucide-react'
import NutritionChart from '@/components/charts/NutritionChart'
import TrainingChart from '@/components/charts/TrainingChart'
import WeightChart from '@/components/charts/WeightChart'

const tabs = [
  { id: 'weight', label: 'Weight', content: 'En esta sección podrás encontrar consejos para el control y mantenimiento de peso.', Chart: WeightChart },
  { id: 'nutrition', label: 'Nutrition', content: 'Bienvenido a la página de nutrición. Aquí encontrarás información sobre dietas y alimentos saludables.', Chart: NutritionChart },
  { id: 'training', label: 'Training', content: 'Descubre rutinas de entrenamiento y ejercicios para mantenerte en forma.', Chart: TrainingChart }
]

const MetricCard = ({ title, value, unit }) => (
  <div className='bg-card-bg border-2 border-card-border rounded-3xl flex flex-col justify-between items-center p-3 h-[72px] w-[105px] max-w-[105px]'>
    <p className='text-xs font-medium text-white/75'>{title}</p>
    <p className='text-xl font-bold text-white'>{value} {unit}</p>
  </div>
)

const WeightMetrics = ({ weightMetrics }) => (
  <div className='flex flex-row justify-between w-full pt-4'>
    <MetricCard title='Peso Actual' value={weightMetrics.latestWeight} unit='kg' />
    <MetricCard title='Peso Máximo' value={weightMetrics.maxWeight} unit='kg' />
    <MetricCard title='Peso Mínimo' value={weightMetrics.minWeight} unit='kg' />
  </div>
)

const NutritionMetrics = ({ nutritionData }) => (
  <div className='flex flex-row justify-between w-full pt-4'>
    <MetricCard title='Carbohydrate' value={nutritionData.carbs} unit='g' />
    <MetricCard title='Protein' value={nutritionData.protein} unit='g' />
    <MetricCard title='Fat' value={nutritionData.fat} unit='g' />
  </div>
)

const TrainingMetrics = ({ trainingStats }) => {
  const topMuscleGroups = Object.entries(trainingStats || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className='flex flex-row justify-between w-full pt-4'>
      {topMuscleGroups.map(([muscleGroup, count], index) => (
        <MetricCard key={index} title={muscleGroup} value={count} unit='' />
      ))}
    </div>
  )
}

const WeightSummary = ({ weightMetrics, chartData }) => (
  <div className='flex w-full items-center justify-between text-sm pb-2'>
    <div className='flex items-center gap-2 font-medium text-white'>
      {weightMetrics.weightChange >= 0
        ? <ArrowUp className='h-4 w-4 text-red-500' />
        : <ArrowDown className='h-4 w-4 text-green-500' />}
      <span>{Math.abs(weightMetrics.weightChange).toFixed(1)} kg</span>
      <span className='text-white/50'>({weightMetrics.weightChangePercentage}%)</span>
    </div>
    <div className='text-white/50'>
      {chartData.weight[0]?.date} - {chartData.weight[chartData.weight.length - 1]?.date}
    </div>
  </div>
)

const NutritionSummary = ({ nutritionMetrics }) => (
  <div className='flex w-full items-center justify-between text-sm pb-2'>
    <div className='flex items-center gap-2 font-medium text-white'>
      <ScaleIcon className='h-4 w-4 text-white' />
      <span className='text-white/75'>Calorías totales</span>
    </div>
    <span className='text-white font-bold'>{nutritionMetrics.dailyCalories} kcal</span>
  </div>
)

const TrainingSummary = () => (
  <div className='min-h-7 pb-2' />
)

export default function Tabs ({ totalProgress }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const [windowSize, setWindowSize] = useState({ width: 500, height: 300 })
  const [chartData, setChartData] = useState({
    weight: [],
    nutrition: [],
    training: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [trainingData, setTrainingData] = useState([])
  const [trainingStats, setTrainingStats] = useState({})

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/profile')
        const responseData = await response.json()

        setChartData({
          weight: responseData.weightData.map((item) => ({
            date: new Date(item.date).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            }),
            weight: item.weight
          })),
          nutrition: responseData.nutritionData,
          training: responseData.trainingData || []
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const weightMetrics = useMemo(() => {
    const weightData = chartData.weight
    if (weightData.length === 0) return { latestWeight: 0, initialWeight: 0, weightChange: 0, weightChangePercentage: '0.0', maxWeight: 0, minWeight: 0 }

    const latestWeight = weightData[weightData.length - 1].weight
    const initialWeight = weightData[0].weight
    const weightChange = latestWeight - initialWeight
    const weightChangePercentage = ((weightChange / initialWeight) * 100).toFixed(1)
    const maxWeight = Math.max(...weightData.map(item => item.weight))
    const minWeight = Math.min(...weightData.map(item => item.weight))

    return { latestWeight, initialWeight, weightChange, weightChangePercentage, maxWeight, minWeight }
  }, [chartData.weight])

  const nutritionMetrics = useMemo(() => {
    if (chartData.nutrition && chartData.nutrition.macro) {
      return {
        dailyCalories: Math.round(chartData.nutrition.tmb || 0),
        carbs: Math.round(chartData.nutrition.macro.carbs || 0),
        protein: Math.round(chartData.nutrition.macro.protein || 0),
        fat: Math.round(chartData.nutrition.macro.fat || 0)
      }
    } else {
      return { dailyCalories: 0, carbs: 0, protein: 0, fat: 0 }
    }
  }, [chartData.nutrition])

  const calculateMuscleGroupPercentages = useCallback((data) => {
    const muscleGroupCounts = data.reduce((acc, exercise) => {
      const muscleGroup = exercise.muscle_group
      acc[muscleGroup] = (acc[muscleGroup] || 0) + 1
      return acc
    }, {})

    const total = Object.values(muscleGroupCounts).reduce((acc, count) => acc + count, 0)

    const percentages = Object.entries(muscleGroupCounts).map(([muscleGroup, count]) => ({
      subject: muscleGroup,
      A: ((count / total) * 100).toFixed(2),
      fullMark: 100
    }))

    return { percentages, counts: muscleGroupCounts }
  }, [])

  useEffect(() => {
    if (totalProgress && totalProgress.length > 0) {
      const { percentages, counts } = calculateMuscleGroupPercentages(totalProgress)
      setTrainingData(percentages)
      setTrainingStats(counts)
    }
  }, [totalProgress, calculateMuscleGroupPercentages])

  const renderSummary = () => {
    switch (activeTab) {
      case 'weight':
        return <WeightSummary weightMetrics={weightMetrics} chartData={chartData} />
      case 'nutrition':
        return <NutritionSummary nutritionMetrics={nutritionMetrics} />
      case 'training':
        return <TrainingSummary />
      default:
        return null
    }
  }

  const renderMetrics = () => {
    switch (activeTab) {
      case 'weight':
        return <WeightMetrics weightMetrics={weightMetrics} />
      case 'nutrition':
        return <NutritionMetrics nutritionData={nutritionMetrics} />
      case 'training':
        return <TrainingMetrics trainingStats={trainingStats} />
      default:
        return null
    }
  }

  if (isLoading) {
    return <div>Loading ...</div>
  }

  const ActiveChart = tabs.find((tab) => tab.id === activeTab)?.Chart

  return (
    <div className='w-full h-full flex flex-col gap-3'>
      <div className='flex space-x-1 justify-center items-center py-1 -mt-4 bg-bg-profile rounded-2xl mx-10 border-2 border-card-border'>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'bg-bg-app rounded-2xl text-white'
                : 'bg-muted text-white/70 hover:bg-muted-foreground/10'
            } relative px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId='activeTab'
                className='absolute inset-0 bg-primary'
                style={{ borderRadius: 16 }}
                transition={{ type: 'spring', duration: 0.6 }}
              />
            )}
            <span className='relative z-10'>{tab.label}</span>
          </motion.button>
        ))}
      </div>
      {renderSummary()}
      <div className='rounded-lg overflow-hidden w-full h-full'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className='w-full h-[250px] rounded-3xl'
          >
            {ActiveChart && <ActiveChart data={chartData[activeTab]} windowSize={windowSize} trainingData={trainingData} />}
          </motion.div>
        </AnimatePresence>
      </div>
      {renderMetrics()}
    </div>
  )
}
