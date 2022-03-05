import { VariantConfigProperties } from './utils/variants'

export interface Dictionary {
  [key: string]: string
}

/**
 * type of the props that a styledwind component can receive, based on the passed config
 * 'default' is omitted from the config because it doesn't translate to a prop,
 * but to the default class of the component
 */
export type StyledWindComponentConfigProps<C> = {
  [K in keyof Omit<C, 'base'>]?: C[K] extends Dictionary ? keyof C[K] : boolean
} & {
  className?: string
  __swConfig__?: Config
}
/**
 * type of a styledwind component, based on the props P and the passed config C
 */
export type StyledWindComponent<P, C> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P & StyledWindComponentConfigProps<C>> &
    React.RefAttributes<HTMLElement>
>

/**
 * default properties that can be present in the config passed to a styledwind component
 */
interface DefaultConfigProperties {
  base?: string
}

/**
 * Custom properties that can be present in the config passed to a styledwind component
 */
interface CustomConfigProperties {
  [key: string]: string | Dictionary
}

export type Config = DefaultConfigProperties &
  VariantConfigProperties &
  CustomConfigProperties
