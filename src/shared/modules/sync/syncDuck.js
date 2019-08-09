/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { map } from 'rxjs/operators'

import { syncResourceFor } from 'services/browserSyncService'

import { setItem } from 'services/localstorage'
import { APP_START } from '../app/appDuck'
import {
  getEmptyDocumentSyncData,
  favoritesToLoad,
  loadFavorites,
  CLEAR_OLD_FAVORITES
} from '../favorites/favoritesDuck'
import { foldersToLoad, loadFolders } from '../favorites/foldersDuck'
import {
  grassToLoad,
  updateGraphStyleData,
  composeGrassToSync,
  syncGrass,
  SYNC_GRASS,
  UPDATE_GRAPH_STYLE_DATA
} from 'shared/modules/grass/grassDuck'
import { CLEAR_LOCALSTORAGE } from 'shared/modules/localstorage/localstorageDuck'
import { NAME as USER_FAVORITES_NAME } from '../userFavorites/userFavoritesDuck'

export const NAME = 'sync'
export const NAME_CONSENT = 'syncConsent'
export const NAME_META = 'syncMetadata'
export const SET_SYNC_DATA = 'sync/SET_SYNC_DATA'
export const SYNC_ITEMS = 'sync/SYNC_ITEMS'
export const CLEAR_SYNC = 'sync/CLEAR_SYNC'
export const CLEAR_SYNC_AND_LOCAL = 'sync/CLEAR_SYNC_AND_LOCAL'
export const CONSENT_SYNC = 'sync/CONSENT_SYNC'
export const OPT_OUT_SYNC = 'sync/OPT_OUT_SYNC'
export const AUTHORIZED = 'sync/AUTHORIZED'
export const SET_AUTH_DATA = NAME_META + '/SET_AUTH_DATA'
export const SET_SYNC_METADATA = NAME_META + '/SET_SYNC_METADATA'
export const RESET_METADATA = NAME_META + '/RESET_METADATA'
export const SERVICE_STATUS_UPDATED = NAME_META + '/SERVICE_STATUS_UPDATED'
export const USER_AUTH_STATUS_UPDATED = NAME_META + '/USER_AUTH_STATUS_UPDATED'

export const UP = 'UP'
export const DOWN = 'DOWN'
export const PENDING = 'PENDING'
export const UNKNOWN = 'UNKNOWN'
export const SIGNED_IN = 'SIGNED_IN'
export const SIGNED_OUT = 'SIGNED_OUT'

const initialState = null
const initialConsentState = { consented: false, optedOut: false }
const initialMetadataState = {
  serviceStatus: UNKNOWN,
  userAuthStatus: SIGNED_OUT,
  key: null,
  lastSyncedAt: null,
  profile: null
}

/**
 * Selectors
 */
export function getSync (state) {
  return state[NAME]
}

export function getMetadata (state) {
  return state[NAME_META] || null
}

export function getServiceStatus (state) {
  return (state[NAME_META] || initialMetadataState).serviceStatus
}

export function getUserAuthStatus (state) {
  return (state[NAME_META] || {}).userAuthStatus || SIGNED_OUT
}

export function isUserSignedIn (state) {
  return (state[NAME_META] || {}).userAuthStatus === SIGNED_IN
}

export function getUserData (state) {
  return (state[NAME_META] || {}).profile
}

export function getLastSyncedAt (state) {
  return (
    (state[NAME_META] || {}).lastSyncedAt || initialMetadataState.lastSyncedAt
  )
}

/**
 * Reducer
 */

export function syncReducer (state = initialState, action) {
  if (action.type === APP_START) {
    state = { ...initialState, ...state }
  }

  switch (action.type) {
    case SET_SYNC_DATA:
      return Object.assign({}, state, action.obj)
    case CLEAR_SYNC:
    case CLEAR_SYNC_AND_LOCAL:
      return null
    default:
      return state
  }
}

export function syncConsentReducer (state = initialConsentState, action) {
  if (action.type === APP_START) {
    state = { ...initialState, ...state }
  }

  switch (action.type) {
    case CONSENT_SYNC:
      return Object.assign({}, state, {
        consented: action.consent,
        optedOut: action.consent ? false : state.optedOut
      })
    case CLEAR_SYNC_AND_LOCAL:
      return { consented: false, optedOut: false }
    case OPT_OUT_SYNC:
      return Object.assign({}, state, { optedOut: true })
    case SET_SYNC_DATA:
      return Object.assign({}, state, { optedOut: false })
    default:
      return state
  }
}

