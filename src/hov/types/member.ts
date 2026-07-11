export interface HOVMember {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone: string

  dateOfBirth: string
  ageVerified: boolean

  membershipStatus:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'SUSPENDED'

  agreementVersion?: string

  createdAt?: string
  updatedAt?: string
}