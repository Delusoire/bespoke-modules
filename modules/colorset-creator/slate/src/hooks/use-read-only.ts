import { React } from '/modules/stdlib/src/expose/React.ts'
const { createContext, useContext } = React

/**
 * A React context for sharing the `readOnly` state of the editor.
 */

export const ReadOnlyContext = createContext(false)

/**
 * Get the current `readOnly` state of the editor.
 */

export const useReadOnly = (): boolean => {
  return useContext(ReadOnlyContext)
}
