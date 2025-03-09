export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export type TMUIAutocompleteOption =
  | {
      id: number
      label: string
    }
  | undefined
  | null

export type TUserLogin = {
  username: string
  password: string
}

export interface TDateRange {
  startDate: Date
  endDate: Date
}

export type TTimeIncrement = 'hour' | 'day' | 'week' | 'month'

export type TTimeSelection = 'Today' | 'Past week' | 'Past month' | 'Past year'

export type TTimePeriod = 'hourly' | 'daily' | 'weekly' | 'monthly'

export class ValidApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidApiError'
  }
}
