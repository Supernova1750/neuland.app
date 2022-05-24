import React from 'react'
import { useTranslation } from 'next-i18next'

export default function TranslateDangerous ({ i18nKey, namespace = 'common' }) {
  const { t } = useTranslation()
  return (

        <span dangerouslySetInnerHTML={{ __html: t(i18nKey, { ns: namespace }) }}/>
  )
}
