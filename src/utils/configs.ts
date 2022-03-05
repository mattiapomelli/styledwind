import { Config, Dictionary } from '../types'

/**
 * Builds the class of a styledwind component from its config and the passed props
 * @param config config of the styled component
 * @param props props passed to the component
 * @returns the class computed from config and props
 */
export const getClassNameFromConfig = <C extends Config>(
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

export const mergeConfigs = (baseConfig: Config, extendConfig: Config = {}) => {
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