export function syncMetaDataReducer (state = initialMetadataState, action) {
  if (action.type === APP_START) {
    state = {
      ...initialMetadataState,
      ...state
    }
  }

  switch (action.type) {
    case SET_AUTH_DATA:
      return {
        ...state,
        ...action.data
      }
    case SET_SYNC_METADATA:
      return {
        ...state,
        key: action.key || null,
        lastSyncedAt: action.lastSyncedAt
      }
    case SERVICE_STATUS_UPDATED:
      return { ...state, serviceStatus: action.status }
    case USER_AUTH_STATUS_UPDATED:
      return { ...state, userAuthStatus: action.status }
    case CLEAR_SYNC:
    case CLEAR_SYNC_AND_LOCAL:
    case RESET_METADATA:
      return { ...initialMetadataState, serviceStatus: state.serviceStatus }
    default:
      return state
  }
}

// Action creators
export function setSyncData (obj) {
  return {
    type: SET_SYNC_DATA,
    obj
  }
}

export function syncItems (itemKey, items) {
  return {
    type: SYNC_ITEMS,
    itemKey,
    items
  }
}

export const clearSync = {
  type: CLEAR_SYNC
}

export const clearSyncAndLocal = {
  type: CLEAR_SYNC_AND_LOCAL
}

export function consentSync (consent) {
  return {
    type: CONSENT_SYNC,
    consent
  }
}

export function optOutSync () {
  return {
    type: OPT_OUT_SYNC
  }
}

export const authorizedAs = userData => {
  return {
    type: AUTHORIZED,
    userData
  }
}

export const setSyncAuthData = data => {
  return {
    type: SET_AUTH_DATA,
    data
  }
}

export function setSyncMetadata (obj) {
  return {
    type: SET_SYNC_METADATA,
    ...obj
  }
}

export function resetSyncMetadata () {
  return {
    type: RESET_METADATA
  }
}

export function updateServiceStatus (status) {
  return {
    type: SERVICE_STATUS_UPDATED,
    status
  }
}

export function updateUserAuthStatus (status) {
  return {
    type: USER_AUTH_STATUS_UPDATED,
    status
  }
}

// Epics
export const syncItemsEpic = (action$, store) =>
  action$
    .ofType(SYNC_ITEMS)
    .do(action => {
      const userId = store.getState().sync.key
      syncResourceFor(userId, action.itemKey, action.items)
    })
    .mapTo({ type: 'NOOP' })

export const clearSyncEpic = (action$, store) =>
  action$
    .ofType(CLEAR_SYNC_AND_LOCAL)
    .do(action => {
      setItem('documents', null)
      setItem(USER_FAVORITES_NAME, null)
      setItem('folders', null)
      setItem('syncConsent', false)
      setItem('grass', null)
    })
    .mapTo({ type: CLEAR_LOCALSTORAGE })

export const syncFavoritesEpic = (action$, store) =>
  action$.ofType(CLEAR_OLD_FAVORITES).pipe(
    map(() => {
      const { syncObj } = getSync(store.getState()) || {}

      return syncItems('documents', getEmptyDocumentSyncData(syncObj))
    })
  )

export const loadFavoritesFromSyncEpic = (action$, store) =>
  action$.ofType(SET_SYNC_DATA).pipe(
    map(action => {
      const { favorites = [] } = favoritesToLoad(action, store)

      return loadFavorites(favorites)
    })
  )

export const loadFoldersFromSyncEpic = (action$, store) =>
  action$.ofType(SET_SYNC_DATA).pipe(
    map(action => {
      const { folders = [] } = foldersToLoad(action, store)

      return loadFolders(folders)
    })
  )

export const loadGrassFromSyncEpic = (action$, store) =>
  action$
    .ofType(SET_SYNC_DATA)
    .do(action => {
      const grass = grassToLoad(action, store)
      if (grass.loadGrass) {
        store.dispatch(updateGraphStyleData(grass.grass))
      }
      if (grass.syncGrass) {
        store.dispatch(syncGrass(grass.grass))
      }
    })
    .mapTo({ type: 'NOOP' })

export const syncGrassEpic = (action$, store) =>
  action$
    .filter(action =>
      [SYNC_GRASS, UPDATE_GRAPH_STYLE_DATA].includes(action.type)
    )
    .map(action => {
      const syncValue = getSync(store.getState())

      if (syncValue && syncValue.syncObj) {
        const grass = composeGrassToSync(store, syncValue)
        return syncItems('grass', grass)
      }
      return { type: 'NOOP' }
    })
