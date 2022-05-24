import React, { useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import Modal from 'react-bootstrap/Modal'

import {
  faBook,
  faChevronDown,
  faChevronUp,
  faDoorOpen,
  faPen,
  faScroll,
  faTrash,
  faTrashRestore,
  faUser,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import AppBody from '../components/page/AppBody'
import AppContainer from '../components/page/AppContainer'
import AppNavbar from '../components/page/AppNavbar'
import AppTabbar from '../components/page/AppTabbar'
import Dropdown from 'react-bootstrap/Dropdown'
import { ThemeContext } from './_app'

import { forgetSession } from '../lib/backend/thi-session-handler'

import BaseCard from '../components/cards/BaseCard'
import CalendarCard from '../components/cards/CalendarCard'
import DiscordPrompt from '../components/cards/DiscordPrompt'
import FoodCard from '../components/cards/FoodCard'
import InstallPrompt from '../components/cards/InstallPrompt'
import MobilityCard from '../components/cards/MobilityCard'
import TimetableCard from '../components/cards/TimetableCard'

import TranslateDangerous from '../components/TranslateDangerous'
import languages from '../data/languages.json'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import styles from '../styles/Home.module.css'

// const CTF_URL = process.env.NEXT_PUBLIC_CTF_URL

const ALL_THEMES = [
  { style: 'default' },
  { style: 'light' },
  { style: 'dark' },
  { style: 'thi' },
  { style: 'barbie' },
  { style: 'retro' },
  { style: '95' },
  { style: 'hacker', requiresToken: true }

]

const PLATFORM_DESKTOP = 'desktop'
const PLATFORM_MOBILE = 'mobile'
const USER_STUDENT = 'student'
const USER_EMPLOYEE = 'employee'
const ALL_DASHBOARD_CARDS = [
  {
    key: 'install',
    default: [PLATFORM_MOBILE, USER_STUDENT, USER_EMPLOYEE],
    card: hidePromptCard => (
      <InstallPrompt
        key="install"
        onHide={() => hidePromptCard('install')}
      />
    )
  },
  {
    key: 'discord',
    default: [],
    card: hidePromptCard => (
      <DiscordPrompt
        key="discord"
        onHide={() => hidePromptCard('discord')}
      />
    )
  },
  {
    key: 'timetable',
    default: [PLATFORM_DESKTOP, USER_STUDENT, USER_EMPLOYEE],
    card: () => <TimetableCard key="timetable" />
  },
  {
    key: 'food',
    default: [PLATFORM_DESKTOP, USER_STUDENT, USER_EMPLOYEE],
    card: () => <FoodCard key="food" />
  },
  {
    key: 'mobility',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT, USER_EMPLOYEE],
    card: () => <MobilityCard key="mobility" />
  },
  {
    key: 'calendar',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT, USER_EMPLOYEE],
    card: () => <CalendarCard key="calendar" />
  },
  {
    key: 'rooms',
    default: [PLATFORM_DESKTOP, USER_STUDENT, USER_EMPLOYEE],
    card: () => (
      <BaseCard
        key="rooms"
        icon={faDoorOpen}
        i18nKey="rooms"
        link="/rooms"
      />
    )
  },
  {
    key: 'library',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT],
    card: () => (
      <BaseCard
        key="library"
        icon={faBook}
        i18nKey="library"
        link="/library"
      />
    )
  },
  {
    key: 'grades',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT],
    card: () => (
      <BaseCard
        key="grades"
        icon={faScroll}
        i18nKey="grades"
        link="/grades"
      />
    )
  },
  {
    key: 'personal',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT],
    card: () => (
      <BaseCard
        key="personal"
        icon={faUser}
        i18nKey="personal"
        link="/personal"
      />
    )
  },
  {
    key: 'lecturers',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT, USER_EMPLOYEE],
    card: () => (
      <BaseCard
        key="lecturers"
        icon={faUserGraduate}
        i18nKey="lecturers"
        link="/lecturers"
      />
    )
  }
]

