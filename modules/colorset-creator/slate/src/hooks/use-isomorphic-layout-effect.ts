import { React } from '/modules/stdlib/src/expose/React.ts'
const { useEffect, useLayoutEffect } = React
import { CAN_USE_DOM } from '../utils/environment.ts'

/**
 * Prevent warning on SSR by falling back to useEffect when DOM isn't available
 */

export const useIsomorphicLayoutEffect = CAN_USE_DOM
  ? useLayoutEffect
  : useEffect
