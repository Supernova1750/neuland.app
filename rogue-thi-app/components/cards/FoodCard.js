import React, { useEffect, useState } from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import ReactPlaceholder from 'react-placeholder'
import { faUtensils } from '@fortawesome/free-solid-svg-icons'

import BaseCard from './BaseCard'
import { formatISODate } from '../../lib/date-utils'
import { loadFoodEntries } from '../../lib/backend-utils/food-utils'
import { useTranslation } from 'next-i18next'

export default function FoodCard () {
  const [foodEntries, setFoodEntries] = useState(null)
  const [foodCardTitle, setFoodCardTitle] = useState('food')
  const [foodError, setFoodError] = useState(null)
  const { t } = useTranslation()


  useEffect(() => {
    async function load () {
      const restaurants = localStorage.selectedRestaurants
        ? JSON.parse(localStorage.selectedRestaurants)
        : ['mensa']
      if (restaurants.length === 1 && restaurants[0] === 'mensa') {
        setFoodCardTitle('cafeteria')
      } else if (restaurants.length === 1 && restaurants[0] === 'reimanns') {
        setFoodCardTitle('reimanns')
      } else {
        setFoodCardTitle('food')
      }

      const today = formatISODate(new Date())
      try {
        const entries = await loadFoodEntries(restaurants)
        const todayEntries = entries.find(x => x.timestamp === today)?.meals
        if (!todayEntries) {
          setFoodEntries([])
        } else if (todayEntries.length > 2) {
          setFoodEntries([
            todayEntries[0].name,
            t('homecards.food.remainingtext', {"remaining": todayEntries.length - 1})
          ])
        } else {
          setFoodEntries(todayEntries.map(x => x.name))
        }
      } catch (e) {
        console.error(e)
        setFoodError(e)
      }
    }
    load()
  }, [])

  return (
    <BaseCard
      icon={faUtensils}
      title={ t('homecards.food.title-' + foodCardTitle) }
      link="/food"
    >
      <ReactPlaceholder type="text" rows={5} ready={foodEntries || foodError}>
        <ListGroup variant="flush">
          {foodEntries && foodEntries.map((x, i) => <ListGroup.Item key={i}>
            {x}
          </ListGroup.Item>
          )}
          {foodEntries && foodEntries.length === 0 &&
            <ListGroup.Item>
              Der heutige Speiseplan ist leer.
            </ListGroup.Item>}
          {foodError &&
            <ListGroup.Item>
              Fehler beim Abruf des Speiseplans.<br />
              Irgendetwas scheint kaputt zu sein. :(
            </ListGroup.Item>}
        </ListGroup>
      </ReactPlaceholder>
    </BaseCard>

  )
}
