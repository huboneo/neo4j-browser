/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import dateFormat from 'dateformat'
import {
  compact,
  filter,
  forEach,
  get,
  intersectionBy,
  join,
  kebabCase,
  last,
  map,
  slice,
  some,
  split
} from 'lodash-es'

import {
  addScriptPathPrefix,
  getScriptDisplayName,
  sortAndGroupScriptsByPath
} from '@relate-by-ui/saved-scripts'
import {
  BROWSER_FAVOURITES_NAMESPACE,
  LOCAL_STORAGE_NAMESPACE,
  SYNC_VERSION_HISTORY_SIZE
} from './user-favorites.constants'
import { NAME } from './user-favorites.duck'
import { getBrowserName } from '../../services/utils'

/**
 * Opens a new window/tab
 * @param     {String}    href
 * @param     {String}    target
 */
export function openNewWindow (href, target = 'blank') {
  // @todo: electron support
  window.open(href, target)
}

/**
 * Converts old user favorites into new structure
 * @param     {Object[]}    oldFavorites
 * @param     {Object[]}    oldFolders
 * @return    {Object[]}                    new user favorites objects ("my scripts")
 */
export function mapOldFavoritesAndFolders (oldFavorites, oldFolders) {
  const oldFoldersMap = new Map(
    map(filter(oldFolders, isNonStatic), folder => [folder.id, folder])
  )
  const oldFilteredFavorites = filter(
    oldFavorites,
    favorite => isNonStatic(favorite) && hasContent(favorite)
  )

  return map(oldFilteredFavorites, favorite => {
    const folder = oldFoldersMap.get(favorite.folder)

    return {
      contents: favorite.content,
      path: addScriptPathPrefix(
        BROWSER_FAVOURITES_NAMESPACE,
        folder ? folder.name : ''
      )
    }
  })
}

/**
 * Array.prototype.filter predicate for removing static favorites and folders (old structure)
 * @param     {Object}      oldFavoriteOrFolder
 * @param     {Boolean}     oldFavoriteOrFolder.isStatic
 * @return    {Boolean}
 */
function isNonStatic ({ isStatic }) {
  return !isStatic
}

/**
 * Array.prototype.filter predicate for removing old favorites without content
 * @param     {Object}      oldFavorite
 * @param     {String}      oldFavorite.content
 * @return    {Boolean}
 */
function hasContent ({ content }) {
  return Boolean(content)
}

/**
 * Returns all unsaved favorites that are not already represented in the saved dataset
 * @param     {Object[]}    unsavedFavorites
 * @param     {Object[]}    savedFavorites
 * @return    {Object[]}                        unsaved favorites that do not have a peer in shared
 */
export function onlyNewFavorites (unsavedFavorites, savedFavorites) {
  return filter(
    unsavedFavorites,
    unsaved =>
      !some(
        savedFavorites,
        saved =>
          saved.contents === unsaved.contents && saved.path === unsaved.path
      )
  )
}

/**
 * Gracefully try to get user favorites from localStorage
 * @return    {Object[]}
 */
export function tryGetUserFavoritesLocalState () {
  try {
    return (
      JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_NAMESPACE)) || []
    )
  } catch (e) {
    return []
  }
}

/**
 * Set user favorites in localStorage
 * @param     {Object[]}    value     new localstorage value
 */
export function setUserFavoritesLocalState (value) {
  window.localStorage.setItem(LOCAL_STORAGE_NAMESPACE, JSON.stringify(value))
}

/**
 * Triggers a user favorite export
 */
export function exportFavorites () {
  localFavoritesExport()
}

/**
 * Exports local favorites using JSZip
 */
export function localFavoritesExport () {
  const localFavorites = tryGetUserFavoritesLocalState()
  const grouped = sortAndGroupScriptsByPath(
    BROWSER_FAVOURITES_NAMESPACE,
    localFavorites
  )
  const zipArchive = new JSZip()
  const dirMap = new Map([[BROWSER_FAVOURITES_NAMESPACE, zipArchive]])
  const joinPathParts = pathParts =>
    pathParts.length > 1
      ? `${BROWSER_FAVOURITES_NAMESPACE}${join(pathParts, '/')}`
      : `${BROWSER_FAVOURITES_NAMESPACE}${join(pathParts, '/')}`

  zipArchive.file('.placeholder', 'forces directory creation')
  forEach(grouped, ([path, favorites]) => {
    const pathParts = compact(split(path, '/'))
    const folderName = last(pathParts)
    const folderPath = joinPathParts(pathParts)
    const parentPath =
      joinPathParts(slice(pathParts, 0, pathParts.length - 1)) || '/'
    const parent =
      dirMap.get(parentPath) || dirMap.get(BROWSER_FAVOURITES_NAMESPACE)

    dirMap.set(folderPath, createZipDirAndFiles(parent, folderName, favorites))
  })

  zipArchive
    .generateAsync({ type: 'blob' })
    .then(blob =>
      saveAs(blob, `my-scripts-${dateFormat(Date.now(), 'isoDateTime')}.zip`)
    )
}

function createZipDirAndFiles (parent, name, favorites) {
  const dir = parent.folder(name)

  forEach(favorites, favorite => {
    const fileName = `${kebabCase(getScriptDisplayName(favorite))}.cypher`

    dir.file(fileName, favorite.contents)
  })

  return dir
}

export function getLocalFavoritesFromState (state) {
  return get(state, [NAME, 'favorites'], [])
}

export function getAllRemoteFavoritesVersions (state) {
  return get(state, 'user-favorites', [])
}

export function getLatestRemoteFavoritesVersionData (state) {
  return get(state, '["user-favorites"][0].data', [])
}

export function getNewUserFavoriteSyncHistoryRevision (
  allVersions,
  localUserFavorites
) {
  return [
    {
      client: getBrowserName(),
      data: localUserFavorites,
      syncedAt: Date.now()
    }
  ].concat(allVersions.slice(0, SYNC_VERSION_HISTORY_SIZE))
}

export function mergeRemoteAndLocalFavorites (
  remoteUserFavorites,
  localUserFavorites
) {
  return [
    ...filter(
      remoteUserFavorites,
      ({ id }) => !some(localUserFavorites, local => local.id === id)
    ),
    ...localUserFavorites
  ]
}

export function statesAreEqual (remoteUserFavorites, localUserFavorites) {
  const intersect = intersectionBy(
    remoteUserFavorites,
    localUserFavorites,
    'id'
  )

  return (
    intersect.length === remoteUserFavorites.length &&
    remoteUserFavorites.length === localUserFavorites.length
  )
}
