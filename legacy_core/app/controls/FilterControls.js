import React from 'react';
import { Select, SelectItem } from "@tremor/react";
import { FilterIcon } from '@heroicons/react/24/outline';
import TextInputWithIcon from './TextInputWithIcon';

const FilterControls = ({
  selectedFilter,
  setSelectedFilter,
  filterText,
  setFilterText,
  columns
}) => (
  <div className="flex items-center">
    <div className="max-w-sm mx-auto space-y-6">
      <Select placeholder="Filtrar" style={{ width: '15vw' }} value={selectedFilter} onValueChange={setSelectedFilter}>
        <SelectItem value="" icon={FilterIcon}>
          All Columns
        </SelectItem>
        <SelectItem value="id" icon={FilterIcon}>
          ID
        </SelectItem>
        {
          columns?.map(column => (column.isFilterColumn ?
            <SelectItem value={column.value} icon={FilterIcon}>
              {column.title}
            </SelectItem> : null
          ))
        }
      </Select>
    </div>
    <TextInputWithIcon
      value={filterText}
      onChange={(e) => setFilterText(e)}
    />
  </div>
);

export default FilterControls;
