import { React } from '/modules/stdlib/src/expose/React.ts'
const { createContext, useContext } = React
import { Range, NodeEntry } from 'https://esm.sh/slate'

/**
 * A React context for sharing the `decorate` prop of the editable.
 */

export const DecorateContext = createContext<(entry: NodeEntry) => Range[]>(
  () => []
)

/**
 * Get the current `decorate` prop of the editable.
 */

export const useDecorate = (): ((entry: NodeEntry) => Range[]) => {
  return useContext(DecorateContext)
}
