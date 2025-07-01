import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@tremor/react";
import { TrashIcon, PencilIcon, SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/24/outline';
import TableCellButtonIcon from './TableCellButtonIcon';
import CustomCheckbox from './CustomCheckbox';

const CoreTable = ({
  data,
  columns,
  filterText,
  selectedFilter,
  itemsPerPage,
  pageNumber,
  renderCell,
  openForm,
  removeItem,
  onFiltered,
  key
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [sortedColumn, setSortedColumn] = useState('id');
  const [sortAscending, setSortAscending] = useState(false);
  const [itemsSelected, setItemsSelected] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);

  const filteredData = data.filter((item) => {
    const textToSearch = Object.values(item)
      .flatMap((value) => {
        if (typeof value === 'object') {
          return Object.values(value);
        } else {
          return [value];
        }
      })
      .join(' ')
      .toLowerCase();

    return textToSearch.includes(filterText.toLowerCase());
  });


  const filteredDataWithColumnFilter = selectedFilter
    ? filteredData.filter((item) => {
      const filterParts = selectedFilter.split('.');
      let value = item;
      if (filterParts[1] == "*") {
        let objectArray = item[filterParts[0]];
        value = objectArray.map(obj => obj.name).join(' ');
      } else for (const part of filterParts) {
        if (value && value.hasOwnProperty(part)) {
          value = value[part];
        } else {
          value = null;
          break;
        }
      }

      return value && (value + '').toLowerCase().includes(filterText.toLowerCase());
    })
    : filteredData;

  const extractNestedValue = (item, columnKey) => {
    const keys = columnKey.split('.');
    let value = item;
    for (const key of keys) {
      value = value[key];
      if (value === undefined || value === null) {
        break;
      }
    }
    return value;
  };

  const sortedData = sortedColumn
  ? [...filteredDataWithColumnFilter].sort((a, b) => {
      // Extract the values for comparison
      const aValue = extractNestedValue(a, sortedColumn);
      const bValue = extractNestedValue(b, sortedColumn);
      // Check if the values are numbers (for 'id' or similar numeric columns)
      const isNumeric = !isNaN(aValue) && !isNaN(bValue);
      if (isNumeric) {
        // Perform numeric sort
        return sortAscending ? aValue - bValue : bValue - aValue;
      } else {
        // Perform string sort
        if (sortAscending) {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
    })
  : filteredDataWithColumnFilter;

  const handleDataFiltering = () => {
    // Update the currentItems state when the pagination or filtered data changes
    const start = (pageNumber - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setCurrentItems(sortedData.slice(start, end));
    // Deselect all when pagination or filters change
    //setItemsSelected([]);
    //setSelectAll(false);
    onFiltered(filteredDataWithColumnFilter.length)
  }

  useEffect(handleDataFiltering, [pageNumber, sortedColumn, sortAscending, filterText, selectedFilter, key]);

  const handleSortColumn = (column) => {
    if (column === sortedColumn) {
      // Toggle sort order
      setSortAscending(!sortAscending);
    } else {
      // Sort by the selected column in ascending order by default
      setSortedColumn(column);
      setSortAscending(true);
    }
  };

  const handleSelect = (item, newCheckedState) => {
    const selectedIndex = itemsSelected.indexOf(item);
    const newSelected = [...itemsSelected];

    if (newCheckedState) {
      if (selectedIndex === -1) {
        newSelected.push(item);
      }
    }
    else {
      if (selectedIndex != -1) {
        newSelected.splice(selectedIndex, 1);
      }
    }

    setItemsSelected(newSelected);
  };

  const handleSelectAll = (newCheckedState) => {
    setSelectAll(newCheckedState);
  };
  useEffect(() => {
    if (selectAll) {
      // Select all items on the current page
      setItemsSelected([...currentItems]);
    } else {
      // Deselect all items on the current page
      setItemsSelected([]);
    }
  }, [selectAll]);

  return (
    <Table>
      <TableHead className="bg-slate-50">
        <TableRow>
          {false && <TableHeaderCell
            style={{ "width": "50px" }}
          >
            <CustomCheckbox
              checked={selectAll}
              onChange={handleSelectAll}
            />
          </TableHeaderCell>}
          {columns.map((column) => (column.key ?
            <TableHeaderCell
              key={column.key}
              onClick={() => handleSortColumn(column.key)}
              style={{ "width": column.width }}
            >
              <div className="flex">
                <span style={{ "cursor": "pointer" }}>{column.title}</span>
                {sortedColumn === column.key && (
                  <span className="ml-2 mt-1">
                    {sortAscending ? (
                      <SortAscendingIcon className="w-4 h-4" />
                    ) : (
                      <SortDescendingIcon className="w-4 h-4" />
                    )}
                  </span>
                )}
              </div>
            </TableHeaderCell> : <></>
          ))}
          <TableHeaderCell></TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {currentItems.map((item) => (
          <TableRow key={item.id}>
            {false && <TableCell>
              <CustomCheckbox
                checked={selectAll || itemsSelected.includes(item)}
                onChange={(newCheckedState) => handleSelect(item, newCheckedState)}
              />
            </TableCell>}
            {columns.map((column) => column.key ? (
              <TableCell key={column.key}>{renderCell(column.key, item)}</TableCell>
            ) : null)}
            <TableCell>
              <TableCellButtonIcon onClick={() => removeItem(item)} text={"Remover"} icon={<TrashIcon className="w-6 h-6" />} />
              <TableCellButtonIcon onClick={() => openForm(item)} text={"Editar"} icon={<PencilIcon className="w-6 h-6" />} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CoreTable;
