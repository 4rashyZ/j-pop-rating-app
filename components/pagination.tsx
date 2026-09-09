type PaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalItems, pageSize, itemLabel, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return <nav className="pagination" aria-label={`${itemLabel} pages`}>
    <p>Showing {start}–{end} of {totalItems} {itemLabel}</p>
    <div>
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
      {pages.map((page) => <button type="button" className={page === currentPage ? "active" : ""} aria-current={page === currentPage ? "page" : undefined} onClick={() => onPageChange(page)} key={page}>{page}</button>)}
      <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
    </div>
  </nav>;
}
