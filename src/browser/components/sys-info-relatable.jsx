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
  margin: 0 15px 20px 15px;

  .relatable .relatable__table {
    border-radius: 4px;
    border: 1px solid #ddd;
    -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
    border-collapse: collapse;
  }

  .relatable .relatable__table-cell {
    border-bottom: 1px solid #ddd !important;
    border-top: 0;
    background-color: ${props => props.theme.secondaryBackground};
    color: ${props => props.theme.secondaryText};
  }

  .relatable .relatable__table-header-cell {
    color: ${props => props.theme.secondaryText};
    position: static;
    font-size: 18px;
    -webkit-column-span: all;
    column-span: all;
    text-align: left;
    background-color: ${props => props.theme.secondaryBackground};
    border-color: #ddd;
    padding: 10px 15px;
  }

  .relatable .relatable__table-header-actions-cell,
  .relatable .relatable__table-row-actions-cell {
    display: none;
  }

  .relatable .relatable__table-body-cell:nth-of-type(2) {
    font-weight: bold;
  }
`

export default function SysInfoRelatable ({ columns, data }) {
  return (
    <StyleWrapper>
      <Relatable columns={columns} data={data} />
    </StyleWrapper>
  )
}
