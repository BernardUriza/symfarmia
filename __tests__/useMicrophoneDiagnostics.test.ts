import { renderHook, act } from '@testing-library/react'
import { useMicrophoneDiagnostics } from '../hooks/useMicrophoneDiagnostics'

describe('useMicrophoneDiagnostics', () => {
  it('initial permission state is prompt', () => {
    const { result } = renderHook(() => useMicrophoneDiagnostics())
    expect(result.current.micPermission).toBe('prompt')
  })

  it('reads permission from Permissions API', async () => {
    const addListener = jest.fn()
    const mockQuery = jest.fn().mockResolvedValue({ state: 'granted', addEventListener: addListener })
    ;(navigator as any).permissions = { query: mockQuery }
    const { result } = renderHook(() => useMicrophoneDiagnostics())
    await act(async () => {
      await result.current.checkMicrophonePermission()
    })
    expect(result.current.micPermission).toBe('granted')
  })
})
