export interface TEnergyData {
  energyGenerated: number[]
  energyUsed: number[]
  netEnergy: number[]
}

export type TEnergyValues = {
  percentage: number
  data: number[]
  sum: number
}
