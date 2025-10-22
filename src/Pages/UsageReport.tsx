
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { backendRequest } from "../Helpers/backendRequest"
import { BiExport } from "react-icons/bi"
import * as XLSX from "xlsx"
import { PageNumbers } from "../Components/PageNumbers"
import { Loading } from "../Components/Loading"
import { FaEye, FaSearch, FaFilter, FaChevronDown } from "react-icons/fa"
import { FormateTime } from "../Helpers/formateTime"
import { formatDuration } from "../Helpers/formatDuration"
import { Dialog } from "@headlessui/react"
import LeadModal from "../Components/LeadModal"
import { TbTrash } from "react-icons/tb"
import AudioPlayer from "react-modern-audio-player"
import ConfirmationModal from "../Components/ConfirmationModal"
import { notifyResponse } from "../Helpers/notyf"
import { IoIosCheckboxOutline } from "react-icons/io"
import { formatCallEndedReason } from "../Helpers/formateCallEndReason"

interface Lead {
  id: number
  first_name: string
  last_name: string
  email: string
  salesforce_id: string
  add_date: string
  mobile: string
  other_data?: string[]
  file_id: number
}

interface CallLog extends Record<string, unknown> {
  id?: number
  customer_number?: string
  call_started_at?: string
  customer_name?: string
  call_ended_at?: string
  cost?: number
  call_duration?: number
  call_ended_reason?: string
  status?: string
  transcript?: string
  recording_url?: string
  call_id?: string
  lead_id?: number
  criteria_satisfied?: boolean
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

const UsageReport: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"transcript" | "audio" | "overview">("overview")
  const [selectedLogDetails, setSelectedLogDetails] = useState<CallLog | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [dispositionFilter, setDispositionFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState<boolean>(false)
  const [phoneNumberDetails, setPhoneNumberDetails] = useState<CallLog[] | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false)

