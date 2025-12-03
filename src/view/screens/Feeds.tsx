import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import {type AppBskyFeedDefs} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useFocusEffect} from '@react-navigation/native'
import debounce from 'lodash.debounce'

import {useOpenComposer} from '#/lib/hooks/useOpenComposer'
import {usePalette} from '#/lib/hooks/usePalette'
import {useWebMediaQueries} from '#/lib/hooks/useWebMediaQueries'
import {ComposeIcon2} from '#/lib/icons'
import {
  type CommonNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {cleanError} from '#/lib/strings/errors'
import {s} from '#/lib/styles'
import {isNative, isWeb} from '#/platform/detection'
import {type NativeStackScreenProps} from '#/lib/routes/types'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'Feeds'>

export function FeedsScreen(_props: Props) {
  return (
    <Layout.Screen testID="FeedsScreen">
      <Layout.Center>
        <Layout.Header.Outer>
          <Layout.Header.BackButton />
          <Layout.Header.Content>
            <Layout.Header.TitleText>Feeds</Layout.Header.TitleText>
          </Layout.Header.Content>
        </Layout.Header.Outer>

        <Text style={{padding: 20}}>
          Discover feeds is currently disabled.
        </Text>
      </Layout.Center>
    </Layout.Screen>
  )
}
