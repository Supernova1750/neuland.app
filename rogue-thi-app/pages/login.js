import React, { useState } from 'react'
import { useRouter } from 'next/router'

import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import AppBody from '../components/page/AppBody'
import AppContainer from '../components/page/AppContainer'
import AppNavbar from '../components/page/AppNavbar'
import { createSession } from '../lib/backend/thi-session-handler'

import styles from '../styles/Login.module.css'

import SwitchLanguge from '../components/SwitchLanguage'
import TranslateDangerous from '../components/TranslateDangerous'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

const ORIGINAL_ERROR_WRONG_CREDENTIALS = 'Wrong credentials'
const FRIENDLY_ERROR_WRONG_CREDENTIALS = 'Deine Zugangsdaten sind ungültig.'

const IMPRINT_URL = process.env.NEXT_PUBLIC_IMPRINT_URL
const GIT_URL = process.env.NEXT_PUBLIC_GIT_URL

export default function Login () {
  const router = useRouter()
  const { redirect } = router.query

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [saveCredentials, setSaveCredentials] = useState(false)
  const [failure, setFailure] = useState(false)

  const { t } = useTranslation()

  async function attemptLogin (e) {
    try {
      e.preventDefault()
      await createSession(username, password, saveCredentials)
      router.replace('/' + (redirect || ''))
    } catch (e) {
      if (e.message === ORIGINAL_ERROR_WRONG_CREDENTIALS) {
        setFailure(FRIENDLY_ERROR_WRONG_CREDENTIALS)
      } else {
        setFailure(e.toString())
      }
    }
  }

  return (
    <AppContainer>
      <AppNavbar title="neuland.app" showBack={false} />
      <SwitchLanguge/>
      <AppBody>
        <div className={styles.container}>
          <Form className={styles.main} onSubmit={e => attemptLogin(e)} autoComplete="on">
            {failure &&
              <Alert variant="danger">
                {failure}
              </Alert>
            }

            <Form.Group>
              <Form.Label>{ t('login.form.username') }</Form.Label>
              <Form.Control
                type="text"
                autoComplete="username"
                placeholder="abc1234"
                className="form-control"
                value={username}
                isInvalid={!!failure}
                onChange={e => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>{ t('login.form.password') }</Form.Label>
              <Form.Control
                type="password"
                autoComplete="current-password"
                className="form-control"
                value={password}
                isInvalid={!!failure}
                onChange={e => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Check
                type="checkbox"
                id="stay-logged-in"
                label={ t('login.form.stay-logged-in') }
                onChange={e => setSaveCredentials(e.target.checked)}
              />
            </Form.Group>

            <Form.Group>
              <Button type="submit" className={styles.loginButton}>
                { t('login.form.log-in') }
              </Button>
            </Form.Group>
          </Form>

          <div className={styles.disclaimer}>
            <h6>{ t('login.description.intro.title') }</h6>
            <p>
              <TranslateDangerous i18nKey="login.description.intro.body"/>
            </p>
            <h6>{ t('login.description.developers.title') }</h6>
            <p>
              <TranslateDangerous i18nKey="login.description.developers.body"/>
            </p>
            <h6>{ t('login.description.privacy.title')}</h6>
            <p>
              <TranslateDangerous i18nKey="login.description.privacy.body"/>

            </p>
            <p>
              <a href={`${GIT_URL}/blob/master/docs/data-security-de.md`}>{ t('login.links.data-security') }</a>
            </p>
            <p>
              <a href={GIT_URL} target="_blank" rel="noreferrer">{ t('login.links.github') }</a>
              <> &ndash; </>
              <a href={IMPRINT_URL} target="_blank" rel="noreferrer">{ t('login.links.imprint') }</a>
            </p>
          </div>
        </div>
      </AppBody>
    </AppContainer>
  )
}

export async function getStaticProps ({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
      // Will be passed to the page component as props
    }
  }
}
