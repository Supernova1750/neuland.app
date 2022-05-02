import { Capacitor } from '@capacitor/core'
import obtainFetchImplementation from '../fetch-implementations'

const ENDPOINT = Capacitor.isNativePlatform() ? 'https://neuland.app' : ''
const ENDPOINT_MODE = process.env.NEXT_PUBLIC_NEULAND_API_MODE || 'direct'
const ENDPOINT_HOST = process.env.NEXT_PUBLIC_NEULAND_API_HOST || ''

class NeulandAPIClient {
  constructor () {
    // XXX we assume here we never set the endpoint mode to `websocket-proxy` for the neuland API
    this.connection = obtainFetchImplementation(ENDPOINT_MODE, {})
  }

  async performRequest (url) {
    const resp = await this.connection.fetch(`${ENDPOINT_HOST}${url}`)

    if (resp.status === 200) {
      return await resp.json()
    } else {
      throw new Error('API returned an error: ' + await resp.text())
    }
  }

  async getMensaPlan () {
    return this.performRequest(`${ENDPOINT}/api/mensa`)
  }

  async getReimannsPlan () {
    return this.performRequest(`${ENDPOINT}/api/reimanns`)
  }

  async getBusPlan (station) {
    return this.performRequest(`${ENDPOINT}/api/bus/${encodeURIComponent(station)}`)
  }

  async getTrainPlan (station) {
    return this.performRequest(`${ENDPOINT}/api/train/${encodeURIComponent(station)}`)
  }

  async getParkingData () {
    return this.performRequest(`${ENDPOINT}/api/parking`)
  }

  async getCharingStationData () {
    return this.performRequest(`${ENDPOINT}/api/charging-stations`)
  }

  async getCampusLifeEvents () {
    return this.performRequest(`${ENDPOINT}/api/cl-events`)
  }

  async getThiEvents () {
    return this.performRequest(`${ENDPOINT}/api/thi-events`)
  }
}

export default new NeulandAPIClient()
