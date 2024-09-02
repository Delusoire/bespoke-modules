import { React } from '/modules/stdlib/src/expose/React.ts'
const { createContext, useContext } = React

/**
 * A React context for sharing the `composing` state of the editor.
 */

export const ComposingContext = createContext(false)

/**
 * Get the current `composing` state of the editor.
 */

export const useComposing = (): boolean => {
  return useContext(ComposingContext)
}
