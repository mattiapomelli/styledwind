import React, { ElementType } from 'react'
import domElements from './utils/domElements'

type StyledWindComponent<P, E> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<E>
>

function sw<P, E>(
  type: React.ComponentType<P>,
  className: string
): StyledWindComponent<P, E>

function sw<K extends keyof JSX.IntrinsicElements, E>(
  type: K,
  className: string
): StyledWindComponent<JSX.IntrinsicElements[K], E>

function sw<P, E>(
  type: ElementType | keyof JSX.IntrinsicElements,
  className: string
): StyledWindComponent<P, E> {
  return React.forwardRef<E, P>((props, ref) => {
    return React.createElement(type, {
      ...props,
      className,
      ref,
    })
  })
}

type BaseSw = typeof sw

type EnhancedSw = BaseSw & {
  [key in keyof JSX.IntrinsicElements]: <
    K extends keyof JSX.IntrinsicElements,
    E
  >(
    className: string
  ) => StyledWindComponent<JSX.IntrinsicElements[K], E>
}

const enhancedSw = sw as EnhancedSw

domElements.forEach(<K extends keyof JSX.IntrinsicElements>(domElement: K) => {
  enhancedSw[domElement] = (className: string) => sw(domElement, className)
})

export default enhancedSw
