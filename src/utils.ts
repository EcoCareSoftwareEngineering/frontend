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

export const getTimePeriodForSelection = (
  range: TTimeSelection
): TTimePeriod => {
  switch (range) {
    case 'Past year':
      return 'monthly'
    case 'Past month':
      return 'daily'
    case 'Past week':
      return 'hourly'
    default:
      return 'hourly'
  }
}
