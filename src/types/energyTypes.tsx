export type TEnergyValues = [
  {
    datetime: Date
    netEnergy: number
    energyUsage: number
    energyGenerated: number
  }
]

export interface TEnergySums {
  energyGenerated: number
  energyUsed: number
  netEnergy: number
  totalSum: number
}
