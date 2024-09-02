import { React } from '/modules/stdlib/src/expose/React.ts'
const { useEffect, useRef } = React

export function useIsMounted() {
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return isMountedRef.current
}