  const customFilterAndPaginate = (
    items: CallLog[],
    searchTerm: string,
    disposition: string,
    page: number,
    itemsPerPage = 10,
    maxPageNumbers = 7,
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
  } = useMemo(
    () => customFilterAndPaginate(callLogs, search, dispositionFilter, currentPage, itemsPerPage),
    [callLogs, search, dispositionFilter, currentPage, itemsPerPage],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, dispositionFilter, itemsPerPage])

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const logs = await backendRequest<CallLog[], []>("GET", "/user/call-logs-detail")
        if (Array.isArray(logs)) {
          const sortedLogs = logs.sort((a, b) => {
            const dateA = new Date(a.call_started_at)
            const dateB = new Date(b.call_started_at)
            return dateB.getTime() - dateA.getTime()
          })
          setCallLogs(sortedLogs)
          // console.log(callLogs)
        } else {
          console.error("Expected an array but got:", logs)
          setCallLogs([])
        }
      } catch (error) {
        console.error("Failed to fetch call logs:", error)
      }
    }

    fetchCallLogs()
  }, [])

  const handleDeleteLog = async () => {
    if (selectedLogId !== null) {
      try {
        const response = await backendRequest("DELETE", `/call_log/${selectedLogId}`)
        setCallLogs((prevLogs) => prevLogs.filter((log) => log.call_id !== selectedLogId))
        notifyResponse(response)
      } catch (error) {
        console.error("Failed to delete call log:", error)
      } finally {
        setShowDeleteModal(false)
      }
    }
  }

  const handleShowDetailsModal = async (id: string) => {
    setLoading(true)
    setSelectedLogId(id)
    setActiveTab("overview")
    try {
      const callDetails = await backendRequest<CallLog, null>("GET", `/call/${id}`)
      setSelectedLogDetails(callDetails)
      setShowDetailsModal(true)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch call details:", error)
    }
  }

  const handleShowDeleteModal = (id: string) => {
    setSelectedLogId(id)
    setShowDeleteModal(true)
  }

  const handleCloseLeadModal = () => {
    setShowLeadModal(false)
    setSelectedLead(null)
  }

  const exportToExcel = () => {
    const data = callLogs.map((log) => ({
      "Call ID": log.call_id,
      "Customer Number": log.customer_number,
      "Customer Name": log.customer_name,
      "Call Started At": log.call_started_at && FormateTime(log.call_started_at),
      "Call Ended At": log.call_ended_at && FormateTime(log.call_ended_at),
      Disposition: log.call_ended_reason ? formatCallEndedReason(log.call_ended_reason) : "N/A",
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Call Logs")
    XLSX.writeFile(wb, "CallLogs.xlsx")
  }

  const handlePhoneNumberDetail = async (num: string) => {
    setLoading(true)
    try {
      const details = await backendRequest<CallLog[], []>("GET", `/specific-number-call-logs/${num}`)
      setPhoneNumberDetails(details)
      setShowPhoneNumberModal(true)
    } catch (error) {
      console.error("Error fetching phone number details:", error)
    } finally {
      setLoading(false)
    }
  }

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.round(time % 60);
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${formattedMinutes}:${formattedSeconds}`;
};


  const selectedOption = dispositionOptions.find((option) => option.value === dispositionFilter)
  const selectedRowsOption = rowsPerPageOptions.find((option) => option.value === itemsPerPage)

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex items-center justify-center">
          <Loading />
        </div>
      )}
      <div className="bg-white text-gray-900 p-4 md:p-8">
        <h1 className="text-xl md:text-3xl font-bold mb-4">Usage Report </h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
            {/* Search Input */}
            <div className="relative flex items-center w-full sm:flex-1 sm:max-w-xs">
              <FaSearch className="absolute left-3 text-sm sm:text-base text-gray-500" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by name and phone no"
                className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-primary outline-none"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative flex items-center w-full sm:flex-1 sm:max-w-xs">
              <div className="relative w-full">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none text-sm" />
                <div
                  className="relative w-full pl-10 pr-10 py-2 text-xs sm:text-sm rounded-lg border border-primary outline-none bg-white cursor-pointer hover:border-primary/70 transition-colors shadow-sm"
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
                          className={`px-3 py-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors ${dispositionFilter === option.value
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
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
            {/* Rows per page selector */}
            <div className="relative flex items-center w-full sm:w-auto sm:min-w-[120px]">
              <div className="relative w-full">
                <div
                  className="relative w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-primary outline-none bg-white cursor-pointer hover:border-primary/70 transition-colors shadow-sm"
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
                          className={`px-3 py-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-50 transition-colors ${itemsPerPage === option.value ? "bg-primary/5 text-primary font-medium" : "text-gray-700"
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

            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto border border-primary text-primary hover:text-black hover:border-black font-medium px-3 py-2 rounded-lg transition duration-300 ease-in-out group"
            >
              Export
              <BiExport className="text-inherit transform transition duration-100 ease group-hover:rotate-[90deg]" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-8">
          <table className="w-full table-auto rounded-lg">
            <thead>
              <tr className="text-left text-sm md:text-md bg-gray-50 border-b-2">
                <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">#</th>
                <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6 ">First Name</th>
                <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6 ">Last Name</th>
                <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">Phone Number</th>
                <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">Date</th>
                <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">Duration</th>
                <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">Disposition</th>
                <th className="py-3 px-2 md:px-6 text-end"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCallLogs.length > 0 ? (
                filteredCallLogs.map((log, index) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6 ">
                      {log.customer_name?.split(" ")[0] || "N/A"}
                    </td>
                    <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6 ">
                      {log.customer_name?.split(" ")[1] || "N/A"}
                    </td>
                    <td
                      className="py-1.5 sm:py-3 text-xs flex items-center gap-2 sm:text-base px-2 md:px-6 underline hover:no-underline hover:text-primary cursor-pointer"
                      onClick={() => log.customer_number && handlePhoneNumberDetail(log.customer_number)}
                    >
                      {log.customer_number}{" "}
                      {log.criteria_satisfied && (
                        <span className="text-base font-bold">
                          <IoIosCheckboxOutline />
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6 whitespace-nowrap">
                      {log.call_started_at ? FormateTime(log.call_started_at) : "--"}
                    </td>
                    <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6">
                      {log.call_duration ? formatTime(log?.call_duration) : "-- -- --"}
                    </td>
                    <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6 whitespace-nowrap">
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
                        {log.call_ended_reason ? formatCallEndedReason(log.call_ended_reason) : "N/A"}
                      </span>
                    </td>
                    <td className="py-1.5 sm:py-3 px-2 md:px-6 text-end">
                      <button
                        className="hover:underline ml-4"
                        onClick={() => log.call_id && handleShowDetailsModal(log?.call_id)}
                        aria-label="View Call Log"
                      >
                        <FaEye className="inline-block sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="text-red-500 hover:underline ml-4"
                        onClick={() => log.call_id && handleShowDeleteModal(log.call_id)}
                        aria-label="Delete Call Log"
                      >
                        <TbTrash className="inline-block sm:w-5 sm:h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
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

        <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="relative z-50">
          <div className="fixed w-full inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true"></div>
          <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
            <Dialog.Panel
              className="bg-white rounded-lg shadow-lg p-2 md:p-8 w-full max-w-3xl max-h-[95vh] overflow-y-auto"
              style={{
                overflowY: "scroll",
                scrollbarWidth: "thin",
                msOverflowStyle: "none",
              }}
            >
              <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Call Details</Dialog.Title>
              <div className="flex mb-6">
                <button
                  className={` px-2 py-1 sm:px-4 md:px-6 sm:py-2 text-base sm:text-lg font-medium sm:font-semibold transition-all duration-200 ${activeTab === "overview"
                      ? "text-white bg-primary rounded-md "
                      : "text-gray-600 hover:bg-gray-200 rounded-md "
                    }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`px-2 sm:px-4 py-1 md:px-8 sm:py-2 text-base sm:text-lg font-medium sm:font-semibold transition-all duration-200 ${activeTab === "transcript"
                      ? "text-white bg-primary rounded-md "
                      : "text-gray-600 hover:bg-gray-200  rounded-md"
                    }`}
                  onClick={() => setActiveTab("transcript")}
                >
                  Transcript
                </button>
                <button
                  className={`px-2 sm:px-4 py-1 md:px-6 sm:py-2 text-base sm:text-lg font-medium sm:font-semibold transition-all duration-200 ${activeTab === "audio"
                      ? "text-white bg-primary rounded-md"
                      : "text-gray-600 hover:bg-gray-200 rounded-md "
                    }`}
                  onClick={() => setActiveTab("audio")}
                >
                  Audio Recording
                </button>
              </div>
              {activeTab === "overview" && selectedLogDetails && (
                <div className="bg-white p-2 sm:p-4 md:8 rounded-lg">
                  <div className="mb-4 leading-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-primary mb-4">Call Overview</h3>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                        <span className="text-base sm:text-lg font-semibold text-gray-700">Status:</span>
                        <span
                          className={`text-xs sm:text-lg font-semibold ${selectedLogDetails.status === "Completed" ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {selectedLogDetails.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                        <span className="text-xs sm:text-lg font-semibold text-gray-700">End Reason:</span>
                        <span className="text-xs sm:text-lg text-gray-800">
                          {(typeof selectedLogDetails.ended_reason === "string" && selectedLogDetails.ended_reason) ||
                            "00-00-00"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                        <span className="text-xs sm:text-lg font-semibold text-gray-700">Duration:</span>
                        <span className="text-xs sm:text-lg text-gray-800">
                          {selectedLogDetails.call_duration && formatDuration(selectedLogDetails.call_duration)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                        <span className="text-xs sm:text-lg font-semibold text-gray-700">Call Started At:</span>
                        <span className="text-xs sm:text-lg text-gray-800">
                          {selectedLogDetails.call_started_at && FormateTime(selectedLogDetails.call_started_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                        <span className="text-xs sm:text-lg font-semibold text-gray-700">Call Ended At:</span>
                        <span className="text-xs sm:text-lg text-gray-800">
                          {selectedLogDetails.call_ended_at && FormateTime(selectedLogDetails.call_ended_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md shadow-sm">
                        <span className="text-xs sm:text-lg font-semibold text-gray-700">Criteria Satisfied</span>
                        <span className="text-xs sm:text-lg text-gray-800">
                          {selectedLogDetails?.successEvalution === "true" ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md shadow-sm">
                        <span className="text-xs sm:text-lg font-semibold text-gray-700">Transferd Call</span>
                        <span className="text-xs sm:text-lg text-gray-800">
                          {selectedLogDetails?.ended_reason === "assistant-forwarded-call" ? "Yes" : "NO"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "audio" && selectedLogDetails?.recording_url && (
                <div className="mt-4">
                  <AudioPlayer
                    playList={[
                      {
                        id: 1,
                        name: "Call Audio",
                        src: selectedLogDetails.recording_url,
                      },
                    ]}
                    activeUI={{
                      all: true,
                      progress: "waveform",
                    }}
                  />
                </div>
              )}
              {activeTab === "transcript" && selectedLogDetails?.transcript && (
                <div className="text-gray-700 text-base leading-relaxed bg-gray-50 p-1 rounded-lg shadow-inner">
                  <div className="max-h-72 overflow-y-auto">
                    {selectedLogDetails.transcript.split("\n").map((line, index) => {
                      const isAI = line.startsWith("AI:")
                      const isUser = line.startsWith("User:")
                      const speaker = isAI ? "AI" : isUser ? "User" : null
                      return (
                        <div
                          key={index}
                          className={`border border-gray-300 px-2 sm:px-5 py-2 rounded-md mb-2 mx-2 ${isAI ? "bg-blue-100" : isUser ? "bg-gray-100" : "bg-gray-200"
                            }`}
                        >
                          <strong className={isAI ? "text-primary" : isUser ? "text-gray-800" : "text-gray-600"}>
                            {speaker}
                          </strong>
                          <p>{line.replace(`${speaker}: `, "")}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className="mt-8 flex justify-end">
                <button
                  className="px-4 sm:px-6 py-1 sm:py-3 bg-primary text-white text-base sm:text-lg font-medium rounded-lg hover:bg-primary transition-all duration-200"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {showPhoneNumberModal && phoneNumberDetails && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Phone Number Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto rounded-lg">
                  <thead>
                    <tr className="text-left text-sm bg-gray-100 border-b">
                      <th className="py-2 px-4">#</th>
                      <th className="py-2 px-4">Call Started At</th>
                      <th className="py-2 px-4">Duration</th>
                      <th className="py-2 px-4">Cost</th>
                      <th className="py-2 px-4">Disposition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phoneNumberDetails.map((detail, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4 text-sm">{index + 1}</td>
                        <td className="py-2 px-4 text-sm">
                          {detail.call_started_at && FormateTime(detail.call_started_at)}
                        </td>
                        <td className="py-2 px-4 text-sm">
                          {(detail.call_duration && formatDuration(detail.call_duration)) || "N/A"}
                        </td>
                        <td className="py-2 px-4 text-sm">{detail.cost || "N/A"}</td>
                        <td className="py-2 px-4 text-sm">{detail.call_ended_reason || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowPhoneNumberModal(false)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-hoverPrimary transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <LeadModal lead={selectedLead} isOpen={showLeadModal} onClose={handleCloseLeadModal} />

        <PageNumbers
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagesCount={pagesCount}
        />

        <ConfirmationModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteLog}
          message="Are you sure you want to delete this call log? This action cannot be undone."
        />
      </div>
    </div>
  )
}

export default UsageReport
