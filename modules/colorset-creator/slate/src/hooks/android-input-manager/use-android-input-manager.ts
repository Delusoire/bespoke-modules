import { React } from '/modules/stdlib/src/expose/React.ts'
const { RefObject, useState } = React
import { useSlateStatic } from '../use-slate-static.tsx'
import { IS_ANDROID } from '../../utils/environment.ts'
import { EDITOR_TO_SCHEDULE_FLUSH } from '../../utils/weak-maps.ts'
import {
  createAndroidInputManager,
  CreateAndroidInputManagerOptions,
} from './android-input-manager.ts'
import { useIsMounted } from '../use-is-mounted.tsx'
import { useMutationObserver } from '../use-mutation-observer.ts'

type UseAndroidInputManagerOptions = {
  node: RefObject<HTMLElement>
} & Omit<
  CreateAndroidInputManagerOptions,
  'editor' | 'onUserInput' | 'receivedUserInput'
>

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
}

export const useAndroidInputManager = !IS_ANDROID
  ? () => null
  : ({ node, ...options }: UseAndroidInputManagerOptions) => {
      if (!IS_ANDROID) {
        return null
      }

      const editor = useSlateStatic()
      const isMounted = useIsMounted()

      const [inputManager] = useState(() =>
        createAndroidInputManager({
          editor,
          ...options,
        })
      )

      useMutationObserver(
        node,
        inputManager.handleDomMutations,
        MUTATION_OBSERVER_CONFIG
      )

      EDITOR_TO_SCHEDULE_FLUSH.set(editor, inputManager.scheduleFlush)
      if (isMounted) {
        inputManager.flush()
      }

      return inputManager
    }
