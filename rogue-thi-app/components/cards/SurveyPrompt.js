import React from 'react'

import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

import { faPoll, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useTranslation } from 'next-i18next'
import TranslateDangerous from '../TranslateDangerous'

import styles from '../../styles/Home.module.css'

const SURVEY_URL = process.env.NEXT_PUBLIC_SURVEY_URL

export default function SurveyPrompt ({ onHide }) {
  const { t } = useTranslation()

  return (
    <Card className={styles.card}>
      <Card.Body>
        <Card.Title>
          <FontAwesomeIcon icon={faPoll} fixedWidth />
          {' '}
          {  t("homecards.survey.title") }
          <Button variant="link" className={styles.cardButton} onClick={() => onHide()}>
            <FontAwesomeIcon title={ t("general.close") } icon={faTimes} />
          </Button>
        </Card.Title>
        <Card.Text>
          <p>
            <TranslateDangerous i18nKey="homecards.survey.description"/>
          </p>
          <p>
            <a href={SURVEY_URL} target="_blank" rel="noreferrer">
              <Button variant="outline-secondary">{ t("homecards.survey.link-text") }</Button>
            </a>
          </p>
        </Card.Text>
      </Card.Body>
    </Card>
  )
}
