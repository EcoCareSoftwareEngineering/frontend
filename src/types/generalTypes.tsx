export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export type Tag = {
  name: string
  tagId: number
  tagType: 'Room' | 'User' | 'Custom'
}
