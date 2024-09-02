import { React } from '/modules/stdlib/src/expose/React.ts'
const { useContext } = React

import { EditorContext } from './use-slate-static.tsx'

/**
 * Get the current editor object from the React context.
 * @deprecated Use useSlateStatic instead.
 */

export const useEditor = () => {
  const editor = useContext(EditorContext)

  if (!editor) {
    throw new Error(
      `The \`useEditor\` hook must be used inside the <Slate> component's context.`
    )
  }

  return editor
}
