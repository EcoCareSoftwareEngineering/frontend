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

export type TTimePeriod = 'Today' | 'Past week' | 'Past month' | 'Past year'

export class ValidApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidApiError'
  }
}
