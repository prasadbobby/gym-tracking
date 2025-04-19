'use client'

import { getProgress, createProgress, removeProgress } from '@/lib/actions'
import { motion } from 'framer-motion'
import { Plus, Unlink2 } from 'lucide-react'

import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const boxVariants = {
  hover: { scale: 1.05 },
  pressed: { scale: 0.95 }
}

const iconVariants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0 }
}

const tickVariants = {
  checked: { pathLength: 1 },
  unchecked: { pathLength: 0 }
}

export function ToDo ({ exercise, exerciseId, series, progress, workoutDay, setEditOpen }) {
  console.warn(series)
  if (series) {
    const lastWeekProgress = progress.lastWeek
    const threeWeeksAgoProgress = progress.threeWeeksAgo

    const [recommendation, setRecommendation] = useState('')
    const [lastWeekExercises, setLastWeekExercises] = useState([])
    const [threeWeeksAgoExercises, setThreeWeeksAgoExercises] = useState([])
    const [recommendationShown, setRecommendationShown] = useState(false)

    let numberSeries = 0
    let topSet
    let backOffSet
    let seriesTypes = []

    if (series.includes('TP') || series.includes('BOS')) {
      const numbers = series.match(/\d+/g)
      const numericValues = numbers.map(num => parseInt(num, 10))
      topSet = numericValues[0]
      backOffSet = numericValues[1]
    } else if (series.includes('TARGET')) {
      numberSeries = 3
      seriesTypes = ['TARGET', 'TARGET', 'TARGET']
    } else if (isNaN(parseInt(series.trim()[0]))) {
      numberSeries = 1
      seriesTypes = [series.trim()]
    } else {
      // Handle combined series
      const seriesParts = series.split('+').map(part => part.trim())
      seriesParts.forEach(part => {
        const [count, type] = part.split('x').map(item => item.trim())
        const seriesCount = parseInt(count)
        numberSeries += seriesCount
        seriesTypes = seriesTypes.concat(Array(seriesCount).fill(type))
      })
    }

    const [checkedStates, setCheckedStates] = useState(Array(numberSeries).fill(false))
    const [checkedTop, setCheckedTop] = useState(Array(topSet).fill(false))
    const [checkedBack, setCheckedBack] = useState(Array(backOffSet).fill(false))
    const [weightInputs, setWeightInputs] = useState(Array(numberSeries).fill(''))
    const [weightsTop, setWeightsTop] = useState(Array(topSet).fill(''))
    const [weightsBack, setWeightsBack] = useState(Array(backOffSet).fill(''))
    const [repsInputs, setRepsInputs] = useState(Array(numberSeries).fill(''))
    const [repsTop, setRepsTop] = useState(Array(topSet).fill(''))
    const [repsBack, setRepsBack] = useState(Array(backOffSet).fill(''))
    const [isLoading, setIsLoading] = useState(true)
    const [svgPaths, setSvgPaths] = useState([])
    const [svgTop, setSvgTop] = useState([])
    const [svgBack, setSvgBack] = useState([])
    const [types, setTypes] = useState([])
    const [typeTop, setTypeTop] = useState('')
    const [typeBack, setTypeBack] = useState('')
    const [checkedSuper, setCheckedSuper] = useState(false)
    const [weightsSuper, setWeightsSuper] = useState('')
    const [repsSuper, setRepsSuper] = useState('')

    const handleMultiplyClick = (index, type) => {
      let updatedWeights

      switch (type) {
        case 'normal':
          updatedWeights = [...weightInputs]
          updatedWeights[index] = (parseFloat(updatedWeights[index]) || 0) * 2
          setWeightInputs(updatedWeights)
          break

        case 'top':
          updatedWeights = [...weightsTop]
          updatedWeights[index] = (parseFloat(updatedWeights[index]) || 0) * 2
          setWeightsTop(updatedWeights)
          break

        case 'back':
          updatedWeights = [...weightsBack]
          updatedWeights[index] = (parseFloat(updatedWeights[index]) || 0) * 2
          setWeightsBack(updatedWeights)
          break

        case 'super': {
          const currentSuperValue = parseFloat(weightsSuper) || 0
          setWeightsSuper((currentSuperValue * 2).toString())
          break
        }

        default:
          console.error('Invalid type')
      }
    }

    useEffect(() => {
      const filterExercises = (progressData, setStateFunction) => {
        const filteredExercises = progressData.filter(
          (progress) => progress.exercise_id === exerciseId
        )
        setStateFunction(filteredExercises)
      }

      filterExercises(lastWeekProgress, setLastWeekExercises)
      filterExercises(threeWeeksAgoProgress, setThreeWeeksAgoExercises)
    }, [progress, exercise])

    useEffect(() => {
      const analyzeProgress = () => {
        if (lastWeekExercises.length === 0 || threeWeeksAgoExercises.length === 0) {
          return
        }

        const lastWeekPerformance = lastWeekExercises[0]
        const threeWeeksAgoPerformances = threeWeeksAgoExercises.sort((a, b) => new Date(b.date) - new Date(a.date))

        const mostRecentThreeWeeksAgoPerformance = threeWeeksAgoPerformances[0]

        // const hasMultipleWeeks = threeWeeksAgoPerformances.some(perf =>
        //   new Date(perf.date).getTime() !== new Date(mostRecentThreeWeeksAgoPerformance.date).getTime()
        // )

        // if (!hasMultipleWeeks) {
        //   setRecommendation('No hay suficientes datos para hacer una recomendación. Sigue entrenando consistentemente.')
        //   return
        // }

        const weightIncreased = lastWeekPerformance.weight > mostRecentThreeWeeksAgoPerformance.weight
        // const weightDecreased = lastWeekPerformance.weight < mostRecentThreeWeeksAgoPerformance.weight
        const sameWeight = lastWeekPerformance.weight === mostRecentThreeWeeksAgoPerformance.weight

        const repsIncreased = lastWeekPerformance.repetitions > mostRecentThreeWeeksAgoPerformance.repetitions
        // const repsDecreased = lastWeekPerformance.repetitions < mostRecentThreeWeeksAgoPerformance.repetitions
        const sameReps = lastWeekPerformance.repetitions === mostRecentThreeWeeksAgoPerformance.repetitions

        if (weightIncreased) {
          setRecommendation('¡Excelente progreso! Has aumentado el peso desde hace tres semanas. Mantén este ritmo y asegúrate de mantener una buena forma.')
          // } else if (weightDecreased) {
          //   console.log('Weight decreased')
          //   setRecommendation('Has disminuido el peso desde hace tres semanas. Considera revisar tu técnica y nutrición, y asegúrate de descansar adecuadamente.')
        } else if (sameWeight && repsIncreased) {
          console.log('Same weight and reps increased')
          setRecommendation('Has aumentado repeticiones. Considera incrementar el peso en la próxima sesión.')
          // } else if (sameWeight && repsDecreased) {
          //   console.log('Same weight and reps decreased')
          //   setRecommendation('Has mantenido el mismo peso pero has disminuido las repeticiones. Considera mantener este peso hasta que puedas aumentar las repeticiones.')
        } else if (sameWeight && sameReps) {
          console.log('Same weight and reps')
          setRecommendation('Tu rendimiento es constante. Considera subir el peso para avanzar.')
        }
      // } else {
      //   console.log('Variable progress')
      //   setRecommendation('Tu progreso ha sido variable. Enfócate en mantener una progresión constante, ya sea en peso o en repeticiones.')
      // }
      }
      console.log(recommendation)

      analyzeProgress()
    }, [lastWeekExercises, threeWeeksAgoExercises])

    useEffect(() => {
      if (recommendation && !isLoading && !recommendationShown) {
        toast.success(recommendation, {
          // duration: 3000,
          style: {
            minWidth: '50px',
            minHeight: '45px',
            borderRadius: '10px',
            background: '#333',
            color: '#fff'
          }
        })
        setRecommendationShown(true)
      }
    }, [recommendation, isLoading, recommendationShown])

    useEffect(() => {
      const getSvgPath = (type) => {
        switch (type) {
          case 'SST':
            return <><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M12 9v4' /><path d='M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z' /><path d='M12 16h.01' /></>
          case 'CALENTAMIENTO':
            return <><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11' /></>
          case 'TARGET':
            return <><path stroke='none' d='M0 0h24v24H0z' fill='none' /><circle cx='12' cy='12' r='.5' fill='currentColor' /><path d='M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0' /><path d='M12 3l0 2' /><path d='M3 12l2 0' /><path d='M12 19l0 2' /><path d='M19 12l2 0' /></>
          case 'LINEAL':
            return <><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M5 12h2' /><path d='M17 12h2' /><path d='M11 12h2' /></>
          case 'DROPSET':
            return <><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M7 7l10 10' /><path d='M17 8l0 9l-9 0' /></>
          case 'REST PAUSE':
            return <><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z' /><path d='M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z' /></>
          case 'SLOW':
            return <><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M19 18l-14 -4' /><path d='M19 14l-14 -4l14 -4' /></>
          case 'SUPER SERIE':
          case 'SUPERSERIE':
            return <><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z' /></>
          case 'JUMPSET':
            return <><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M4 15.5c3 -1 5.5 -.5 8 4.5c.5 -3 1.5 -5.5 3 -8' /><path d='M18 9a2 2 0 1 1 0 -4a2 2 0 0 1 0 4z' /></>
          default:
            return null
        }
      }
      const newSvgPaths = seriesTypes.map(type => getSvgPath(type))
      setSvgPaths(newSvgPaths)
      setTypes(seriesTypes)

      if (series.includes('TP') || series.includes('TS') || series.includes('BOS')) {
        setSvgTop(<><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M3 17l6 -6l4 4l8 -8' /><path d='M14 7l7 0l0 7' /></>)
        setTypeTop('TS')
        setSvgBack(<><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M3 7l6 6l4 -4l8 8' /><path d='M21 10l0 7l-7 0' /></>)
        setTypeBack('BOS')
      }
    }, [series, seriesTypes])

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true)
        try {
          const data = await getProgress(exerciseId, workoutDay)

          if (data.length > 0) {
            if (series.includes('TP') || series.includes('TS') || series.includes('BOS')) {
              const topSetData = data.filter(item => item.type === 'TS')
              const backOffSetData = data.filter(item => item.type === 'BOS')

              const newCheckedTop = Array(topSet).fill(false)
              const newWeightsTop = Array(topSet).fill('')
              const newRepsTop = Array(topSet).fill('')

              topSetData.forEach((item, index) => {
                if (index < topSet) {
                  newCheckedTop[index] = true
                  newWeightsTop[index] = item.weight
                  newRepsTop[index] = item.reps
                }
              })

              setCheckedTop(newCheckedTop)
              setWeightsTop(newWeightsTop)
              setRepsTop(newRepsTop)

              const newCheckedBack = Array(backOffSet).fill(false)
              const newWeightsBack = Array(backOffSet).fill('')
              const newRepsBack = Array(backOffSet).fill('')

              backOffSetData.forEach((item, index) => {
                if (index < backOffSet) {
                  newCheckedBack[index] = true
                  newWeightsBack[index] = item.weight
                  newRepsBack[index] = item.reps
                }
              })

              setCheckedBack(newCheckedBack)
              setWeightsBack(newWeightsBack)
              setRepsBack(newRepsBack)
            } else if (series.includes('SUPERSERIE') || series.includes('SUPER SERIE') || series.includes('JUMPSET')) {
              const superSerieData = data.filter(item => item.type === 'SUPER SERIE' || item.type === 'SUPERSERIE' || item.type === 'JUMPSET')

              const newCheckedSuper = Array(2).fill(false)
              const newWeightsSuper = Array(2).fill('')
              const newRepsSuper = Array(2).fill('')

              superSerieData.forEach(item => {
                const weights = item.weight.split(',')
                const reps = item.reps.split(',')

                weights.forEach((weight, index) => {
                  if (index < 2) {
                    newCheckedSuper[index] = true
                    newWeightsSuper[index] = weight
                  }
                })

                reps.forEach((rep, index) => {
                  if (index < 2) {
                    newCheckedSuper[index] = true
                    newRepsSuper[index] = rep
                  }
                })
              })

              setCheckedSuper(newCheckedSuper)
              setWeightsSuper(newWeightsSuper)
              setRepsSuper(newRepsSuper)
            } else {
              const newCheckedStates = Array(numberSeries).fill(false)
              const newWeightInputs = Array(numberSeries).fill('')
              const newRepsInputs = Array(numberSeries).fill('')

              data.forEach((item, index) => {
                if (index < numberSeries) {
                  newCheckedStates[index] = true
                  newWeightInputs[index] = item.weight
                  newRepsInputs[index] = item.reps
                }
              })

              setCheckedStates(newCheckedStates)
              setWeightInputs(newWeightInputs)
              setRepsInputs(newRepsInputs)
            }
          }
        } catch (error) {
          toast.error('Error al obtener los datos', {
            style: {
              minWidth: '50px',
              minHeight: '45px',
              borderRadius: '10px',
              background: '#333',
              color: '#fff'
            }
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }, [exerciseId, numberSeries, topSet, backOffSet, series])

    const [progressIds, setProgressIds] = useState({})

    const handleCheckboxChange = async (index, typeCheck) => {
      if (typeCheck === 'TS') {
        if (weightsTop[index] !== '' && repsTop[index] !== '') {
          setCheckedTop(prevStates => {
            const newStates = [...prevStates]
            newStates[index] = !newStates[index]
            return newStates
          })
          if (!checkedTop[index]) {
            const form = document.getElementById(`progressFormTop${index}`)
            const formData = new FormData(form)
            try {
              const insertedId = await createProgress(formData)
              setProgressIds(prev => ({ ...prev, [`top${index}`]: insertedId }))
            } catch (error) {
              toast.error('Error al guardar el progreso', {
                style: {
                  minWidth: '50px',
                  minHeight: '45px',
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff'
                }
              })
            }
          } else {
            const progressId = progressIds[`top${index}`]
            if (progressId) {
              try {
                await removeProgress(progressId)
                setProgressIds(prev => {
                  const newIds = { ...prev }
                  delete newIds[`top${index}`]
                  return newIds
                })
              } catch (error) {
                toast.error('Error al eliminar el progreso', {
                  style: {
                    minWidth: '50px',
                    minHeight: '45px',
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff'
                  }
                })
              }
            }
            setWeightsTop(prev => {
              const newWeights = [...prev]
              newWeights[index] = ''
              return newWeights
            })
            setRepsTop(prev => {
              const newReps = [...prev]
              newReps[index] = ''
              return newReps
            })
          }
        } else {
          toast.error('Tienes que insertar los datos', {
            style: {
              minWidth: '50px',
              minHeight: '45px',
              borderRadius: '10px',
              background: '#333',
              color: '#fff'
            }
          })
        }
      } else if (typeCheck === 'BOS') {
        if (weightsBack[index] !== '' && repsBack[index] !== '') {
          setCheckedBack(prevStates => {
            const newStates = [...prevStates]
            newStates[index] = !newStates[index]
            return newStates
          })
          if (!checkedBack[index]) {
            const form = document.getElementById(`progressFormBack${index}`)
            const formData = new FormData(form)

            try {
              const insertedId = await createProgress(formData)
              setProgressIds(prev => ({ ...prev, [`back${index}`]: insertedId }))
            } catch (error) {
              toast.error('Error al guardar el progreso', {
                style: {
                  minWidth: '50px',
                  minHeight: '45px',
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff'
                }
              })
            }
          } else {
            const progressId = progressIds[`back${index}`]
            if (progressId) {
              try {
                await removeProgress(progressId)
                setProgressIds(prev => {
                  const newIds = { ...prev }
                  delete newIds[`back${index}`]
                  return newIds
                })
              } catch (error) {
                toast.error('Error al eliminar el progreso', {
                  style: {
                    minWidth: '50px',
                    minHeight: '45px',
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff'
                  }
                })
              }
            }
            setWeightsBack(prev => {
              const newWeights = [...prev]
              newWeights[index] = ''
              return newWeights
            })
            setRepsBack(prev => {
              const newReps = [...prev]
              newReps[index] = ''
              return newReps
            })
          }
        } else {
          toast.error('Tienes que insertar los datos', {
            style: {
              minWidth: '50px',
              minHeight: '45px',
              borderRadius: '10px',
              background: '#333',
              color: '#fff'
            }
          })
        }
      } else if (series.includes('SUPER SERIE') || series.includes('SUPERSERIE') || series.includes('JUMPSET')) {
        if (weightInputs[index] !== '' && repsInputs[index] !== '' &&
          weightsBack[index] !== '' && repsBack[index] !== '') {
          setCheckedStates(prevStates => {
            const newStates = [...prevStates]
            newStates[index] = !newStates[index]
            return newStates
          })
          if (!checkedStates[index]) {
            const form = document.getElementById(`progressFormSuperSerie${index}`)
            const formData = new FormData(form)
            try {
              const insertedId = await createProgress(formData)
              setProgressIds(prev => ({ ...prev, [`superSerie${index}`]: insertedId }))
            } catch (error) {
              toast.error('Error al guardar el progreso', {
                style: {
                  minWidth: '50px',
                  minHeight: '45px',
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff'
                }
              })
            }
          } else {
            const progressId = progressIds[`superSerie${index}`]
            if (progressId) {
              try {
                await removeProgress(progressId)
                setProgressIds(prev => {
                  const newIds = { ...prev }
                  delete newIds[`superSerie${index}`]
                  return newIds
                })
              } catch (error) {
                toast.error('Error al eliminar el progreso', {
                  style: {
                    minWidth: '50px',
                    minHeight: '45px',
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff'
                  }
                })
              }
            }
            setWeightInputs(prev => {
              const newWeights = [...prev]
              newWeights[index] = ''
              return newWeights
            })
            setRepsInputs(prev => {
              const newReps = [...prev]
              newReps[index] = ''
              return newReps
            })
            setWeightsBack(prev => {
              const newWeights = [...prev]
              newWeights[index] = ''
              return newWeights
            })
            setRepsBack(prev => {
              const newReps = [...prev]
              newReps[index] = ''
              return newReps
            })
          }
        } else {
          toast.error('Tienes que insertar los datos', {
            style: {
              minWidth: '50px',
              minHeight: '45px',
              borderRadius: '10px',
              background: '#333',
              color: '#fff'
            }
          })
        }
      } else {
        if (weightInputs[index] !== '' && repsInputs[index] !== '') {
          setCheckedStates(prevStates => {
            const newStates = [...prevStates]
            newStates[index] = !newStates[index]
            return newStates
          })
          if (!checkedStates[index]) {
            const form = document.getElementById(`progressForm${index}`)
            const formData = new FormData(form)
            try {
              const insertedId = await createProgress(formData)
              setProgressIds(prev => ({ ...prev, [`normal${index}`]: insertedId }))
            } catch (error) {
              toast.error('Error al guardar el progreso', {
                style: {
                  minWidth: '50px',
                  minHeight: '45px',
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff'
                }
              })
            }
          } else {
            const progressId = progressIds[`normal${index}`]
            if (progressId) {
              try {
                await removeProgress(progressId)
                setProgressIds(prev => {
                  const newIds = { ...prev }
                  delete newIds[`normal${index}`]
                  return newIds
                })
              } catch (error) {
                toast.error('Error al eliminar el progreso', {
                  style: {
                    minWidth: '50px',
                    minHeight: '45px',
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff'
                  }
                })
              }
            }
            setWeightInputs(prev => {
              const newWeights = [...prev]
              newWeights[index] = ''
              return newWeights
            })
            setRepsInputs(prev => {
              const newReps = [...prev]
              newReps[index] = ''
              return newReps
            })
          }
        } else {
          toast.error('Tienes que insertar los datos', {
            style: {
              minWidth: '50px',
              minHeight: '45px',
              borderRadius: '10px',
              background: '#333',
              color: '#fff'
            }
          })
        }
      }
    }

    if (isLoading) {
      if (series.includes('SUPERSERIE') || series.includes('SUPER SERIE') || series.includes('JUMPSET')) {
        return (
          <div className='flex flex-col gap-4 animate-pulse'>
            {numberSeries && Array.from({ length: numberSeries }, (_, index) => (
              <div key={index} className='flex flex-row items-center gap-5'>
                <div className='rounded-2xl border-2 border-svg-border bg-svg-bg relative h-14 w-14 cursor-pointer appearance-none transition-all duration-500 checked:border-svg-border checked:bg-white' />
                <div className='flex flex-row items-center justify-center relative gap-2'>
                  <div className='flex flex-row'>
                    <div className='w-14 h-12 rounded-l-full border-y-[3px] border-l-[3px] border-r-[2px] border-input-border text-center text-white placeholder:text-popover-text focus:outline-none' />
                    <div className='w-14 h-12 rounded-r-full border-y-[3px] border-r-[3px] border-l-[2px] border-input-border text-center text-white placeholder:text-popover-text  focus:outline-none' />
                  </div>
                </div>
                <div className='w-0' />
                <div className='flex flex-row items-center justify-center relative gap-2'>
                  <div className='flex flex-row'>
                    <div className='w-14 h-12 rounded-l-full border-y-[3px] border-l-[3px] border-r-[2px] border-input-border text-center text-white placeholder:text-popover-text focus:outline-none' />
                    <div className='w-14 h-12 rounded-r-full border-y-[3px] border-r-[3px] border-l-[2px] border-input-border text-center text-white placeholder:text-popover-text  focus:outline-none' />
                  </div>
                </div>
              </div>
            ))}
            {topSet && backOffSet && Array.from({ length: topSet + backOffSet }, (_, index) => (
              <div key={index} className='flex flex-row items-center gap-5'>
                <div
                  key={index} className='rounded-2xl border-2 border-svg-border bg-svg-bg relative h-14 w-14 cursor-pointer appearance-none transition-all duration-500 checked:border-svg-border checked:bg-white '
                />
                <div className='flex flex-row gap-3 relative'>
                  <div className='w-20 h-14 rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text' />
                  <div className='w-20 h-14 rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text' />
                </div>
              </div>
            ))}
          </div>
        )
      } else {
        return (
          <div className='flex flex-col gap-4 animate-pulse'>
            {numberSeries && Array.from({ length: numberSeries }, (_, index) => (
              <div key={index} className='flex flex-row items-center gap-5'>
                <div
                  key={index} className='rounded-2xl border-2 border-svg-border bg-svg-bg relative h-14 w-14 cursor-pointer appearance-none transition-all duration-500 checked:border-svg-border checked:bg-white '
                />
                <div className='flex flex-row gap-3 relative'>
                  <div className='w-20 h-14 rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text' />
                  <div className='w-20 h-14 rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text' />
                </div>
              </div>
            ))}
            {topSet && backOffSet && Array.from({ length: topSet + backOffSet }, (_, index) => (
              <div key={index} className='flex flex-row items-center gap-5'>
                <div
                  key={index} className='rounded-2xl border-2 border-svg-border bg-svg-bg relative h-14 w-14 cursor-pointer appearance-none transition-all duration-500 checked:border-svg-border checked:bg-white '
                />
                <div className='flex flex-row gap-3 relative'>
                  <div className='w-20 h-14 rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text' />
                  <div className='w-20 h-14 rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text' />
                </div>
              </div>
            ))}
          </div>
        )
      }
    }

    return (
      <>
        <Toaster containerStyle={{ bottom: -50 }} position='fixed' />
        {(series.includes('SUPER SERIE') || series.includes('SUPERSERIE') || series.includes('JUMPSET')) && Array.from({ length: numberSeries }, (_, index) => (
          <form key={index} action={createProgress} id={`progressFormSuperSerie${index}`} className='flex flex-row items-center max-w-screen gap-4'>
            <label className='relative flex items-center justify-center'>
              <motion.input
                type='checkbox'
                className='rounded-2xl border-2 border-svg-border bg-svg-bg relative h-14 w-14 cursor-pointer appearance-none transition-all duration-500 checked:border-svg-border checked:bg-white'
                onChange={() => handleCheckboxChange(index)}
                checked={checkedSuper[index]}
                variants={boxVariants}
                whileHover='hover'
                whileTap='pressed'
              />
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center text-svg-text'>
                <motion.svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='36'
                  height='36'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='absolute'
                  initial={false}
                  animate={checkedSuper[index] ? 'hidden' : 'visible'}
                  variants={iconVariants}
                >
                  {svgPaths[index] && <>{svgPaths[index]}</>}
                </motion.svg>
                <motion.svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='3.5'
                  stroke='currentColor'
                  className='h-9 w-9 absolute'
                  initial={false}
                  animate={checkedSuper[index] ? 'visible' : 'hidden'}
                  variants={iconVariants}
                >
                  <motion.path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M4.5 12.75l6 6 9-13.5'
                    variants={tickVariants}
                    initial='unchecked'
                    animate={checkedSuper[index] ? 'checked' : 'unchecked'}
                  />
                </motion.svg>
              </div>
            </label>
            <div className='flex flex-row items-center justify-center relative gap-2'>
              <div className='flex flex-row'>
                <input type='hidden' name='exerciseId' value={exerciseId} />
                <input type='hidden' name='type' value='SUPER SERIE' />
                <input type='hidden' name='setIndex' value={index} />
                <input type='hidden' name='workoutDay' value={workoutDay} />
                <div className='w-14 h-12 relative'>
                  <motion.input
                    value={weightsSuper[index]}
                    type='tel'
                    min={0}
                    name='weight1'
                    placeholder='weight'
                    onChange={(e) => {
                      const newWeightInputs = [...weightInputs]
                      newWeightInputs[index] = e.target.value
                      setWeightInputs(newWeightInputs)
                    }}
                    animate={{
                      x: checkedStates[index] ? [0, -4, 0] : [0, 4, 0],
                      color: checkedStates[index] ? '#FFFFFF' : '#FFFFFF'
                    }}
                    initial={false}
                    transition={{
                      duration: 0.3,
                      ease: 'easeOut'
                    }}
                    className='w-full h-full rounded-l-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text'
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleMultiplyClick(index, 'super')
                    }}
                    className='absolute top-0 right-0 h-full w-4 border-[3px] border-l-[1px] border-input-border bg-input-border text-white'
                  >
                    x
                  </button>
                </div>
                <motion.input
                  type='tel'
                  min={1}
                  name='reps1'
                  className='w-14 h-12 rounded-r-full border-y-[3px] border-r-[3px] border-l-[2px] border-input-border text-center text-white placeholder:text-popover-text  focus:outline-none'
                  placeholder='reps'
                  value={repsSuper[index]}
                  onChange={(e) => {
                    const newRepsInputs = [...repsInputs]
                    newRepsInputs[index] = e.target.value
                    setRepsInputs(newRepsInputs)
                  }}
                  animate={{
                    x: checkedStates[index] ? [0, -4, 0] : [0, 4, 0],
                    color: checkedStates[index] ? '#FFFFFF' : '#FFFFFF'
                  }}
                  initial={false}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                />
              </div>
              <Unlink2 color='#424249' />
              <div className='flex flex-row'>
                <div className='relative w-14 h-12'>
                  <motion.input
                    type='tel'
                    min={0}
                    name='weight2'
                    placeholder='weight'
                    value={weightsSuper[index]}
                    onChange={(e) => {
                      const newWeightsBack = [...weightsBack]
                      newWeightsBack[index] = e.target.value
                      setWeightsBack(newWeightsBack)
                    }}
                    animate={{
                      x: checkedStates[index] ? [0, -4, 0] : [0, 4, 0],
                      color: checkedStates[index] ? '#FFFFFF' : '#FFFFFF'
                    }}
                    initial={false}
                    transition={{
                      duration: 0.3,
                      ease: 'easeOut'
                    }}
                    className='w-full h-full rounded-l-full border-y-[3px] border-l-[3px] border-r-[2px] border-input-border text-center text-white placeholder:text-popover-text focus:outline-none'
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleMultiplyClick(index, 'super')
                    }}
                    className='absolute top-0 right-0 h-full w-4 border-[3px] border-l-[1px] border-input-border bg-input-border text-white'
                  >
                    x
                  </button>
                </div>
                <motion.input
                  type='tel'
                  min={1}
                  name='reps2'
                  className='w-14 h-12 rounded-r-full border-y-[3px] border-r-[3px] border-l-[2px] border-input-border text-center text-white placeholder:text-popover-text  focus:outline-none'
                  placeholder='reps'
                  value={repsSuper[index]}
                  onChange={(e) => {
                    const newRepsBack = [...repsBack]
                    newRepsBack[index] = e.target.value
                    setRepsBack(newRepsBack)
                  }}
                  animate={{
                    x: checkedStates[index] ? [0, -4, 0] : [0, 4, 0],
                    color: checkedStates[index] ? '#FFFFFF' : '#FFFFFF'
                  }}
                  initial={false}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                />
              </div>
              <motion.div
                className='absolute top-1/2 left-0 right-0 h-[2px] bg-svg-text pointer-events-none mx-2'
                initial={{ scaleX: 0 }}
                animate={{ scaleX: checkedStates[index] ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </form>
        ))}
        {!series.includes('SUPER SERIE') && !series.includes('SUPERSERIE') && !series.includes('JUMPSET') && numberSeries && Array.from({ length: numberSeries }, (_, index) => (
          <form key={index} action={createProgress} id={`progressForm${index}`} className='flex flex-row items-center gap-5'>
            <label className='relative flex items-center justify-center'>
              <motion.input
                type='checkbox'
                className='rounded-2xl border-2 border-svg-border bg-svg-bg relative h-14 w-14 cursor-pointer appearance-none transition-all duration-500 checked:border-svg-border checked:bg-white'
                onChange={() => handleCheckboxChange(index)}
                checked={checkedStates[index]}
                variants={boxVariants}
                whileHover='hover'
                whileTap='pressed'
              />
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center text-svg-text'>
                <motion.svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='36'
                  height='36'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='absolute'
                  initial={false}
                  animate={checkedStates[index] ? 'hidden' : 'visible'}
                  variants={iconVariants}
                >
                  {svgPaths[index] && <>{svgPaths[index]}</>}
                </motion.svg>
                <motion.svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='3.5'
                  stroke='currentColor'
                  className='h-9 w-9 absolute'
                  initial={false}
                  animate={checkedStates[index] ? 'visible' : 'hidden'}
                  variants={iconVariants}
                >
                  <motion.path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M4.5 12.75l6 6 9-13.5'
                    variants={tickVariants}
                    initial='unchecked'
                    animate={checkedStates[index] ? 'checked' : 'unchecked'}
                  />
                </motion.svg>
              </div>
            </label>
            <div className='flex flex-row gap-3 relative'>
              <input type='hidden' name='exerciseId' value={exerciseId} />
              <input type='hidden' name='exerciseName' value={types[index]} />
              <input type='hidden' name='workoutDay' value={workoutDay} />
              <input type='hidden' name='type' value={types[index]} />

              <div className='relative w-20 h-14'>
                <motion.input
                  value={weightInputs[index]}
                  type='tel'
                  name='weight'
                  placeholder='0 kg'
                  animate={{
                    x: checkedStates[index] ? [0, -4, 0] : [0, 4, 0],
                    color: checkedStates[index] ? '#FFFFFF' : '#FFFFFF'
                  }}
                  initial={false}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  onChange={(e) => {
                    const newWeightInputs = [...weightInputs]
                    newWeightInputs[index] = e.target.value
                    setWeightInputs(newWeightInputs)
                  }}
                  className='w-full h-full rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text pr-8'
                />

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleMultiplyClick(index, 'normal')
                  }}
                  className='absolute top-0 right-0 h-full w-8 rounded-r-full border-[3px] border-l-[1px] border-input-border bg-input-border text-white'
                >
                  x
                </button>
              </div>

              <motion.input
                value={repsInputs[index]}
                type='tel' name='reps' placeholder='0 reps' animate={{
                  x: checkedStates[index] ? [0, -4, 0] : [0, 4, 0],
                  color: checkedStates[index] ? '#FFFFFF' : '#FFFFFF'
                }}
                initial={false}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut'
                }}
                onChange={(e) => {
                  const newRepsInputs = [...repsInputs]
                  newRepsInputs[index] = e.target.value
                  setRepsInputs(newRepsInputs)
                }}
                className='w-20 h-14 rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text'
              />
              <motion.div
                className='absolute top-1/2 left-0 right-0 h-[2px] bg-svg-text pointer-events-none mx-2'
                initial={{ scaleX: 0 }}
                animate={{ scaleX: checkedStates[index] ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </form>
        ))}
        <>

          {!series.includes('SUPER SERIE') && !series.includes('SUPERSERIE') && !series.includes('JUMPSET') && topSet && Array.from({ length: topSet }, (_, index) => (
            <form key={index} action={createProgress} id={`progressFormTop${index}`} className='flex flex-row items-center gap-5'>
              <label className='relative flex items-center justify-center'>
                <motion.input
                  type='checkbox'
                  className='rounded-2xl border-2 border-svg-border bg-svg-bg relative h-14 w-14 cursor-pointer appearance-none transition-all duration-500 checked:border-svg-border checked:bg-white'
                  onChange={() => handleCheckboxChange(index, typeTop)}
                  checked={checkedTop[index]}
                  variants={boxVariants}
                  whileHover='hover'
                  whileTap='pressed'
                />
                <div className='pointer-events-none absolute inset-0 flex items-center justify-center text-svg-text'>
                  <motion.svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='36'
                    height='36'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='absolute'
                    initial={false}
                    animate={checkedTop[index] ? 'hidden' : 'visible'}
                    variants={iconVariants}
                  >
                    {svgTop && <>{svgTop}</>}
                  </motion.svg>
                  <motion.svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='3.5'
                    stroke='currentColor'
                    className='h-9 w-9 absolute'
                    initial={false}
                    animate={checkedTop[index] ? 'visible' : 'hidden'}
                    variants={iconVariants}
                  >
                    <motion.path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M4.5 12.75l6 6 9-13.5'
                      variants={tickVariants}
                      initial='unchecked'
                      animate={checkedTop[index] ? 'checked' : 'unchecked'}
                    />
                  </motion.svg>
                </div>
              </label>
              <div className='flex flex-row gap-3 relative'>
                <input type='hidden' name='exerciseId' value={exerciseId} />
                <input type='hidden' name='type' value={typeTop} />
                <input type='hidden' name='workoutDay' value={workoutDay} />

                <div className='relative w-20 h-14'>
                  <motion.input
                    value={weightsTop[index]}
                    type='tel' name='weight' placeholder='0 kg' animate={{
                      x: checkedTop[index] ? [0, -4, 0] : [0, 4, 0],
                      color: checkedTop[index] ? '#FFFFFF' : '#FFFFFF'
                    }}
                    initial={false}
                    transition={{
                      duration: 0.3,
                      ease: 'easeOut'
                    }}
                    onChange={(e) => {
                      const newWeightInputs = [...weightsTop]
                      newWeightInputs[index] = e.target.value
                      setWeightsTop(newWeightInputs)
                    }}
                    className='w-full h-full rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text pr-8'
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleMultiplyClick(index, 'top')
                    }}
                    className='absolute top-0 right-0 h-full w-8 rounded-r-full border-[3px] border-l-[1px] border-input-border bg-input-border text-white'
                  >
                    x
                  </button>
                </div>
                <motion.input
                  value={repsTop[index]}
                  type='tel' name='reps' placeholder='0 reps' animate={{
                    x: checkedTop[index] ? [0, -4, 0] : [0, 4, 0],
                    color: checkedTop[index] ? '#FFFFFF' : '#FFFFFF'
                  }}
                  initial={false}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  onChange={(e) => {
                    const newRepsInputs = [...repsTop]
                    newRepsInputs[index] = e.target.value
                    setRepsTop(newRepsInputs)
                  }}
                  className='w-20 h-14 rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text'
                />
                <motion.div
                  className='absolute top-1/2 left-0 right-0 h-[2px] bg-svg-text pointer-events-none mx-2'
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: checkedTop[index] ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </form>
          ))}
          {!series.includes('SUPER SERIE') && !series.includes('SUPERSERIE') && !series.includes('JUMPSET') && backOffSet && Array.from({ length: backOffSet }, (_, index) => (
            <form key={index} action={createProgress} id={`progressFormBack${index}`} className='flex flex-row items-center gap-5'>
              <label className='relative flex items-center justify-center'>
                <motion.input
                  type='checkbox'
                  className='rounded-2xl border-2 border-svg-border bg-svg-bg relative h-14 w-14 cursor-pointer appearance-none transition-all duration-500 checked:border-svg-border checked:bg-white'
                  onChange={() => handleCheckboxChange(index, typeBack)}
                  checked={checkedBack[index]}
                  variants={boxVariants}
                  whileHover='hover'
                  whileTap='pressed'
                />
                <div className='pointer-events-none absolute inset-0 flex items-center justify-center text-svg-text'>
                  <motion.svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='36'
                    height='36'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='absolute'
                    initial={false}
                    animate={checkedBack[index] ? 'hidden' : 'visible'}
                    variants={iconVariants}
                  >
                    {svgBack && <>{svgBack}</>}
                  </motion.svg>
                  <motion.svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='3.5'
                    stroke='currentColor'
                    className='h-9 w-9 absolute'
                    initial={false}
                    animate={checkedBack[index] ? 'visible' : 'hidden'}
                    variants={iconVariants}
                  >
                    <motion.path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M4.5 12.75l6 6 9-13.5'
                      variants={tickVariants}
                      initial='unchecked'
                      animate={checkedBack[index] ? 'checked' : 'unchecked'}
                    />
                  </motion.svg>
                </div>
              </label>
              <div className='flex flex-row gap-3 relative'>
                <input type='hidden' name='exerciseId' value={exerciseId} />
                <input type='hidden' name='type' value={typeBack} />
                <input type='hidden' name='workoutDay' value={workoutDay} />

                <div className='relative w-20 h-14'>
                  <motion.input
                    value={weightsBack[index]}
                    type='tel' name='weight' placeholder='0 kg' animate={{
                      x: checkedBack[index] ? [0, -4, 0] : [0, 4, 0],
                      color: checkedBack[index] ? '#FFFFFF' : '#FFFFFF'
                    }}
                    initial={false}
                    transition={{
                      duration: 0.3,
                      ease: 'easeOut'
                    }}
                    onChange={(e) => {
                      const newWeightInputs = [...weightsBack]
                      newWeightInputs[index] = e.target.value
                      setWeightsBack(newWeightInputs)
                    }}
                    className='w-full h-full rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text pr-8'
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleMultiplyClick(index, 'back')
                    }}
                    className='absolute top-0 right-0 h-full w-8 rounded-r-full border-[3px] border-l-[1px] border-input-border bg-input-border text-white'
                  >
                    x
                  </button>
                </div>
                <motion.input
                  value={repsBack[index]}
                  type='tel' name='reps' placeholder='0 reps' animate={{
                    x: checkedBack[index] ? [0, -4, 0] : [0, 4, 0],
                    color: checkedBack[index] ? '#FFFFFF' : '#FFFFFF'
                  }}
                  initial={false}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  onChange={(e) => {
                    const newRepsInputs = [...repsBack]
                    newRepsInputs[index] = e.target.value
                    setRepsBack(newRepsInputs)
                  }}
                  className='w-20 h-14 rounded-full border-[3px] border-input-border text-center text-white placeholder:text-popover-text'
                />
                <motion.div
                  className='absolute top-1/2 left-0 right-0 h-[2px] bg-svg-text pointer-events-none mx-2'
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: checkedBack[index] ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </form>
          ))}
        </>
      </>
    )
  }

  return (
    <div className='flex flex-row items-center gap-5'>
      <p className='text-white'>Add new series</p>
      <div onClick={() => setEditOpen(true)} className='border-card-border flex h-14 w-14 justify-center items-center border-2 rounded-2xl bg-[#17171B] p-4 cursor-pointer ml-1 text-card-border'>
        <Plus />
      </div>
    </div>
  )
}
