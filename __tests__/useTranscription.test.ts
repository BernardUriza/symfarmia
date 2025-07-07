import { renderHook } from '@testing-library/react'
import { ConsultationProvider } from '../src/contexts/ConsultationContext'
import { useTranscription } from '../hooks/useTranscription'

const wrapper = ({ children }) => <ConsultationProvider>{children}</ConsultationProvider>

describe('useTranscription', () => {
  it('returns default state from context', () => {
    const { result } = renderHook(() => useTranscription(), { wrapper })
    expect(result.current.isRecording).toBe(false)
    expect(result.current.micPermission).toBe('prompt')
  })
})
