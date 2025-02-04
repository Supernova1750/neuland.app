import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import Modal from 'react-bootstrap/Modal'
import ReactPlaceholder from 'react-placeholder'
import TranslateDangerous from '../components/TranslateDangerous'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

import AppBody from '../components/page/AppBody'
import AppContainer from '../components/page/AppContainer'
import AppNavbar from '../components/page/AppNavbar'
import AppTabbar from '../components/page/AppTabbar'

import { formatNearDate } from '../lib/date-utils'
import { loadFoodEntries } from '../lib/backend-utils/food-utils'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import styles from '../styles/Mensa.module.css'

// import flagMap from '../data/mensa-flags.json'

const CURRENCY_LOCALE = 'de'
const COLOR_WARN = '#bb0000'
const FALLBACK_ALLERGEN = 'Unbekannt (Das ist schlecht.)'

export default function Mensa () {
  const router = useRouter()
  const { t } = useTranslation()

  const [foodEntries, setFoodEntries] = useState(null)
  const [selectedRestaurants, setSelectedRestaurants] = useState(['mensa'])
  const [showMealDetails, setShowMealDetails] = useState(null)
  const [allergenSelection, setAllergenSelection] = useState({})
  const [showAllergenSelection, setShowAllergenSelection] = useState(false)
  const [isStudent, setIsStudent] = useState(true)

  const allergensMap = t('flags.allergens', { ns: 'food', returnObjects: true })
  const flagMap = t('flags.mensa-flags', { ns: 'food', returnObjects: true })

  useEffect(() => {
    async function load () {
      try {
        setFoodEntries(await loadFoodEntries(selectedRestaurants, router.locale))
      } catch (e) {
        console.error(e)
        alert(e)
      }
    }
    load()
  }, [selectedRestaurants, router])

  useEffect(() => {
    console.log(t('allergens', { ns: 'allergens' }))
    if (localStorage.selectedAllergens) {
      setAllergenSelection(JSON.parse(localStorage.selectedAllergens))
    }
    if (localStorage.selectedRestaurants) {
      setSelectedRestaurants(JSON.parse(localStorage.selectedRestaurants))
    }
    if (localStorage.isStudent === 'false') {
      setIsStudent(false)
    }
  }, [t])

  function toggleSelectedRestaurant (name) {
    const checked = selectedRestaurants.includes(name)
    const newSelection = selectedRestaurants.filter(x => x !== name)
    if (!checked) {
      newSelection.push(name)
    }

    setSelectedRestaurants(newSelection)
    localStorage.selectedRestaurants = JSON.stringify(newSelection)
  }

  function saveAllergenSelection () {
    localStorage.selectedAllergens = JSON.stringify(allergenSelection)
    setShowAllergenSelection(false)
  }

  function containsSelectedAllergen (allergens) {
    if (!allergens) {
      return false
    }
    return allergens.some(x => allergenSelection[x])
  }

  function formatPrice (x) {
    return x?.toLocaleString(CURRENCY_LOCALE, { style: 'currency', currency: 'EUR' })
  }
  function getUserSpecificPrice (meal) {
    const price = isStudent ? meal.prices.student : meal.prices.employee
    return formatPrice(price)
  }

  return (
    <AppContainer>
      <AppNavbar title={ t('title', { ns: 'food' }) } showBack={'desktop-only'}>
        <AppNavbar.Overflow>
          <AppNavbar.Overflow.Link variant="link" onClick={() => setShowAllergenSelection(true)}>
            {t('options.allergens.title', { ns: 'food' })}
          </AppNavbar.Overflow.Link>
          <AppNavbar.Overflow.Link variant="link" onClick={() => toggleSelectedRestaurant('mensa')}>
            {selectedRestaurants.includes('mensa') ? t('options.mensa.disable', { ns: 'food' }) : t('options.mensa.enable', { ns: 'food' })}
          </AppNavbar.Overflow.Link>
          <AppNavbar.Overflow.Link variant="link" onClick={() => toggleSelectedRestaurant('reimanns')}>
            {selectedRestaurants.includes('reimanns') ? t('options.reimanns.disable', { ns: 'food' }) : t('options.reimanns.enable', { ns: 'food' })}
          </AppNavbar.Overflow.Link>
        </AppNavbar.Overflow>
      </AppNavbar>

      <AppBody>
        <ReactPlaceholder type="text" rows={20} ready={foodEntries}>
          {foodEntries && foodEntries.map((day, idx) =>
            <ListGroup key={idx}>
              <h4 className={styles.dateBoundary}>
                {formatNearDate(day.timestamp)}
              </h4>

              {day.meals.map((meal, idx) =>
                <ListGroup.Item
                  key={idx}
                  className={styles.item}
                  onClick={() => setShowMealDetails(meal)}
                  action
                >
                  <div className={styles.left}>
                    <div className={styles.name}>
                      {meal.name}
                    </div>
                    <div className={styles.room}>
                      <small style={{ color: containsSelectedAllergen(meal.allergens) && COLOR_WARN }}>
                        {!meal.allergens && 'Unbekannte Zutaten / Allergene'}
                        {containsSelectedAllergen(meal.allergens) && (
                          <span>
                            <FontAwesomeIcon title="Warnung" icon={faExclamationTriangle} color={COLOR_WARN} />
                            {' '}
                          </span>
                        )}
                        {meal.flags && meal.flags.map((flag, idx) => (
                          <span key={idx}>
                            {idx > 0 && ', '}
                            <span>
                              {flagMap[flag]}
                            </span>
                          </span>
                        ))}
                        {meal.allergens && meal.allergens.map((supplement, idx) => (
                          <span key={idx}>
                            {(idx > 0 || meal.flags?.length > 0) && ', '}
                            <span>
                              {supplement}
                            </span>
                          </span>
                        ))}
                      </small>
                    </div>
                  </div>
                  <div className={styles.right}>
                    {getUserSpecificPrice(meal)}
                    <br />
                    {meal.restaurant}
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>
          )}
          {foodEntries && foodEntries.length === 0 &&
            <ListGroup>
              <ListGroup.Item>
                {t('entrylist.empty', { ns: 'food' })}
              </ListGroup.Item>
            </ListGroup>
          }
        </ReactPlaceholder>

        <br />

        <Modal show={showMealDetails} onHide={() => setShowMealDetails(null)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('mealdetails.title', { ns: 'food' })}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <h5>{t('mealdetails.annotation.title', { ns: 'food' })}</h5>
            {showMealDetails?.flags === null && t('mealdetails.unknown', { ns: 'food' })}
            {showMealDetails?.flags?.length === 0 && t('mealdetails.emptylist', { ns: 'food' })}
            <ul>
              {showMealDetails?.flags?.map(flag => (
                <li key={flag}>
                  <strong>{flag}</strong>
                  {' – '}
                  {flagMap[flag] || FALLBACK_ALLERGEN}
                </li>
              ))}
            </ul>

            <h5>{t('mealdetails.allergens.title', { ns: 'food' })}</h5>
            {showMealDetails?.allergens === null && t('mealdetails.unknown', { ns: 'food' })}
            {showMealDetails?.allergens?.length === 0 && t('mealdetails.emptylist', { ns: 'food' })}
            <ul>
              {showMealDetails?.allergens?.map(key => (
                <li key={key} style={{ color: containsSelectedAllergen([key]) && COLOR_WARN }}>
                  {containsSelectedAllergen([key]) && (
                    <span>
                      <FontAwesomeIcon icon={faExclamationTriangle} color={COLOR_WARN} />
                      {' '}
                    </span>
                  )}
                  {' '}
                  <strong>{key}</strong>
                  {' – '}
                  {allergensMap[key] || FALLBACK_ALLERGEN}
                </li>
              ))}
            </ul>

            <h5>{t('mealdetails.price.title', { ns: 'food' })}</h5>
            <ul>
              <li>
                <strong>{t('mealdetails.price.students', { ns: 'food' })}</strong>:{' '}
                {formatPrice(showMealDetails?.prices.student)}
              </li>
              <li>
                <strong>{t('mealdetails.price.staff', { ns: 'food' })}</strong>:{' '}
                {formatPrice(showMealDetails?.prices.employee)}
              </li>
              <li>
                <strong>{t('mealdetails.price.guests', { ns: 'food' })}</strong>:{' '}
                {formatPrice(showMealDetails?.prices.guest)}
              </li>
            </ul>

            <p>
             <TranslateDangerous i18nKey='mealdetails.disclaimer' namespace='food'/>
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowMealDetails(null)}>OK</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showAllergenSelection} onHide={() => setShowAllergenSelection(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('options.allergens.title', { ns: 'food' })}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>
              {t('options.allergens.description', { ns: 'food' })}
            </p>

            <Form>
              {Object.entries(allergensMap).map(([key, value]) => (
                <Form.Check
                  key={key}
                  id={'allergen-checkbox-' + key}
                  label={<span><strong>{key}</strong>{' – '}{value}</span> }
                  checked={allergenSelection[key] || false}
                  onChange={e => setAllergenSelection({ ...allergenSelection, [key]: e.target.checked })}
                />
              ))}
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" onClick={() => saveAllergenSelection()}>OK</Button>
          </Modal.Footer>
        </Modal>
      </AppBody>

      <AppTabbar />
    </AppContainer>
  )
}

export async function getStaticProps ({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'food', 'allergens']))
      // Will be passed to the page component as props
    }
  }
}
