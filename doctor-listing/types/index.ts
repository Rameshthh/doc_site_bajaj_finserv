export interface Doctor {
  id: number | string
  name: string
  specialties: string[]
  experience: number
  fees: number
  videoConsult: boolean
  inClinic: boolean
  image?: string
  intro?: string
  qualifications?: string
  clinicName?: string
  locality?: string
}
