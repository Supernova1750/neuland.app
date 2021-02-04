
const DATE_LOCALE = 'de-DE'
const WORD_TODAY = 'Heute'
const WORD_TOMORROW = 'Morgen'
const WORD_DAY = 'Tag'
const WORD_DAYS = 'Tagen'
const WORD_HOUR = 'Stunde'
const WORD_HOURS = 'Stunden'
const WORD_MINUTE = 'Minute'
const WORD_MINUTES = 'Minuten'
const WORD_IN = 'in'
const WORD_AGO = 'vor'

export function formatFriendlyTime (datetime) {
  if (typeof datetime === 'string') {
    datetime = new Date(datetime)
  }

  return datetime.toLocaleTimeString(DATE_LOCALE, { hour: 'numeric', minute: '2-digit' })
}

export function formatFriendlyDate (datetime) {
  if (typeof datetime === 'string') {
    datetime = new Date(datetime)
  }

  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  if (datetime.toDateString() === today.toDateString()) {
    return WORD_TODAY
  } else if (datetime.toDateString() === tomorrow.toDateString()) {
    return WORD_TOMORROW
  } else {
    return datetime.toLocaleString(DATE_LOCALE, { day: 'numeric', month: '2-digit', year: 'numeric' })
  }
}

export function formatNearDate (datetime) {
  if (typeof datetime === 'string') {
    datetime = new Date(datetime)
  }

  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  if (datetime.toDateString() === today.toDateString()) {
    return WORD_TODAY
  } else if (datetime.toDateString() === tomorrow.toDateString()) {
    return WORD_TOMORROW
  } else {
    return datetime.toLocaleString(DATE_LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })
  }
}

export function formatFriendlyDateTime (datetime) {
  const date = formatFriendlyDate(datetime)
  const time = formatFriendlyTime(datetime)

  return `${date}, ${time}`
}

function formatAbsoluteFriendlyRelativeTime (date) {
  const delta = Math.abs(date - Date.now())

  const days = delta / 86400000 | 0
  if (days === 1) {
    return `1 ${WORD_DAY}`
  } else if (days > 0) {
    return `${days} ${WORD_DAYS}`
  }

  const hours = delta / 3600000 | 0
  if (hours === 1) {
    return `1 ${WORD_HOUR}`
  } else if (hours > 1) {
    return `${hours} ${WORD_HOURS}`
  }

  const minutes = delta / 60000 | 0
  if (minutes === 1) {
    return `1 ${WORD_MINUTE}`
  } else {
    return `${minutes} ${WORD_MINUTES}`
  }
}

export function formatFriendlyRelativeTime (date) {
  if (Date.now() < date) {
    return `${WORD_IN} ${formatAbsoluteFriendlyRelativeTime(date)}`
  } else {
    return `${WORD_AGO} ${formatAbsoluteFriendlyRelativeTime(date)}`
  }
}

export function formatRelativeMinutes (datetime) {
  if (typeof datetime === 'string') {
    datetime = new Date(datetime)
  }

  const minutes = Math.max(Math.floor((datetime.getTime() - Date.now()) / 60000), 0)
  return `${minutes} min`
}

export function formatISODate (date) {
  return date.getFullYear().toString().padStart(4, '0') + '-' +
    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
    date.getDate().toString().padStart(2, '0')
}

export function formatISOTime (date) {
  return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
}
