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

import {
  addScriptPathPrefix,
  getRootLevelFolder,
  getScriptDisplayName,
  getSubLevelFolders,
  omitScriptPathPrefix,
  sortAndGroupScriptsByPath
} from './my-scripts.utils'

describe('my-script.utils', () => {
  describe('getScriptDisplayName', () => {
    const scriptNoNameNoCommentSingleLine = {
      contents: 'Foo bar'
    }
    const scriptNoNameNoCommentMultiLine = {
      contents: 'Foo bar\nBar baz'
    }
    const scriptNoNameWithComment = {
      contents: '//Comment\nBar baz'
    }
    const scriptWithNameNoComment = {
      name: 'Apa',
      contents: 'Bar baz'
    }
    const scriptWithNameAndComment = {
      name: 'Apa',
      contents: '//donkey\nBar baz'
    }

    test('Uses content as name when nothing else available', () => {
      expect(getScriptDisplayName(scriptNoNameNoCommentSingleLine)).toBe(
        'Foo bar'
      )
    })

    test('Uses only first line of content', () => {
      expect(getScriptDisplayName(scriptNoNameNoCommentMultiLine)).toBe(
        'Foo bar'
      )
    })

    test('Uses comment as name when available', () => {
      expect(getScriptDisplayName(scriptNoNameWithComment)).toBe('Comment')
    })

    test('Uses name as name when available', () => {
      expect(getScriptDisplayName(scriptWithNameNoComment)).toBe('Apa')
    })

    test('Uses name as name even when comment is available', () => {
      expect(getScriptDisplayName(scriptWithNameAndComment)).toBe('Apa')
    })
  })

  describe('sortAndGroupScriptsByPath', () => {
    const scripts = [
      { path: '/' },
      { path: '/foo' },
      { path: '/bar' },
      { path: '/foo/baz' }
    ]

    test('sorts scripts in ascending order by path', () => {
      expect(sortAndGroupScriptsByPath('/', scripts)).toEqual([
        ['/', [{ path: '/' }]],
        ['/bar', [{ path: '/bar' }]],
        ['/foo', [{ path: '/foo' }]],
        ['/foo/baz', [{ path: '/foo/baz' }]]
      ])
    })

    test('Omits scripts not in provided namespace', () => {
      expect(sortAndGroupScriptsByPath('/foo', scripts)).toEqual([
        ['/foo', [{ path: '/foo' }]],
        ['/foo/baz', [{ path: '/foo/baz' }]]
      ])
    })
  })

  describe('omitScriptPathPrefix', () => {
    test('omits prefix from path if present', () => {
      expect(omitScriptPathPrefix('/foo', '/foo/bar/baz')).toBe('/bar/baz')
    })

    test('returns path untouched when prefix not present', () => {
      expect(omitScriptPathPrefix('/apa', '/foo/bar/baz')).toBe('/foo/bar/baz')
    })
  })

  describe('addScriptPathPrefix', () => {
    test('adds prefix to path if present', () => {
      expect(addScriptPathPrefix('/foo', '/bar/baz')).toBe('/foo/bar/baz')
    })

    test('returns path untouched when prefix already present', () => {
      expect(addScriptPathPrefix('/foo', '/foo/bar/baz')).toBe('/foo/bar/baz')
    })
  })

  describe('getRootLevelFolder', () => {
    const namespace = '/foo'
    const scripts = [{ path: '/foo' }, { path: '/foo/baz' }]
    const folders = sortAndGroupScriptsByPath(namespace, scripts)

    test('Returns only root level folder', () => {
      expect(getRootLevelFolder(namespace, folders)).toEqual([
        namespace,
        [{ path: '/foo' }]
      ])
    })

    test('Returns empty folder when none found', () => {
      expect(getRootLevelFolder('/bar', folders)).toEqual(['/bar', []])
    })
  })

  describe('getSubLevelFolders', () => {
    const namespace = '/foo'
    const scripts = [
      { path: '/foo' },
      { path: '/foo/baz' },
      { path: '/foo/bam' }
    ]
    const folders = sortAndGroupScriptsByPath(namespace, scripts)

    test('Returns only sub level folders', () => {
      expect(getSubLevelFolders(namespace, folders)).toEqual([
        ['/foo/bam', [{ path: '/foo/bam' }]],
        ['/foo/baz', [{ path: '/foo/baz' }]]
      ])
    })
  })
})
