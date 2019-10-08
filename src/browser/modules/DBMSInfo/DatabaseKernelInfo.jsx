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
import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { compact, entries, map, values, upperFirst } from 'lodash-es'

import {
  getVersion,
  getEdition,
  getStoreSize,
  getClusterRole,
  getDatabases
} from 'shared/modules/dbMeta/dbMetaDuck'
import { getUsedDbName } from 'shared/modules/features/versionedFeatures'
import {
  executeCommand,
  listDbsCommand
} from 'shared/modules/commands/commandsDuck'
import { toHumanReadableBytes } from 'services/utils'
import arrayHasItems from 'shared/utils/array-has-items'

import {
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader
} from 'browser-components/drawer'
import { StyledKey, StyledValue, Link } from './styled'
import RelatableHeadless from './relatable-headless'

const COLUMNS = [
  {
    Header: () => null,
    id: 'key',
    accessor: 'key',
    Cell: ({ cell }) => <StyledKey>{cell.value}:</StyledKey>
  },
  {
    Header: () => null,
    id: 'value',
    accessor: 'value',
    Cell: ({ cell }) => <StyledValue>{cell.value}</StyledValue>
  }
]

export const DatabaseKernelInfo = ({ kernelValues }) => {
  const data = useMemo(
    () => createKernelRows(kernelValues),
    values(kernelValues)
  )

  return (
    <DrawerSection className='database-kernel-info'>
      <DrawerSubHeader>DBMS</DrawerSubHeader>
      <DrawerSectionBody>
        <RelatableHeadless columns={COLUMNS} data={data} />
      </DrawerSectionBody>
    </DrawerSection>
  )
}

const mapStateToProps = state => {
  const kernelValues = {
    role: getClusterRole(state),
    version: getVersion(state),
    edition: getEdition(state),
    dbName: getUsedDbName(state),
    storeSize: getStoreSize(state),
    databases: getDatabases(state)
  }

  return {
    kernelValues
  }
}

export default withBus(connect(mapStateToProps)(DatabaseKernelInfo))

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: cmd => {
      const action = executeCommand(cmd)
      ownProps.bus.send(action.type, action)
    }
  }
}

const DispatchLink = withBus(
  connect(
    null,
    mapDispatchToProps
  )(Link)
)

function createKernelRows (kernelValues) {
  const data = compact(
    map(entries(kernelValues), ([key, value]) => {
      if (!value) return null
      if (key === 'storeSize') { return { key: 'Size', value: toHumanReadableBytes(value) } }
      if (key === 'edition') return { key: 'Edition', value: upperFirst(value) }
      if (key === 'role') return { key: 'Cluster role', value }
      if (key === 'dbName') return { key: 'Name', value }
      if (key === 'databases') {
        return arrayHasItems(value)
          ? {key: 'Databases', value: <DispatchLink>{`:${listDbsCommand}`}</DispatchLink>}
          : null
      }

      return { key: upperFirst(key), value }
    })
  )

  return [
    ...data,
    { key: 'Information', value: <DispatchLink>:sysinfo</DispatchLink> },
    { key: 'Query List', value: <DispatchLink>:queries</DispatchLink> }
  ]
}
