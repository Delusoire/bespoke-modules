import { React } from '/modules/stdlib/src/expose/React.ts'
const { useCallback, useEffect, useRef } = React
import { ReactEditor } from '../plugin/react-editor.ts'
import { useSlateStatic } from './use-slate-static.tsx'

export function useTrackUserInput() {
  const editor = useSlateStatic()

  const receivedUserInput = useRef<boolean>(false)
  const animationFrameIdRef = useRef<number>(0)

  const onUserInput = useCallback(() => {
    if (receivedUserInput.current) {
      return
    }

    receivedUserInput.current = true

    const window = ReactEditor.getWindow(editor)
    window.cancelAnimationFrame(animationFrameIdRef.current)

    animationFrameIdRef.current = window.requestAnimationFrame(() => {
      receivedUserInput.current = false
    })
  }, [editor])

  useEffect(() => () => cancelAnimationFrame(animationFrameIdRef.current), [])

  return {
    receivedUserInput,
    onUserInput,
  }
}
