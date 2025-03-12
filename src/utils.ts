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

export const handleUpdateTimePeriod = (value: TTimeSelection) => {
  const date = new Date()
  const adjustTime = {
    Today: () => date,
    'Past week': () => {
      date.setDate(date.getDate() - 6)
      return date
    },
    'Past month': () => {
      date.setMonth(date.getMonth() - 1)
      return date
    },
    'Past year': () => {
      date.setFullYear(date.getFullYear() - 1)
      return date
    },
  }
  return adjustTime[value]()
}

export const getTimePeriodForSelection = (
  range: TTimeSelection
): TTimePeriod => {
  switch (range) {
    case 'Past year':
      return 'monthly'
    case 'Past month':
      return 'daily'
    case 'Past week':
      return 'daily'
    default:
      return 'hourly'
  }
}
