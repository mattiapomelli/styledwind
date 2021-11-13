import React, { ElementType } from 'react'
import domElements from './utils/domElements'

type StyledWindComponent<P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<HTMLElement>
>

type Config = {
  className: string
}

function sw<P>(
  type: React.ComponentType<P>,
  config: Config
): StyledWindComponent<P>

function sw<K extends keyof JSX.IntrinsicElements>(
  type: K,
  config: Config
): StyledWindComponent<JSX.IntrinsicElements[K]>

function sw<P>(
  type: ElementType | keyof JSX.IntrinsicElements,
  config: Config
): StyledWindComponent<P> {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    return React.createElement(type, {
      ...props,
      // @ts-ignore:next-line
      className: `${props?.className ? props?.className : ''} ${
        config.className
      }`,
      ref,
    })
  })
}

type BaseSw = typeof sw

type SwFunctions = {
  [K in keyof JSX.IntrinsicElements]: (
    config: Config
  ) => StyledWindComponent<JSX.IntrinsicElements[K]>
}

type EnhancedSw = BaseSw & SwFunctions

const enhancedSw = sw as EnhancedSw

domElements.forEach(<K extends keyof JSX.IntrinsicElements>(domElement: K) => {
  // @ts-ignore:next-line
  enhancedSw[domElement] = (config: Config) => sw(domElement, config)
})

export default enhancedSw