export default function Home () {
  const router = useRouter()
  const [t, i18n] = useTranslation()

  // page state
  const [shownDashboardEntries, setShownDashboardEntries] = useState([])
  const [hiddenDashboardEntries, setHiddenDashboardEntries] = useState([])
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [unlockedThemes, setUnlockedThemes] = useState([])
  const [showDebug, setShowDebug] = useState(false)
  const [theme, setTheme] = useContext(ThemeContext)

  const themeModalBody = useRef()

  useEffect(() => {
    async function load () {
      if (localStorage.personalizedDashboard) {
        const entries = JSON.parse(localStorage.personalizedDashboard)
          .map(key => ALL_DASHBOARD_CARDS.find(x => x.key === key))
          .filter(x => !!x)
        const hiddenEntries = JSON.parse(localStorage.personalizedDashboardHidden)
          .map(key => ALL_DASHBOARD_CARDS.find(x => x.key === key))
          .filter(x => !!x)

        ALL_DASHBOARD_CARDS.forEach(card => {
          if (!entries.find(x => x.key === card.key) && !hiddenEntries.find(x => x.key === card.key)) {
            // new (previosly unknown) card
            entries.push(card)
          }
        })
        setShownDashboardEntries(entries)
        setHiddenDashboardEntries(hiddenEntries)
      } else {
        const platform = window.matchMedia('(max-width: 768px)').matches ? PLATFORM_MOBILE : PLATFORM_DESKTOP
        const personGroup = localStorage.isStudent !== 'false' ? USER_STUDENT : USER_EMPLOYEE
        const filter = x => x.default.includes(platform) && x.default.includes(personGroup)
        setShownDashboardEntries(ALL_DASHBOARD_CARDS.filter(filter))
        setHiddenDashboardEntries(ALL_DASHBOARD_CARDS.filter(x => !filter(x)))
      }

      if (localStorage.unlockedThemes) {
        setUnlockedThemes(JSON.parse(localStorage.unlockedThemes))
      }
      if (localStorage.debugUnlocked) {
        setShowDebug(true)
      }
    }
    load()
  }, [])

  function changeDashboardEntries (entries, hiddenEntries) {
    localStorage.personalizedDashboard = JSON.stringify(entries.map(x => x.key))
    localStorage.personalizedDashboardHidden = JSON.stringify(hiddenEntries.map(x => x.key))
    setShownDashboardEntries(entries)
    setHiddenDashboardEntries(hiddenEntries)
  }

  function moveDashboardEntry (oldIndex, diff) {
    const newIndex = oldIndex + diff
    if (newIndex < 0 || newIndex >= shownDashboardEntries.length) {
      return
    }

    const entries = shownDashboardEntries.slice(0)
    const entry = entries[oldIndex]
    entries.splice(oldIndex, 1)
    entries.splice(newIndex, 0, entry)

    changeDashboardEntries(entries, hiddenDashboardEntries)
  }

  function hideDashboardEntry (key) {
    const entries = shownDashboardEntries.slice(0)
    const hiddenEntries = hiddenDashboardEntries.slice(0)

    const index = entries.findIndex(x => x.key === key)
    if (index >= 0) {
      hiddenEntries.push(entries[index])
      entries.splice(index, 1)
    }

    changeDashboardEntries(entries, hiddenEntries)
  }

  function bringBackDashboardEntry (index) {
    const entries = shownDashboardEntries.slice(0)
    const hiddenEntries = hiddenDashboardEntries.slice(0)

    entries.push(hiddenEntries[index])
    hiddenEntries.splice(index, 1)

    changeDashboardEntries(entries, hiddenEntries)
  }

  function changeTheme (theme) {
    localStorage.theme = theme
    setTheme(theme)
    setShowThemeModal(false)
  }
  // TODO: load language name from language pack to display in dropdown menu
  return (
    <AppContainer>
      <AppNavbar title="neuland.app" showBack={false}>
        <AppNavbar.Button onClick={() => setShowThemeModal(true)}>
          <FontAwesomeIcon title={t('index.personalize.title')} icon={faPen} fixedWidth />
        </AppNavbar.Button>
        <AppNavbar.Overflow>
          {showDebug && (
            <AppNavbar.Overflow.Link variant="link" href="/debug">
              {t('index.dropdown.apiplayground')}
            </AppNavbar.Overflow.Link>
          )}
          <AppNavbar.Overflow.Link variant="link" href="/imprint">
            {t('index.dropdown.imprint')}
          </AppNavbar.Overflow.Link>
          <AppNavbar.Overflow.Link variant="link" onClick={() => forgetSession(router)}>
            {t('index.dropdown.logout')}
          </AppNavbar.Overflow.Link>
        </AppNavbar.Overflow>
      </AppNavbar>

      <AppBody>
        <div className={styles.cardDeck}>
          <Modal show={!!showThemeModal} dialogClassName={styles.themeModal} onHide={() => setShowThemeModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('index.personalize.title')}</Modal.Title>
            </Modal.Header>
            <Modal.Body ref={themeModalBody}>
              <h3 className={styles.themeHeader}>{t('index.personalize.language.title')}</h3>
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">
                  { languages[router.locale] }
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  { router.locales.filter(item => item !== i18n.resolvedLanguage).map((lang, i) => (
                    <Dropdown.Item key={ i } href={ lang }>{ languages[lang] }</Dropdown.Item>
                  )) }
                </Dropdown.Menu>
              </Dropdown>
              <h3 className={styles.themeHeader}>{t('index.personalize.themes.title')}</h3>
              <Form>
                {ALL_THEMES.map((availableTheme, i) => (
                  <Button
                    key={i}
                    id={`theme-${i}`}
                    className={styles.themeButton}
                    variant={theme === availableTheme.style ? 'primary' : 'secondary'}
                    onClick={() => changeTheme(availableTheme.style)}
                    disabled={availableTheme.requiresToken && unlockedThemes.indexOf(availableTheme.style) === -1}
                  >
                    {t('index.personalize.themes.' + availableTheme.style)}
                  </Button>
                ))}
              </Form>
              <p>
                <TranslateDangerous i18nKey="index.personalize.themes.notice" />
              </p>

              <h3 className={styles.themeHeader}>{t('index.personalize.dashboard.title')}</h3>
              <p>
                <TranslateDangerous i18nKey="index.personalize.dashboard.notice" />
              </p>
              <ListGroup>
                {shownDashboardEntries.map((entry, i) => (
                  <ListGroup.Item key={i} className={styles.personalizeItem}>
                    <div className={styles.personalizeLabel}>
                      {t('homecards.' + entry.key + '.title')}
                    </div>
                    <div className={styles.personalizeButtons}>
                      <Button variant="text" onClick={() => moveDashboardEntry(i, -1)}>
                        <FontAwesomeIcon title={t('index.personalize.dashboard.up')} icon={faChevronUp} fixedWidth />
                      </Button>
                      <Button variant="text" onClick={() => moveDashboardEntry(i, +1)}>
                        <FontAwesomeIcon title={t('index.personalize.dashboard.down')} icon={faChevronDown} fixedWidth />
                      </Button>
                      <Button variant="text" onClick={() => hideDashboardEntry(entry.key)}>
                        <FontAwesomeIcon title={t('index.personalize.dashboard.remove')} icon={faTrash} fixedWidth />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <br />

              <h4>{t('index.personalize.dashboard.title-hidden')}</h4>
              <ListGroup>
                {hiddenDashboardEntries.map((entry, i) => (
                  <ListGroup.Item key={i} className={styles.personalizeItem}>
                    <div className={styles.personalizeLabel}>
                      {t('homecards.' + entry.key)}
                    </div>
                    <div className={styles.personalizeButtons}>
                      <Button variant="text" onClick={() => bringBackDashboardEntry(i)}>
                        <FontAwesomeIcon title={t('index.personalize.dashboard.restore')} icon={faTrashRestore} fixedWidth />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <br />

              <Button
                variant="secondary"
                onClick={() => changeDashboardEntries(ALL_DASHBOARD_CARDS, [])}
              >
                {t('index.personalize.dashboard.reset')}
              </Button>
            </Modal.Body>
          </Modal>

          {shownDashboardEntries.map(entry => entry.card(hideDashboardEntry))}
        </div>
      </AppBody>

      <AppTabbar />
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
