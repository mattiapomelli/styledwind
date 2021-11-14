import React, { ElementType } from 'react'
import domElements from './utils/domElements'

type StyledWindComponentConfigProps<C> = {
  [K in keyof Omit<C, 'default'>]?: keyof C[K]
} & {
  className?: string
}

type StyledWindComponent<P, C> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P & StyledWindComponentConfigProps<C>> &
    React.RefAttributes<HTMLElement>
>

interface Config {
  default?: string
}

const getClassNameFromConfig = <C extends Config, P>(config: C, props: P) => {
  const classes = [config.default]

  for (const key of Object.keys(config)) {
    // @ts-ignore:next-line
    if (props[key]) {
      // @ts-ignore:next-line
      classes.push(config[key][props[key]])
    }
  }

  return classes.join(' ')
}

function sw<P, V, C extends Config>(
  type: StyledWindComponent<P, V>,
  config: C
): StyledWindComponent<P, V & C>

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

type SwFunctions<C extends Config> = {
  [K in keyof JSX.IntrinsicElements]: (
    config: C
  ) => StyledWindComponent<JSX.IntrinsicElements[K], C>
}

type EnhancedSw<C extends Config> = BaseSw & SwFunctions<C>

const extend = <C extends Config>(sw: BaseSw) => {
  return sw as EnhancedSw<C>
}

const enhancedSw = extend(sw)

domElements.forEach(<K extends keyof JSX.IntrinsicElements>(domElement: K) => {
  // @ts-ignore:next-line
  enhancedSw[domElement] = <C extends Config>(config: C) =>
    sw(domElement, config)
})

export default enhancedSw
