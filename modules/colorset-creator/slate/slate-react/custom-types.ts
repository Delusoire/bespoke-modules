import { BaseRange, BaseText } from 'https://esm.sh/slate'
import { ReactEditor } from './plugin/react-editor.ts'

declare module 'https://esm.sh/slate' {
  interface CustomTypes {
    Editor: ReactEditor
    Text: BaseText & {
      placeholder?: string
      onPlaceholderResize?: (node: HTMLElement | null) => void
      // FIXME: is unknown correct here?
      [key: string]: unknown
    }
    Range: BaseRange & {
      placeholder?: string
      onPlaceholderResize?: (node: HTMLElement | null) => void
      // FIXME: is unknown correct here?
      [key: string]: unknown
    }
  }
}

declare global {
  interface Window {
    MSStream: boolean
  }
  interface DocumentOrShadowRoot {
    getSelection(): Selection | null
  }

  interface CaretPosition {
    readonly offsetNode: Node
    readonly offset: number
    getClientRect(): DOMRect | null
  }

  interface Document {
    caretPositionFromPoint(x: number, y: number): CaretPosition | null
  }

  interface Node {
    getRootNode(options?: GetRootNodeOptions): Document | ShadowRoot
  }
}

export {}
