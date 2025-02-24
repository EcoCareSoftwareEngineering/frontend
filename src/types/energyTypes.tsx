export interface TEnergyData {
  energyGenerated: TEnergyValues
  energyUsed: TEnergyValues
  netEnergy: TEnergyValues
}

export type TEnergyValues = number[]
