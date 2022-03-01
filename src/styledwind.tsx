import React, { ElementType } from 'react'

import domElements from './utils/domElements'
import { VariantConfigProperties } from './utils/variants'

type Dictionary = {
  [key: string]: string
}

/**
 * type of the props that a styledwind component can receive, based on the passed config
 * 'default' is omitted from the config because it doesn't translate to a prop,
 * but to the default class of the component
 */
type StyledWindComponentConfigProps<C> = {
  [K in keyof Omit<C, 'base'>]?: C[K] extends Dictionary ? keyof C[K] : boolean
} & {
  className?: string
  __swConfig__?: Config
}
/**
 * type of a styledwind component, based on the props P and the passed config C
 */
type StyledWindComponent<P, C> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P & StyledWindComponentConfigProps<C>> &
    React.RefAttributes<HTMLElement>
>

/**
 * default properties that can be present in the config passed to a styledwind component
 */
type DefaultConfigProperties = {
  base?: string
}

/**
 * Custom properties that can be present in the config passed to a styledwind component
 */
type CustomConfigProperties = {
  [key: string]: string | Dictionary
}

type Config = DefaultConfigProperties &
  VariantConfigProperties &
  CustomConfigProperties

/**
 * Builds the class of a styledwind component from its config and the passed props
 * @param config config of the styled component
 * @param props props passed to the component
 * @returns the class computed from config and props
 */
const getClassNameFromConfig = <C extends Config>(
  config: C,
  props: { [key: string]: any }
) => {
  // add the base class
  const classes = [config.base]

  // for every property of the config, check if the corresponding prop is provided,
  // if so, get from the config the value corresponding to the prop value
  for (const [key, value] of Object.entries(config)) {
    // Get classes for tailwind variants
    if (key.startsWith('_') && typeof value === 'string') {
      classes.push(
        value
          .split(' ')
          .map((classItem) => `${key.slice(1)}:${classItem}`)
          .join(' ')
      )
    } else if (props[key]) {
      // Get classes from props
      classes.push(typeof value === 'string' ? value : value[props[key]])
    }
  }

  return classes.join(' ')
}

const deepCloneConfig = <T extends Config | Dictionary>(obj: T) => {
  const cloned: T = {} as T

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      cloned[key] = deepCloneConfig(value)
    } else {
      cloned[key] = value
    }
  }

  return cloned
}

const mergeConfigs = (baseConfig: Config, extendConfig: Config = {}) => {
  const mergedConfig = deepCloneConfig(baseConfig)

  for (const [key, value] of Object.entries(extendConfig)) {
    if (typeof value === 'string') {
      if (mergedConfig.hasOwnProperty(key)) {
        mergedConfig[key] += ' ' + value
      } else {
        mergedConfig[key] = value
      }
      continue
    }

    if (
      typeof mergedConfig[key] === 'object' &&
      mergedConfig.hasOwnProperty(key)
    ) {
      for (const [propertyKey, propertyValue] of Object.entries(value)) {
        if (mergedConfig[key].hasOwnProperty(propertyKey)) {
          // @ts-ignore:next-line
          mergedConfig[key][propertyKey] += ' ' + propertyValue
        } else {
          // @ts-ignore:next-line
          mergedConfig[key][propertyKey] = propertyValue
        }
      }
    } else {
      mergedConfig[key] = value
    }
  }

  return mergedConfig
}

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
type SwFunctions<C extends Config> = {
  [K in keyof JSX.IntrinsicElements]: (
    config: C
  ) => StyledWindComponent<JSX.IntrinsicElements[K], C>
}

type EnhancedSw<C extends Config> = BaseSw & SwFunctions<C>

/**
 * Utility function to convert sw from type BaseSw to type EnhancedSw
 */
const enhance = <C extends Config>(sw: BaseSw) => {
  return sw as EnhancedSw<C>
}

const enhancedSw = enhance(sw)

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
