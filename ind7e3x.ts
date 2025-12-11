import Color from 'color'
import styled, { ThemedReactEmotionInterface } from 'react-emotion'

import { ParsedUrl } from '../../types/url'
import { Settings_settings_theme } from '@generated'

export * from 'react-emotion'

export interface Theme extends Settings_settings_theme {
  readonly: boolean,
  guestMode: boolean,
  singleChannel: boolean,
  colors: {
    __typename: 'ThemeColorSettings'
    _primary: Color
    _accent: Color
    _background: Color

    primary: string
    accent: string
    background: string
  }
  url: ParsedUrl
  loadedSettings: boolean
}

export default styled as ThemedReactEmotionInterface<Theme>



// WEBPACK FOOTER //
// ./src/lib/emotion/index.ts