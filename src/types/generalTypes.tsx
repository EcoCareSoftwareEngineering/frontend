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
