// Components
export {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  type RenderPlaceholderProps,
  type DefaultPlaceholder,
} from './components/editable.tsx'

export { DefaultElement } from './components/element.tsx'
export { DefaultLeaf } from './components/leaf.tsx'
export { Slate } from './components/slate.tsx'

// Hooks
export { useEditor } from './hooks/use-editor.tsx'
export { useSlateStatic } from './hooks/use-slate-static.tsx'
export { useComposing } from './hooks/use-composing.ts'
export { useFocused } from './hooks/use-focused.ts'
export { useReadOnly } from './hooks/use-read-only.ts'
export { useSelected } from './hooks/use-selected.ts'
export { useSlate, useSlateWithV } from './hooks/use-slate.tsx'
export { useSlateSelector } from './hooks/use-slate-selector.tsx'
export { useSlateSelection } from './hooks/use-slate-selection.tsx'

// Plugin
export { ReactEditor } from './plugin/react-editor.ts'
export { withReact } from './plugin/with-react.ts'

// Utils
export { NODE_TO_INDEX, NODE_TO_PARENT } from './utils/weak-maps.ts'
