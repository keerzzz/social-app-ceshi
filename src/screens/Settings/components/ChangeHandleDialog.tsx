import {useCallback, useMemo, useState} from 'react'
import {useWindowDimensions, View} from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  LayoutAnimationConfig,
  LinearTransition,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated'
import {type ComAtprotoServerDescribeServer} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useMutation, useQueryClient} from '@tanstack/react-query'

import {HITSLOP_10, urls} from '#/lib/constants'
import {cleanError} from '#/lib/strings/errors'
import {createFullHandle, validateServiceHandle} from '#/lib/strings/handles'
import {sanitizeHandle} from '#/lib/strings/handles'
import {useFetchDid, useUpdateHandleMutation} from '#/state/queries/handle'
import {RQKEY as RQKEY_PROFILE} from '#/state/queries/profile'
import {useServiceQuery} from '#/state/queries/service'
import {useCurrentAccountProfile} from '#/state/queries/useCurrentAccountProfile'
import {useAgent, useSession} from '#/state/session'
import {ErrorScreen} from '#/view/com/util/error/ErrorScreen'
import {atoms as a, native, useBreakpoints, useTheme} from '#/alf'
import {Admonition} from '#/components/Admonition'
import {Button, ButtonIcon, ButtonText} from '#/components/Button'
import * as Dialog from '#/components/Dialog'
import * as SegmentedControl from '#/components/forms/SegmentedControl'
import * as TextField from '#/components/forms/TextField'
import {
  ArrowLeft_Stroke2_Corner0_Rounded as ArrowLeftIcon,
  ArrowRight_Stroke2_Corner0_Rounded as ArrowRightIcon,
} from '#/components/icons/Arrow'
import {At_Stroke2_Corner0_Rounded as AtIcon} from '#/components/icons/At'
import {CheckThick_Stroke2_Corner0_Rounded as CheckIcon} from '#/components/icons/Check'
import {SquareBehindSquare4_Stroke2_Corner0_Rounded as CopyIcon} from '#/components/icons/SquareBehindSquare4'
import {InlineLinkText} from '#/components/Link'
import {Loader} from '#/components/Loader'
import {Text} from '#/components/Typography'
import {useSimpleVerificationState} from '#/components/verification'
import {CopyButton} from './CopyButton'

export function ChangeHandleDialog({
  control,
}: {
  control: Dialog.DialogControlProps
}) {
  const {height} = useWindowDimensions()

  return (
    <Dialog.Outer control={control} nativeOptions={{minHeight: height}}>
      <ChangeHandleDialogInner />
    </Dialog.Outer>
  )
}

function ChangeHandleDialogInner() {
  const control = Dialog.useDialogContext()
  const {_} = useLingui()
  const agent = useAgent()
  const {
    data: serviceInfo,
    error: serviceInfoError,
    refetch,
  } = useServiceQuery(agent.serviceUrl.toString())

  const cancelButton = useCallback(
    () => (
      <Button
        label={_(msg`Cancel`)}
        onPress={() => control.close()}
        size="small"
        color="primary"
        variant="ghost"
        style={[a.rounded_full]}>
        <ButtonText style={[a.text_md]}>
          <Trans>Cancel</Trans>
        </ButtonText>
      </Button>
    ),
    [control, _],
  )

  return (
    <Dialog.ScrollableInner
      label={_(msg`Change Handle`)}
      header={
        <Dialog.Header renderLeft={cancelButton}>
          <Dialog.HeaderText>
            <Trans>Change Handle</Trans>
          </Dialog.HeaderText>
        </Dialog.Header>
      }
      contentContainerStyle={[a.pt_0, a.px_0]}>
      <View style={[a.flex_1, a.pt_lg, a.px_xl]}>
        {serviceInfoError ? (
          <ErrorScreen
            title={_(msg`Oops!`)}
            message={_(msg`There was an issue fetching your service info`)}
            details={cleanError(serviceInfoError)}
            onPressTryAgain={refetch}
          />
        ) : serviceInfo ? (
          <ProvidedHandlePage
            serviceInfo={serviceInfo}
          />
        ) : (
          <View style={[a.flex_1, a.justify_center, a.align_center, a.py_4xl]}>
            <Loader size="xl" />
          </View>
        )}
      </View>
    </Dialog.ScrollableInner>
  )
}

