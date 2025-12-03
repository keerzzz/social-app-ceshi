import React from 'react'
import {View} from 'react-native'
import {Trans} from '@lingui/macro'

import {Logo} from '#/view/icons/Logo'
import {atoms as a} from '#/alf'
import {AppLanguageDropdown} from '#/components/AppLanguageDropdown'
import {Link} from '#/components/Link'
import {Text} from '#/components/Typography'

let NavSignupCard = ({}: {}): React.ReactNode => {
  return (
    <View style={[{maxWidth: 200}]}>
      <Link to="/" label="Bluesky - Home">
        <Logo width={32} />
      </Link>

      <View style={[a.pt_lg]}>
        <Text
          style={[a.text_3xl, a.font_bold, {lineHeight: a.text_3xl.fontSize}]}>
          <Trans>Join the conversation</Trans>
        </Text>
      </View>

      <View style={[a.mt_md, a.w_full, {height: 32}]}>
        <AppLanguageDropdown />
      </View>
    </View>
  )
}
NavSignupCard = React.memo(NavSignupCard)
export {NavSignupCard}
