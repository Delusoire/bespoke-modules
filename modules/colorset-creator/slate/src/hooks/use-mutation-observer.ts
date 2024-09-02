import { React } from '/modules/stdlib/src/expose/React.ts'
const { useEffect, useState } = React
type RefObject<T> = React.RefObject<T>
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect.ts'

export function useMutationObserver(
  node: RefObject<HTMLElement>,
  callback: MutationCallback,
  options: MutationObserverInit
) {
  const [mutationObserver] = useState(() => new MutationObserver(callback))

  useIsomorphicLayoutEffect(() => {
    // Discard mutations caused during render phase. This works due to react calling
    // useLayoutEffect synchronously after the render phase before the next tick.
    mutationObserver.takeRecords()
  })

  useEffect(() => {
    if (!node.current) {
      throw new Error('Failed to attach MutationObserver, `node` is undefined')
    }

    mutationObserver.observe(node.current, options)
    return () => mutationObserver.disconnect()
  }, [mutationObserver, node, options])
}
