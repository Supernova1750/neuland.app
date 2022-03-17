import React, { useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
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
import { ThemeContext } from './_app'

import { forgetSession } from '../lib/backend/thi-session-handler'

import BaseCard from '../components/cards/BaseCard'
import CalendarCard from '../components/cards/CalendarCard'
import DiscordPrompt from '../components/cards/DiscordPrompt'
import FoodCard from '../components/cards/FoodCard'
import InstallPrompt from '../components/cards/InstallPrompt'
import MobilityCard from '../components/cards/MobilityCard'
import TimetableCard from '../components/cards/TimetableCard'

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import styles from '../styles/Home.module.css'
import TranslateDagerous from '../components/TranslateDangerous'

const CTF_URL = process.env.NEXT_PUBLIC_CTF_URL
const  ALL_THEMES = [
  { name: 'Automatisch', style: 'default' },
  { name: 'Hell', style: 'light' },
  { name: 'Dunkel', style: 'dark' },
  { name: 'Barbie & Ken', style: 'barbie' },
  { name: 'Retro', style: 'retro' },
  { name: 'Windows 95', style: '95' },
  { name: 'Hackerman', style: 'hacker', requiresToken: true }
]

const PLATFORM_DESKTOP = 'desktop'
const PLATFORM_MOBILE = 'mobile'
const USER_STUDENT = 'student'
const USER_EMPLOYEE = 'employee'
const ALL_DASHBOARD_CARDS = [
  {
    key: 'install',
    label: 'Installation',
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
    label: 'Discord-Server',
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
    label: 'Stundenplan',
    default: [PLATFORM_DESKTOP, USER_STUDENT, USER_EMPLOYEE],
    card: () => <TimetableCard key="timetable" />
  },
  {
    key: 'mensa',
    label: 'Essen',
    default: [PLATFORM_DESKTOP, USER_STUDENT, USER_EMPLOYEE],
    card: () => <FoodCard key="mensa" />
  },
  {
    key: 'mobility',
    label: 'Mobilität',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT, USER_EMPLOYEE],
    card: () => <MobilityCard key="mobility" />
  },
  {
    key: 'calendar',
    label: 'Termine',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT, USER_EMPLOYEE],
    card: () => <CalendarCard key="calendar" />
  },
  {
    key: 'rooms',
    label: 'Raumplan',
    default: [PLATFORM_DESKTOP, USER_STUDENT, USER_EMPLOYEE],
    card: () => (
      <BaseCard
        key="rooms"
        icon={faDoorOpen}
        title="Räume"
        link="/rooms"
        />
    )
  },
  {
    key: 'library',
    label: "Bibliothek",
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT],
    card: () => (
      <BaseCard
        key="library"
        icon={faBook}
        title="Bibliothek"
        link="/library"
        />
    )
  },
  {
    key: 'grades',
    label: 'Noten & Fächer',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT],
    card: () => (
      <BaseCard
        key="grades"
        icon={faScroll}
        title="Noten & Fächer"
        link="/grades"
        />
    )
  },
  {
    key: 'personal',
    label: 'Persönliche Daten',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT],
    card: () => (
      <BaseCard
        key="personal"
        icon={faUser}
        title="Persönliche Daten"
        link="/personal"
        />
    )
  },
  {
    key: 'lecturers',
    label: 'Dozenten',
    default: [PLATFORM_DESKTOP, PLATFORM_MOBILE, USER_STUDENT, USER_EMPLOYEE],
    card: () => (
      <BaseCard
        key="lecturers"
        icon={faUserGraduate}
        title="Dozenten"
        link="/lecturers"
        />
    )
  }
]

export default function Home () {
  const router = useRouter()
  const { t } = useTranslation()

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
    const expires = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years in the future
    document.cookie = `theme=${theme}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`

    setTheme(theme)
    setShowThemeModal(false)
  }

  return (
    <AppContainer>
      <AppNavbar title="neuland.app" showBack={false}>
        <AppNavbar.Button onClick={() => setShowThemeModal(true)}>
          <FontAwesomeIcon title={ t('index.personalize.title') } icon={faPen} fixedWidth />
        </AppNavbar.Button>
        <AppNavbar.Overflow>
          {showDebug && (
            <Dropdown.Item variant="link" href="/debug">
              API Spielwiese
            </Dropdown.Item>
          )}
          <Dropdown.Item variant="link" href="/imprint">
            Impressum & Datenschutz
          </Dropdown.Item>
          <Dropdown.Item variant="link" onClick={() => forgetSession(router)}>
            Ausloggen
          </Dropdown.Item>
        </AppNavbar.Overflow>
      </AppNavbar>

      <AppBody>
        <div className={styles.cardDeck}>
          <Modal show={!!showThemeModal} dialogClassName={styles.themeModal} onHide={() => setShowThemeModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{ t('index.personalize.title') }</Modal.Title>
            </Modal.Header>
            <Modal.Body ref={themeModalBody}>
              <h3 className={styles.themeHeader}>Design</h3>
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
                    {availableTheme.name}
                  </Button>
                ))}
              </Form>
              <p>
                <TranslateDagerous i18nKey="index.personalize.themenotice" />
              </p>

              <h3 className={styles.themeHeader}>Dashboard</h3>
              <p>
                Hier kannst du die Reihenfolge der im Dashboard angezeigten Einträge verändern.
              </p>
              <ListGroup>
                {shownDashboardEntries.map((entry, i) => (
                  <ListGroup.Item key={i} className={styles.personalizeItem}>
                    <div className={styles.personalizeLabel}>
                      {entry.label}
                    </div>
                    <div className={styles.personalizeButtons}>
                      <Button variant="text" onClick={() => moveDashboardEntry(i, -1)}>
                        <FontAwesomeIcon title="Nach oben" icon={faChevronUp} fixedWidth />
                      </Button>
                      <Button variant="text" onClick={() => moveDashboardEntry(i, +1)}>
                        <FontAwesomeIcon title="Nach unten" icon={faChevronDown} fixedWidth />
                      </Button>
                      <Button variant="text" onClick={() => hideDashboardEntry(entry.key)}>
                        <FontAwesomeIcon title="Entfernen" icon={faTrash} fixedWidth />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <br />

              <h4>Ausgeblendete Elemente</h4>
              <ListGroup>
                {hiddenDashboardEntries.map((entry, i) => (
                  <ListGroup.Item key={i} className={styles.personalizeItem}>
                    <div className={styles.personalizeLabel}>
                      {entry.label}
                    </div>
                    <div className={styles.personalizeButtons}>
                      <Button variant="text" onClick={() => bringBackDashboardEntry(i)}>
                        <FontAwesomeIcon title="Wiederherstellen" icon={faTrashRestore} fixedWidth />
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
                Reihenfolge zurücksetzen
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

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  };
}