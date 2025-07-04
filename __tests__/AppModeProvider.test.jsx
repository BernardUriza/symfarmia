import { renderHook, act } from '@testing-library/react'
import { AppModeProvider, useAppMode } from '../app/providers/AppModeProvider'

const wrapper = ({ children }) => <AppModeProvider>{children}</AppModeProvider>

describe('AppModeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete window.location
    window.location = new URL('http://localhost/')
  })

  it('defaults to live mode', () => {
    const { result } = renderHook(() => useAppMode(), { wrapper })
    expect(result.current.appMode).toBe('live')
  })

  it('toggles and persists mode', () => {
    const { result } = renderHook(() => useAppMode(), { wrapper })
    act(() => {
      result.current.toggleMode()
    })
    expect(result.current.appMode).toBe('demo')
    expect(window.localStorage.getItem('appMode')).toBe('"demo"')
  })
})
