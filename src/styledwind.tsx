import React, { ElementType } from 'react'

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

export default sw
