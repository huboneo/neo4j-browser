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
import { withBus } from 'react-suber'
import { connect } from 'react-redux'

import {
  DrawerSubHeader,
  DrawerSection,
  DrawerSectionBody
} from 'browser-components/drawer'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import arrayHasItems from 'shared/utils/array-has-items'

import { StyledKey, StyledValue, Link } from './styled'
import RelatableHeadless from './relatable-headless'

const COLUMNS = [
  {
    Header: () => null,
    id: 'key',
    accessor: 'key',
    Cell: ({ cell }) => (
      <StyledKey>{cell.value ? `${cell.value}:` : cell.value}</StyledKey>
    )
  },
  {
    Header: () => null,
    id: 'value',
    accessor: 'value',
    Cell: ({ cell }) => <StyledValue>{cell.value}</StyledValue>
  }
]

export function UserDetails ({ user }) {
  const data = useMemo(() => createUserRows(user), [user.username])

  if (!arrayHasItems(data)) return null

  return (
    <DrawerSection className='user-details'>
      <DrawerSubHeader>Connected as</DrawerSubHeader>
      <DrawerSectionBody>
        <RelatableHeadless columns={COLUMNS} data={data} />
      </DrawerSectionBody>
    </DrawerSection>
  )
}

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

function createUserRows (userDetails) {
  if (!userDetails.username) return []

  const mappedRoles =
    userDetails.roles.length > 0 ? userDetails.roles.join(', ') : '-'
  const hasAdminRole = userDetails.roles
    .map(role => role.toLowerCase())
    .includes('admin')

  const data = [
    { key: 'Username', value: userDetails.username },
    { key: 'Roles', value: mappedRoles }
  ]

  if (!hasAdminRole) return data

  return [
    ...data,
    { key: 'Admin', value: <DispatchLink>:server user list</DispatchLink> },
    { key: '', value: <DispatchLink>:server user add</DispatchLink> }
  ]
}