function ProvidedHandlePage({
  serviceInfo,
}: {
  serviceInfo: ComAtprotoServerDescribeServer.OutputSchema
}) {
  const {_} = useLingui()
  const [subdomain, setSubdomain] = useState('')
  const agent = useAgent()
  const control = Dialog.useDialogContext()
  const {currentAccount} = useSession()
  const queryClient = useQueryClient()
  const profile = useCurrentAccountProfile()
  const verification = useSimpleVerificationState({
    profile,
  })

  const {
    mutate: changeHandle,
    isPending,
    error,
    isSuccess,
  } = useUpdateHandleMutation({
    onSuccess: () => {
      if (currentAccount) {
        queryClient.invalidateQueries({
          queryKey: RQKEY_PROFILE(currentAccount.did),
        })
      }
      agent.resumeSession(agent.session!).then(() => control.close())
    },
  })

  const host = serviceInfo.availableUserDomains[0]

  const validation = useMemo(
    () => validateServiceHandle(subdomain, host),
    [subdomain, host],
  )

  const isInvalid =
    !validation.handleChars ||
    !validation.hyphenStartOrEnd ||
    !validation.totalLength

  return (
    <LayoutAnimationConfig skipEntering>
      <View style={[a.flex_1, a.gap_md]}>
        {isSuccess && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <SuccessMessage text={_(msg`Handle changed!`)} />
          </Animated.View>
        )}
        {error && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <ChangeHandleError error={error} />
          </Animated.View>
        )}
        <Animated.View
          layout={native(LinearTransition)}
          style={[a.flex_1, a.gap_md]}>
          {verification.isVerified && verification.role === 'default' && (
            <Admonition type="error">
              <Trans>
                You are verified. You will lose your verification status if you
                change your handle.{' '}
                <InlineLinkText
                  label={_(
                    msg({
                      message: `Learn more`,
                      context: `english-only-resource`,
                    }),
                  )}
                  to={urls.website.blog.initialVerificationAnnouncement}>
                  <Trans context="english-only-resource">Learn more.</Trans>
                </InlineLinkText>
              </Trans>
            </Admonition>
          )}
          <View>
            <TextField.LabelText>
              <Trans>New handle</Trans>
            </TextField.LabelText>
            <TextField.Root isInvalid={isInvalid}>
              <TextField.Icon icon={AtIcon} />
              <Dialog.Input
                editable={!isPending}
                defaultValue={subdomain}
                onChangeText={text => setSubdomain(text)}
                label={_(msg`New handle`)}
                placeholder={_(msg`e.g. alice`)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextField.SuffixText label={host} style={[{maxWidth: '40%'}]}>
                {host}
              </TextField.SuffixText>
            </TextField.Root>
          </View>
          <Text>
            <Trans>
              Your full handle will be{' '}
              <Text style={[a.font_semi_bold]}>
                @{createFullHandle(subdomain, host)}
              </Text>
            </Trans>
          </Text>
          <Button
            label={_(msg`Save new handle`)}
            variant="solid"
            size="large"
            color={validation.overall ? 'primary' : 'secondary'}
            disabled={!validation.overall}
            onPress={() => {
              if (validation.overall) {
                changeHandle({handle: createFullHandle(subdomain, host)})
              }
            }}>
            {isPending ? (
              <ButtonIcon icon={Loader} />
            ) : (
              <ButtonText>
                <Trans>Save</Trans>
              </ButtonText>
            )}
          </Button>
        </Animated.View>
      </View>
    </LayoutAnimationConfig>
  )
}


function ChangeHandleError({error}: {error: unknown}) {
  const {_} = useLingui()

  let message = _(msg`Failed to change handle. Please try again.`)

  if (error instanceof Error) {
    if (error.message.startsWith('Handle already taken')) {
      message = _(msg`Handle already taken. Please try a different one.`)
    } else if (error.message === 'Reserved handle') {
      message = _(msg`This handle is reserved. Please try a different one.`)
    } else if (error.message === 'Handle too long') {
      message = _(msg`Handle too long. Please try a shorter one.`)
    } else if (error.message === 'Input/handle must be a valid handle') {
      message = _(msg`Invalid handle. Please try a different one.`)
    } else if (error.message === 'Rate Limit Exceeded') {
      message = _(
        msg`Rate limit exceeded – you've tried to change your handle too many times in a short period. Please wait a minute before trying again.`,
      )
    }
  }

  return <Admonition type="error">{message}</Admonition>
}

function SuccessMessage({text}: {text: string}) {
  const {gtMobile} = useBreakpoints()
  const t = useTheme()
  return (
    <View
      style={[
        a.flex_1,
        a.gap_md,
        a.flex_row,
        a.justify_center,
        a.align_center,
        gtMobile ? a.px_md : a.px_sm,
        a.py_xs,
        t.atoms.border_contrast_low,
      ]}>
      <View
        style={[
          {height: 20, width: 20},
          a.rounded_full,
          a.align_center,
          a.justify_center,
          {backgroundColor: t.palette.positive_500},
        ]}>
        <CheckIcon fill={t.palette.white} size="xs" />
      </View>
      <Text style={[a.text_md]}>{text}</Text>
    </View>
  )
}
