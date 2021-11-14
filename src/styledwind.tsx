import React, { ElementType } from 'react'
import domElements from './utils/domElements'

/**
 * type of the props that a styledwind component can receive, based on the passed config
 * 'default' is omitted from the config because it doesn't translate to a prop,
 * but to the default class of the component
 */
type StyledWindComponentConfigProps<C> = {
  [K in keyof Omit<C, 'default'>]?: keyof C[K]
} & {
  className?: string
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
interface Config {
  default?: string
}

/**
 * Builds the class of a styledwind component from its config and the passed props
 * @param config config of the styled component
 * @param props props passed to the component
 * @returns the class computed from config and props
 */
const getClassNameFromConfig = <C extends Config, P>(config: C, props: P) => {
  // add the default class
  const classes = [config.default]

  // for every property of the config, check if the corresponding prop is provided,
  // if so, get from the config the value corresponding to the prop value
  for (const key of Object.keys(config)) {
    // @ts-ignore:next-line
    if (props[key]) {
      // @ts-ignore:next-line
      classes.push(config[key][props[key]])
    }
  }

  return classes.join(' ')
}

// composition of styledwind components, form: sw(Component, config)
function sw<P, V, C extends Config>(
  type: StyledWindComponent<P, V>,
  config: C
): StyledWindComponent<P, V & C>

// form: sw('button', config)
function sw<K extends keyof JSX.IntrinsicElements, C extends Config>(
  type: K,
  config: C
): StyledWindComponent<JSX.IntrinsicElements[K], C>

function sw<P, C extends Config>(
  type: ElementType | keyof JSX.IntrinsicElements,
  config: C
): StyledWindComponent<P, C> {
  return React.forwardRef<HTMLElement, P & StyledWindComponentConfigProps<C>>(
    (props, ref) => {
      const classNameFromProps = props?.className ? props?.className : ''
      const classNameFromConfig = getClassNameFromConfig(config, props)

      return React.createElement(type, {
        ...props,
        className: classNameFromProps + ' ' + classNameFromConfig,
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
