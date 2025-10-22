
import { useEffect, useMemo, useState } from "react"
import { FaSearch, FaFilter, FaChevronDown } from "react-icons/fa"
import { backendRequest } from "../../Helpers/backendRequest"
import { formatDuration } from "../../Helpers/formatDuration"
import { PageNumbers } from "../PageNumbers"
import { FormateTime } from "../../Helpers/formateTime"
import { Loading } from "../Loading"

interface CallLog {
  id: number
  customer_name: string
  customer_number: string
  call_started_at: string
  call_ended_at: string
  call_duration: number
  call_ended_reason: string
}

const dispositionOptions = [
  { value: "", label: "All Dispositions" },
  { value: "customer-ended-call", label: "Customer Ended Call" },
  { value: "silence-timed-out", label: "Silence Timed Out" },
  { value: "customer-did-not-answer", label: "Customer Did Not Answer" },
  { value: "twilio-failed-to-connect-call", label: "Failed to Connect" },
  { value: "assistant-forwarded-call", label: "Forwarded Call" },
]

const rowsPerPageOptions = [
  { value: 10, label: "10 rows" },
  { value: 25, label: "25 rows" },
  { value: 50, label: "50 rows" },
  { value: 100, label: "100 rows" },
]

const formatDisposition = (disposition: string) => {
  const option = dispositionOptions.find((opt) => opt.value === disposition)
  return option ? option.label : disposition || "N/A"
}

