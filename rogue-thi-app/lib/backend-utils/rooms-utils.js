import API from '../backend/authenticated-api'

const IGNORE_GAPS = 15

export const BUILDINGS_ALL = 'Alle'
export const DURATION_PRESET = '01:00'

function addMinutes (date, minutes) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes() + minutes,
    date.getSeconds(),
    date.getMilliseconds()
  )
}

function minDate (a, b) {
  return a < b ? a : b
}

function maxDate (a, b) {
  return a > b ? a : b
}

/**
 * Converts the room plan for easier processing.
 * @param rooms rooms array as described in thi-rest-api.md
 * @returns { [room]: { from, until } }
 */
export function getRoomOpenings (rooms, date) {
  const openings = {}
  // get todays rooms
  rooms.filter(room => room.datum === date)
    // flatten room types
    .flatMap(room => room.rtypes)
    // flatten time slots
    .flatMap(rtype =>
      Object.values(rtype.stunden)
        .map(stunde => ({
          type: rtype.raumtyp,
          ...stunde
        }))
    )
    // flatten room list
    .flatMap(stunde =>
      stunde.raeume.split(', ')
        .map(room => ({
          room,
          type: stunde.type,
          from: new Date(date + 'T' + stunde.von),
          until: new Date(date + 'T' + stunde.bis)
        }))
    )
    // iterate over every room
    .forEach(({ room, type, from, until }) => {
      // initialize room
      const roomOpenings = openings[room] = openings[room] || []
      // find overlapping opening
      // ignore gaps of up to IGNORE_GAPS minutes since the time slots don't line up perfectly
      const opening = roomOpenings.find(opening =>
        from <= addMinutes(opening.until, IGNORE_GAPS) &&
        until >= addMinutes(opening.from, -IGNORE_GAPS)
      )
      if (opening) {
        // extend existing opening
        opening.from = minDate(from, opening.from)
        opening.until = maxDate(until, opening.until)
      } else {
        // create new opening
        roomOpenings.push({ type, from, until })
      }
    })
  return openings
}

/**
 * Get a suitable preset for the time selector.
 * If outside the opening hours, this will skip to the time the university opens.
 */
export function getNextValidDate () {
  const startDate = new Date()

  if (startDate.getDay() === 0 || startDate.getHours() > 20) { // sunday or after 9pm
    startDate.setDate(startDate.getDate() + 1)
    startDate.setHours(6)
    startDate.setMinutes(0)
  } else if (startDate.getHours() < 6) { // before 6am
    startDate.setHours(6)
    startDate.setMinutes(0)
  }

  return startDate
}

export async function filterRooms (date, time, building = BUILDINGS_ALL, duration = DURATION_PRESET) {
  const beginDate = new Date(date + 'T' + time)

  const [durationHours, durationMinutes] = duration.split(':').map(x => parseInt(x, 10))
  const endDate = new Date(
    beginDate.getFullYear(),
    beginDate.getMonth(),
    beginDate.getDate(),
    beginDate.getHours() + durationHours,
    beginDate.getMinutes() + durationMinutes,
    beginDate.getSeconds(),
    beginDate.getMilliseconds()
  )

  const data = await API.getFreeRooms(beginDate)
  const openings = getRoomOpenings(data.rooms, date)
  return Object.keys(openings)
    .flatMap(room =>
      openings[room].map(opening => ({
        room,
        type: opening.type,
        from: opening.from,
        until: opening.until
      }))
    )
    .filter(opening =>
      (building === BUILDINGS_ALL || opening.room.toLowerCase().startsWith(building.toLowerCase())) &&
      beginDate >= opening.from &&
      endDate <= opening.until
    )
    .sort((a, b) => a.room.localeCompare(b.room))
}
