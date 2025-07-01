import React, { useEffect } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from "@tremor/react";

const Pagination = ({
  pageNumber,
  setPageNumber,
  totalPageCount,
}) => {
  useEffect(() => {
    // This code will run whenever pageNumber or totalPageCount changes
    // You can add any logic here if needed
  }, [pageNumber, totalPageCount]);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPageCount; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers.map((number) => (
      <button
        key={number}
        onClick={() => setPageNumber(number)}
        style={number === pageNumber ? {"backgroundColor":"#ECFDF3", "color": "#12B76A"} : {"backgroundColor":"white", "color": "#667085"}}
        className={`mx-1 rounded px-3 py-1 hover:font-bold`}
      >
        {number}
      </button>
    ));
  };

  return (
    <div className="flex justify-between border-t border-solid border-t-1 border-t-gray-300 p-3">
      <Button
        onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}
        disabled={totalPageCount+"" === "1" || (pageNumber === 1)}
        className="ml-2"
        variant="secondary"
        color='gray'
        cssClass='flex'
      >
        <div className="flex">
          <ArrowLeftIcon className="mr-3 w-6 h-6" />
          <span className='pt-0.5'>Anterior</span>
        </div>
      </Button>
      <div>
        {renderPageNumbers()}
      </div>
      <Button
        onClick={() => setPageNumber(Math.min(pageNumber + 1, totalPageCount))}
        disabled={totalPageCount+"" === "1" || (pageNumber === totalPageCount)}
        className="mr-2"
        variant="secondary"
        color='gray'
      >
        <div className="flex">
          <span className='pt-0.5'>Siguiente</span> 
          <ArrowRightIcon className="ml-3 w-6 h-6" />
        </div>
      </Button>
    </div>
  );
};

export default Pagination;