const CallLogsPage = ({ id }: { id: string }) => {
  const companyId = id
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [company_name, setCompanyName] = useState<string>("")
  const [search, setSearch] = useState("")
  const [dispositionFilter, setDispositionFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    try {
      const fetchCallLogs = async () => {
        const response = await backendRequest<CallLog[], []>("GET", `/company/${companyId}/call-logs`)
        setCallLogs(response.call_logs)
        setCompanyName(response.company_name)
      }
      fetchCallLogs()
    } catch (error) {
      console.log(error)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  const customFilterAndPaginate = (
    items: CallLog[],
    searchTerm: string,
    disposition: string,
    page: number,
    itemsPerPage: number,
    maxPageNumbers: number,
  ) => {
    let filteredItems = items.filter((item) => {
      const searchableText = `${item.customer_name || ""} ${item.customer_number || ""}`.toLowerCase()
      return searchableText.includes(searchTerm.toLowerCase())
    })

    if (disposition) {
      filteredItems = filteredItems.filter((item) => item.call_ended_reason === disposition)
    }

    const totalItems = filteredItems.length
    const pagesCount = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = filteredItems.slice(startIndex, endIndex)

    const halfMaxPageNumbers = Math.floor(maxPageNumbers / 2)
    let startPage = Math.max(1, page - halfMaxPageNumbers)
    const endPage = Math.min(pagesCount, startPage + maxPageNumbers - 1)

    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1)
    }

    const pageNumbers = []
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return {
      filteredItems: paginatedItems,
      pagesCount,
      pageNumbers,
    }
  }

  const {
    filteredItems: filteredCallLogs,
    pagesCount,
    pageNumbers,
  } = useMemo(() => {
    return customFilterAndPaginate(callLogs, search, dispositionFilter, currentPage, itemsPerPage, 7)
  }, [callLogs, search, dispositionFilter, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, dispositionFilter, itemsPerPage])

  const selectedOption = dispositionOptions.find((option) => option.value === dispositionFilter)
  const selectedRowsOption = rowsPerPageOptions.find((option) => option.value === itemsPerPage)

  return (
    <div className="">
      <div className="flex flex-col lg:justify-between lg:items-start gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-md font-medium sm:text-2xl sm:font-bold">
            Call logs of <span className="text-primary">{company_name}</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 lg:flex-shrink-0">
          <div className="relative flex items-center w-full md:w-64">
            <FaSearch className="absolute left-3 text-sm text-gray-500" />
            <input
              type="text"
              placeholder="Search CallLog..."
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              id="search"
              aria-label="Search call logs"
              className="bg-gray-50 border text-sm border-gray-400 text-gray-900 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none block w-full pl-10 pr-3 py-2.5"
            />
          </div>

          <div className="relative flex items-center w-full md:w-56">
            <div className="relative w-full">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none text-sm" />
              <div
                className="relative w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-gray-400 outline-none bg-gray-50 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="block truncate">{selectedOption?.label || "Select disposition..."}</span>
                <FaChevronDown
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform duration-200 text-sm ${isOpen ? "rotate-180" : ""
                    }`}
                />
              </div>
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-auto"
                    style={{
                      overflowY: "scroll",
                      scrollbarWidth: "thin",
                      msOverflowStyle: "none",
                    }}
                  >
                    {dispositionOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${dispositionFilter === option.value
                            ? "bg-primary/5 text-primary font-medium"
                            : "text-gray-700"
                          }`}
                        onClick={() => {
                          setDispositionFilter(option.value)
                          setIsOpen(false)
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative flex items-center w-full md:w-32">
            <div className="relative w-full">
              <div
                className="relative w-full px-3 py-2.5 text-sm rounded-lg border border-gray-400 outline-none bg-gray-50 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
              >
                <span className="block truncate">{selectedRowsOption?.label || "10 rows"}</span>
                <FaChevronDown
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform duration-200 text-sm ${isRowsDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </div>
              {isRowsDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsRowsDropdownOpen(false)} />
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-auto"
                    style={{
                      overflowY: "scroll",
                      scrollbarWidth: "thin",
                      msOverflowStyle: "none",
                    }}
                  >
                    {rowsPerPageOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${itemsPerPage === option.value ? "bg-primary/5 text-primary font-medium" : "text-gray-700"
                          }`}
                        onClick={() => {
                          setItemsPerPage(option.value)
                          setIsRowsDropdownOpen(false)
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-8 bg-white rounded-lg shadow">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm md:text-md bg-gray-100 border-b-2">
              <th className="py-3 px-2 md:px-4 lg:px-6">#</th>
              <th className="py-3 px-2 md:px-4 lg:px-6 min-w-[120px]">Customer Name</th>
              <th className="py-3 px-2 md:px-4 lg:px-6 min-w-[140px]">Customer Number</th>
              <th className="py-3 px-2 md:px-4 lg:px-6 min-w-[120px]">Call Started</th>
              <th className="py-3 px-2 md:px-4 lg:px-6 min-w-[100px]">Duration</th>
              <th className="py-3 px-2 md:px-4 lg:px-6 min-w-[140px]">Disposition</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <Loading />
                    <p className="mt-2">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : filteredCallLogs.length > 0 ? (
              filteredCallLogs.map((log, index) => (
                <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 md:px-4 lg:px-6 text-sm md:text-base">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-3 px-2 md:px-4 lg:px-6 text-sm md:text-base">{log.customer_name || "N/A"}</td>
                  <td className="py-3 px-2 md:px-4 lg:px-6 text-sm md:text-base">{log.customer_number || "N/A"}</td>
                  <td className="py-3 px-2 md:px-4 lg:px-6 text-sm md:text-base">{FormateTime(log.call_started_at)}</td>
                  <td className="py-3 px-2 md:px-4 lg:px-6 text-sm md:text-base">
                    {formatDuration(log.call_duration)}
                  </td>
                  <td className="py-3 px-2 md:px-4 lg:px-6 text-sm md:text-base whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${log.call_ended_reason === "customer-ended-call"
                          ? "bg-green-100 text-green-800"
                          : log.call_ended_reason === "customer-did-not-answer"
                            ? "bg-yellow-100 text-yellow-800"
                            : log.call_ended_reason === "silence-timed-out"
                              ? "bg-orange-100 text-orange-800"
                              : log.call_ended_reason === "twilio-failed-to-connect-call"
                                ? "bg-red-100 text-red-800"
                                : log.call_ended_reason === "assistant-forwarded-call"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {formatDisposition(log.call_ended_reason)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <p>No call logs found</p>
                    {(search || dispositionFilter) && (
                      <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredCallLogs.length > 0 && (
        <PageNumbers
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagesCount={pagesCount}
        />
      )}
    </div>
  )
}

export default CallLogsPage
