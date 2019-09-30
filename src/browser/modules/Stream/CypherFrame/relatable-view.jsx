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

import React, { useMemo } from 'react'
import Relatable from '@relate-by-ui/relatable'
import { get, head, map, slice } from 'lodash-es'
import { sanitize } from 'dompurify'

import {
  getBodyAndStatusBarMessages,
  mapNeo4jValuesToPlainValues
} from './helpers'
import arrayHasItems from '../../../../shared/utils/array-has-items'

import ClickableUrls, {
  convertUrlsToHrefTags
} from '../../../components/clickable-urls'
import { StyledJsonPre } from '../../../components/DataTables'
import { StyledStatsBar } from '../styled'
import Ellipsis from '../../../components/Ellipsis'

export default function RelatableView ({ maxRows, result }) {
  const { records = [] } = result
  const columns = useMemo(() => getColumns(records), [records])

  if (!arrayHasItems(columns)) { return <RelatableBodyMessage result={result} maxRows={maxRows} /> }

  return <Relatable columns={columns} data={slice(records, 0, maxRows)} />
}

function getColumns (records) {
  const keys = get(head(records), 'keys', [])

  return map(keys, key => ({
    Header: key,
    accessor: record => record.get(key),
    Cell: CypherCell
  }))
}

function CypherCell ({ cell }) {
  const { value } = cell
  const mapped = mapNeo4jValuesToPlainValues(value, false)

  if (typeof mapped === 'object') {
    return (
      <StyledJsonPre
        dangerouslySetInnerHTML={{
          __html: convertUrlsToHrefTags(
            sanitize(JSON.stringify(mapped, null, 2))
          )
        }}
      />
    )
  }

  return <ClickableUrls text={mapped} />
}

export function RelatableBodyMessage ({ maxRows, result }) {
  const { bodyMessage } = getBodyAndStatusBarMessages(result, maxRows)

  return (
    <StyledStatsBar>
      <Ellipsis>{bodyMessage}</Ellipsis>
    </StyledStatsBar>
  )
}

export function RelatableStatusbar ({ maxRows, result }) {
  const { statusBarMessage } = getBodyAndStatusBarMessages(result, maxRows)

  return (
    <StyledStatsBar>
      <Ellipsis>{statusBarMessage}</Ellipsis>
    </StyledStatsBar>
  )
}
