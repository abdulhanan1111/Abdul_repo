import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ total, page, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn ${page === i ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px' }}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
      <button
        className="btn btn-secondary"
        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px' }}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={20} />
      </button>
      
      {renderPageNumbers()}

      <button
        className="btn btn-secondary"
        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px' }}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={20} />
      </button>
      
      <span style={{ marginLeft: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Total: {total} items
      </span>
    </div>
  );
};

export default Pagination;
