import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { Capacitor } from '@capacitor/core'
import Card from 'react-bootstrap/Card'

import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { OS_ANDROID, OS_IOS, useOperatingSystem } from '../../lib/hooks/os-hook'

import TranslateDangerous from '../TranslateDangerous'
import styles from '../../styles/Home.module.css'
import { useTranslation } from 'next-i18next'

export default function InstallPrompt ({ onHide }) {
  const [showPrompt, setShowPrompt] = useState(false)
  const os = useOperatingSystem()
  const { t } = useTranslation()

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      return
    }

    if (os === OS_IOS) {
      const isInstalled = navigator.standalone
      setShowPrompt(!isInstalled && OS_IOS)
    } else if (os === OS_ANDROID) {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      setShowPrompt(!isInstalled && OS_ANDROID)
    }
  }, [os])

  function close () {
    setShowPrompt(false)
    onHide()
  }

  return showPrompt && (
      <Card className={styles.card}>
        <Card.Body>
          <Card.Title>
            <FontAwesomeIcon icon={faDownload} fixedWidth />
            {' '}
            { t('homecards.install.title') }
            <Button variant="link" className={styles.cardButton} onClick={() => close()}>
              <FontAwesomeIcon title={ t('homecards.install.close') } icon={faTimes} />
            </Button>
          </Card.Title>
          <Card.Text>
            { t('homecards.install.subtext')}
          </Card.Text>
          {showPrompt === OS_IOS &&
            <Card.Text>
              <TranslateDangerous i18nKey="homecards.install.ios" />
            </Card.Text>
          }
          {showPrompt === OS_ANDROID &&
            <Card.Text>
              <TranslateDangerous i18nKey="homecards.install.android" />
            </Card.Text>
          }
        </Card.Body>
      </Card>
  )
}
