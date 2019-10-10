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

import React from 'react'
import Relatable from '@relate-by-ui/relatable'
import styled from 'styled-components'

const StyleWrapper = styled.div`
  .relatable__table {
    color: inherit;
  }
  .relatable__table-row-actions-cell {
    display: none;
  }

  .relatable .relatable__table,
  .relatable .relatable__table-row,
  .relatable .relatable__table-cell {
    border: 0;
  }
`

export default function RelatableHeadless ({ columns, data }) {
  return (
    <StyleWrapper>
      <Relatable basic compact headless columns={columns} data={data} />
    </StyleWrapper>
  )
}
