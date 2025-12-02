import React from 'react'
import {View} from 'react-native'
import {Trans} from '@lingui/macro'

import {toNiceDomain} from '#/lib/strings/url-helpers'
import {atoms as a, tokens, useTheme} from '#/alf'
import {Globe_Stroke2_Corner0_Rounded as GlobeIcon} from '#/components/icons/Globe'
import {Text} from '#/components/Typography'

export function HostingProvider({
  serviceUrl,
  minimal,
}: {
  serviceUrl: string
  onSelectServiceUrl: (provider: string) => void
  onOpenDialog?: () => void
  minimal?: boolean
}) {
  const t = useTheme()

  return (
    <>
      {minimal ? (
        <View style={[a.flex_row, a.align_center, a.flex_wrap, a.gap_xs]}>
          <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
            <Trans>You are creating an account on</Trans>
          </Text>
          <View
            style={[
              a.px_xs,
              {marginHorizontal: tokens.space.xs * -1},
              {paddingVertical: 0},
            ]}>
            <Text style={[a.text_sm]}>
              {toNiceDomain(serviceUrl)}
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={[
            a.w_full,
            a.flex_row,
            a.align_center,
            a.rounded_sm,
            a.py_sm,
            a.pl_md,
            a.pr_sm,
            a.gap_xs,
          ]}>
          <View style={a.pr_xs}>
            <GlobeIcon
              size="md"
              fill={t.palette.contrast_500}
            />
          </View>
          <Text style={[a.text_md]}>{toNiceDomain(serviceUrl)}</Text>
        </View>
      )}
    </>
  )
}
