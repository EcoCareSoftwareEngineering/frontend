export type TEnergyValues = {
  datetime: Date
  netEnergy: number
  energyUsage: number
  energyGenerated: number
}[]

export interface TEnergySums {
  energyGenerated: number
  energyUsed: number
  netEnergy: number
  totalSum: number
}

export interface TEnergyGoal {
  goalId: number
  name?: string
  target: number
  progress: number
  completed: boolean
  date?: Date
}
