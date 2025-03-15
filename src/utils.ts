import { TTimeSelection, TTimePeriod } from './types/generalTypes'

// Get SCSS variable by name
export const getCSSVariable = (variable: string) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

// Returns base url for local or remote view
export const getLinkTopLevel = () => {
  return location.pathname.includes('local') ? '/local' : '/remote'
}

// Get start and end date for time selection and matching time period
export const geDateRangeAndPeriod = (
  value: TTimeSelection
): [Date, Date, TTimePeriod] => {
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  let timePeriod: TTimePeriod

  switch (value) {
    case 'Past year':
      startDate.setFullYear(startDate.getFullYear() - 1)
      timePeriod = 'monthly'
      break
    case 'Past month':
      startDate.setMonth(startDate.getMonth() - 1)
      timePeriod = 'daily'
      break
    case 'Past week':
      startDate.setDate(startDate.getDate() - 6)
      timePeriod = 'daily'
      break
    default:
      timePeriod = 'hourly'
      break
  }

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 1)
  endDate.setHours(0, 0, 0, 0)

  return [startDate, endDate, timePeriod]
}

// Return formatted string for date
export const getFormattedDateString = (
  date: Date,
  interval: TTimeSelection,
  verboseString: boolean
): string => {
  switch (interval) {
    case 'Today':
      return verboseString
        ? date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          })
        : date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
          })

    case 'Past year':
      return verboseString
        ? date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
          })
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          })

    default:
      return verboseString
        ? date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
  }
}
