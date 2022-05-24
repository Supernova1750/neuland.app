import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

export default function SwitchLanguge ({ lang }) {
  const router = useRouter()
  const { t } = useTranslation()

  return (<Link href={router.pathname} locale={lang} >
      { t('name', { ns: 'common', lng: lang })}
    </Link>)
}
