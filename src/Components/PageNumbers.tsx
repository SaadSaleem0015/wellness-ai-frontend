import { TbChevronLeft, TbChevronRight, TbChevronsLeft, TbChevronsRight } from "react-icons/tb";

export interface PageNumbersProps {
    currentPage: number,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    setCurrentPage: Function,
    pageNumbers: number[],
    pagesCount: number,
    className?: string
}

export function PageNumbers({ currentPage, pageNumbers, setCurrentPage, pagesCount, className = "" }: PageNumbersProps) {
    return (
        <div className={"text-center pt-4 " + className}>
            <button
                className="rounded p-2"
                onClick={() => setCurrentPage(1)}>
                <TbChevronsLeft />
            </button>
            <button
                className="rounded p-2"
                onClick={() => setCurrentPage(currentPage === 1 ? currentPage : currentPage - 1)}>
                <TbChevronLeft />
            </button>
            {pageNumbers.map((pageNumber,index) =>
                <button
                key={index}
                    className={`${pageNumber === currentPage ? "bg-primary text-white " : ""} rounded min-w-10 h-9 inline-flex items-center justify-center`}
                    onClick={() => setCurrentPage(pageNumber)}>
                    {pageNumber}
                </button>
            )}
            <button
                className="rounded p-2"
                onClick={() => setCurrentPage(currentPage === pagesCount ? currentPage : currentPage + 1)}>
                <TbChevronRight />
            </button>
            <button
                className="rounded p-2"
                onClick={() => setCurrentPage(pagesCount)}>
                <TbChevronsRight />
            </button>
        </div>
    );
}