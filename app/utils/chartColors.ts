export interface ChartCategory {
  name: string
  color: string
}

const CHART_COLOR_COUNT = 6

export type ChartColorMode = 'indexed' | 'single'

export interface BuildChartCategoriesOptions {
  keyPrefix?: string
  colorMode?: ChartColorMode
  singleColor?: string
}

export const getChartPaletteColor = (index: number) => {
  const normalizedIndex = Math.abs(index) % CHART_COLOR_COUNT
  return `var(--vis-color${normalizedIndex})`
}

export const getChartColor = (
  index: number,
  colorMode: ChartColorMode = 'indexed',
  singleColor = 'var(--ui-primary)'
) => {
  if (colorMode === 'single')
    return singleColor

  return getChartPaletteColor(index)
}

export const buildIndexedChartCategories = <T>(
  items: T[],
  getName: (item: T) => string,
  options: BuildChartCategoriesOptions = {}
): Record<string, ChartCategory> => {
  const {
    keyPrefix = 'item_',
    colorMode = 'indexed',
    singleColor = 'var(--ui-primary)'
  } = options

  return items.reduce<Record<string, ChartCategory>>((accumulator, item, index) => {
    accumulator[`${keyPrefix}${index}`] = {
      name: getName(item),
      color: getChartColor(index, colorMode, singleColor)
    }

    return accumulator
  }, {})
}