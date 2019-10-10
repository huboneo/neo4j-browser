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

import {
  RelatableStyleWrapper,
  StyledJsonPre
} from './relatable-queries.styled'
import { ConfirmationButton } from '../../../components/buttons/ConfirmationButton'

export class QueryError extends Error {}

export default function RelatableQueries ({ queries, onCancelQuery }) {
  const columns = useMemo(() => getQueryColumns(onCancelQuery), [onCancelQuery])

  return (
    <RelatableStyleWrapper>
      <Relatable striped basic columns={columns} data={queries} />
    </RelatableStyleWrapper>
  )
}

const QUERY_COLUMNS = [
  {
    Header: 'Database URI',
    id: 'host',
    accessor: 'host',
    Cell: ({ cell }) => <StyledJsonPre>{cell.value}</StyledJsonPre>
  },
  {
    Header: 'User',
    id: 'username',
    accessor: 'username'
  },
  {
    Header: 'Query',
    id: 'query',
    accessor: 'query',
    Cell: ({ cell }) => <StyledJsonPre>{cell.value}</StyledJsonPre>
  },
  {
    Header: 'Params',
    id: 'parameters',
    accessor: 'parameters',
    Cell: ({ cell }) => (
      <StyledJsonPre>{JSON.stringify(cell.value, null, 2)}</StyledJsonPre>
    )
  },
  {
    Header: 'Meta',
    id: 'metaData',
    accessor: 'metaData',
    Cell: ({ cell }) => (
      <StyledJsonPre>{JSON.stringify(cell.value, null, 2)}</StyledJsonPre>
    )
  },
  {
    Header: 'Elapsed Time',
    id: 'elapsedTimeMillis',
    accessor: 'elapsedTimeMillis',
    Cell: ({ cell }) => `${cell.value} ms`
  }
]

function getQueryColumns (onCancelQuery) {
  return [
    ...QUERY_COLUMNS,
    {
      Header: 'Kill',
      id: 'kill',
      accessor: 'kill',
      Cell: ({ row }) => (
        <ConfirmationButton onConfirmed={() => onCancelQuery(row)} />
      )
    }
  ]
}
