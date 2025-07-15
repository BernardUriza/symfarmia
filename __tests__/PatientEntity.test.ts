import Patient from '../src/domains/patient/entities/Patient'

describe('Patient entity', () => {
  const base = {
    name: 'Alice',
    email: 'alice@example.com',
    phone: '123',
    information: 'none',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'F',
    status: 'Active'
  }

  it('validates required fields', () => {
    const patient = new Patient(base)
    expect(patient.validate()).toBe(true)
    patient.name = ''
    expect(patient.validate()).toBe(false)
  })

  it('updates status', () => {
    const patient = new Patient(base)
    patient.updateStatus('Done')
    expect(patient.status).toBe('Done')
  })
})
