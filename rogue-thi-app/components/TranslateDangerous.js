import React from 'react'
import { useTranslation } from "next-i18next"

export default function TranslateDangerous({ i18nKey }) {
    const { t } = useTranslation()
    return (
        
        <span dangerouslySetInnerHTML={{__html: t(i18nKey)}}/>
    )
}