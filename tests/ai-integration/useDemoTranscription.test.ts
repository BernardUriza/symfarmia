import { renderHook, act } from '@testing-library/react'
import { useDemoTranscription } from '../../src/domains/medical-ai/hooks/legacy/useDemoTranscription'

jest.useFakeTimers()

test('useDemoTranscription lifecycle', () => {
  const { result, rerender } = renderHook(
    ({ recording }) => useDemoTranscription({ isRecording: recording }),
    { initialProps: { recording: true } }
  )

  act(() => {
    jest.advanceTimersByTime(600)
  })

  expect(result.current.isProcessing).toBe(true)
  expect(result.current.transcription).toMatch(/Iniciando/)

  rerender({ recording: false })
  act(() => {
    jest.advanceTimersByTime(500)
  })

  expect(result.current.isProcessing).toBe(false)
  expect(result.current.transcription).toMatch(/Transcripción completa/)
})
