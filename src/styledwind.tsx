import React, { ElementType } from 'react'
import domElements from './utils/domElements'

type StyledWindComponent<P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<HTMLElement>
>

function sw<P>(
  type: React.ComponentType<P>,
  className: string
): StyledWindComponent<P>

function sw<K extends keyof JSX.IntrinsicElements>(
  type: K,
  className: string
): StyledWindComponent<JSX.IntrinsicElements[K]>

function sw<P>(
  type: ElementType | keyof JSX.IntrinsicElements,
  className: string
): StyledWindComponent<P> {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    return React.createElement(type, {
      ...props,
      className,
      ref,
    })
  })
}

type BaseSw = typeof sw

type SwFunctions = {
  [K in keyof JSX.IntrinsicElements]: (
    className: string
  ) => StyledWindComponent<JSX.IntrinsicElements[K]>
}

type EnhancedSw = BaseSw & SwFunctions

const enhancedSw = sw as EnhancedSw

domElements.forEach(<K extends keyof JSX.IntrinsicElements>(domElement: K) => {
  // @ts-ignore:next-line
  enhancedSw[domElement] = (className: string) => sw(domElement, className)
})

export default enhancedSw
