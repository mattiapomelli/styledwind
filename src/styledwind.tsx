import React, { ElementType } from 'react'

import domElements from './utils/domElements'
import { getClassNameFromConfig, mergeConfigs } from './utils/configs'
import {
  Config,
  StyledWindComponent,
  StyledWindComponentConfigProps,
} from './types'

const joinClassNames = (...classNames: string[]) =>
  classNames.filter(Boolean).join(' ')

// composition of styledwind components, form: sw(Component, config)
function sw<P, V, C extends Config>(
  element: StyledWindComponent<P, V>,
  config: C
): StyledWindComponent<P, V & C>

// form: sw('button', config)
function sw<K extends keyof JSX.IntrinsicElements, C extends Config>(
  element: K,
  config: C
): StyledWindComponent<JSX.IntrinsicElements[K], C>

function sw<P, C extends Config>(
  element: ElementType | keyof JSX.IntrinsicElements,
  config: C
): StyledWindComponent<P, C> {
  return React.forwardRef<HTMLElement, P & StyledWindComponentConfigProps<C>>(
    (props, ref) => {
      // States if the element is the final element or is a composed component
      // The element is the final element when the passed argument is a string, like 'button'
      const isFinalElement = typeof element === 'string'

      // ----- Classname Creation -----
      const classNameFromProps = props?.className || ''
      let className = ''
      let filteredProps = {}

      // Merge the config with the config coming from the layer above of composition
      // through props (if is present)
      const mergedConfig = props.__swConfig__
        ? mergeConfigs(config, props.__swConfig__)
        : config

      // Check if it's the final element in the composition chain
      if (isFinalElement) {
        // Get the className from the config, and attach the className passed as a prop
        const classNameFromConfig = getClassNameFromConfig(mergedConfig, props)
        className = joinClassNames(classNameFromConfig, classNameFromProps)

        // Filter the props passed to the DOM element, keeping only props that are not for the config
        filteredProps = Object.fromEntries(
          Object.entries(props).filter(
            ([key]) =>
              !Object.keys(mergedConfig).includes(key) && key !== '__swConfig__'
          )
        )
      } else {
        // Pass down through the composition chain only the className from the props
        className = classNameFromProps

        // Pass the config down through the composition chain as a prop, to be later merged
        // with the base config
        filteredProps = { ...props, __swConfig__: mergedConfig }
      }

      return React.createElement(element, {
        ...filteredProps,
        className,
        ref,
      })
    }
  )
}

type BaseSw = typeof sw

/**
 * Type of the functions with dom elements as a name that create the corresponding styledwind component
 * E.g. sw.button(config)
 */
type SwFunctions = {
  [K in keyof JSX.IntrinsicElements]: <C extends Config>(
    config: C
  ) => StyledWindComponent<JSX.IntrinsicElements[K], C>
}

type EnhancedSw = BaseSw & SwFunctions

const enhancedSw = sw as EnhancedSw

/**
 * For each dom element, create a function inside enhancedSw to create the corresponding element.
 * Allows the form: sw.button(config)
 */
domElements.forEach(<K extends keyof JSX.IntrinsicElements>(domElement: K) => {
  // @ts-ignore:next-line
  enhancedSw[domElement] = <C extends Config>(config: C) =>
    sw(domElement, config)
})

export default enhancedSw
