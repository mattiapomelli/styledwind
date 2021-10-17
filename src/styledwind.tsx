import React, { ElementType, ReactElement } from 'react'

function sw<P>(
  type: React.ComponentType<P>,
  className: string
): (props?: P) => ReactElement<P>

function sw<K extends keyof JSX.IntrinsicElements>(
  type: K,
  className: string
): (props?: JSX.IntrinsicElements[K]) => ReactElement<JSX.IntrinsicElements[K]>

function sw<P extends Record<string, unknown>>(
  type: ElementType | keyof JSX.IntrinsicElements,
  className: string
): (props?: P & { className?: string }) => ReactElement<P> {
  return function StyledWindComponent(props) {
    return React.createElement(type, {
      ...props,
      className,
    })
  }
}

export default sw
