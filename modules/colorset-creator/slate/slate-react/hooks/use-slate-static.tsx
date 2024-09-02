import { React } from '/modules/stdlib/src/expose/React.ts'
const { createContext, useContext } = React
import { Editor } from 'https://esm.sh/slate'
import { ReactEditor } from '../plugin/react-editor.ts'

/**
 * A React context for sharing the editor object.
 */

export const EditorContext = createContext<ReactEditor | null>(null)

/**
 * Get the current editor object from the React context.
 */

export const useSlateStatic = (): Editor => {
  const editor = useContext(EditorContext)

  if (!editor) {
    throw new Error(
      `The \`useSlateStatic\` hook must be used inside the <Slate> component's context.`
    )
  }

  return editor
}
