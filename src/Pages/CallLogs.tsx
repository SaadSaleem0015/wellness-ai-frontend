import React, { useEffect, useMemo, useState } from "react";
import { FaEye, FaSearch } from "react-icons/fa";
import AudioPlayer from "react-modern-audio-player";
import { Dialog } from "@headlessui/react";
import ConfirmationModal from "../Components/ConfirmationModal";
import { backendRequest } from "../Helpers/backendRequest";
import { FormateTime } from "../Helpers/formateTime";
import { notifyResponse } from "../Helpers/notyf";
import { PageNumbers } from "../Components/PageNumbers";
import { formatDuration } from "../Helpers/formatDuration";
import LeadModal from "../Components/LeadModal";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import * as XLSX from 'xlsx';
import { BiExport } from "react-icons/bi";
import { Loading } from "../Components/Loading";

interface CallLog extends Record<string, unknown> {
  id: number;
  customer_number: string;
  call_started_at: string;
  customer_name: string;
  call_ended_at: string;
  cost: number;
  call_duration: number;
  call_ended_reason: string;
  status: string;
  transcript?: string;
  recording_url?: string;
  call_id: string;
  lead_id: number;
  criteria_satisfied: boolean
}

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  salesforce_id: string;
  add_date: string;
  mobile: string;
  other_data?: string[];
  file_id: number;
}

const CallLogs: React.FC = () => {


  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"transcript" | "audio" | "overview">("overview");
  const [selectedLogDetails, setSelectedLogDetails] = useState<CallLog | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("")
  const [ loading , setLoading] = useState(false)


  const { filteredItems: filteredCallLogs, pagesCount, pageNumbers } = useMemo(
    () => filterAndPaginate(callLogs, search, currentPage),
    [callLogs, search, currentPage]
  )
  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const logs = await backendRequest<CallLog[], []>("GET", "/user/call-logs-detail");
  
        if (Array.isArray(logs)) {
          const sortedLogs = logs.sort((a, b) => {
            const dateA = new Date(a.call_started_at);
            const dateB = new Date(b.call_started_at);
            return  dateB.getTime()- dateA.getTime(); 
          });
  
          setCallLogs(sortedLogs);
        } else {
          console.error("Expected an array but got:", logs);
          setCallLogs([]);
        }
      } catch (error) {
        console.error("Failed to fetch call logs:", error);
      }
    };
  
    fetchCallLogs();
  }, []);
  


  const handleDeleteLog = async () => {
    if (selectedLogId !== null) {
      try {
        const response = await backendRequest("DELETE", `/call_log/${selectedLogId}`);
        setCallLogs((prevLogs) =>
          prevLogs.filter((log) => log.call_id !== selectedLogId)
        );
        notifyResponse(response);
      } catch (error) {
        console.error("Failed to delete call log:", error);
      } finally {
        setShowDeleteModal(false);
      }
    }
  };

  const handleShowDetailsModal = async (id: string) => {
    setLoading(true);
    setSelectedLogId(id);
    setActiveTab("overview");

    try {
      const response = await backendRequest<CallLog | CallLog[], { success: false | undefined; detail: string | object }>("GET", `/call/${id}`);
      
      if (Array.isArray(response)) {
        setSelectedLogDetails(response[0] || null);
      } else if (response && typeof response === 'object' && 'id' in response) {
        setSelectedLogDetails(response as CallLog);
      } else {
        console.error("Invalid response format:", response);
        setSelectedLogDetails(null);
      }
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to fetch call details:", error);
      setSelectedLogDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadDetail = async (leadId: number) => {
    try {
      const response = await backendRequest<Lead | Lead[], { success: false | undefined; detail: string | object }>("GET", `/leads/${leadId}`);
      
      if (Array.isArray(response)) {
        setSelectedLead(response[0] || null);
      } else if (response && typeof response === 'object' && 'id' in response) {
        setSelectedLead(response as Lead);
      } else {
        console.error("Invalid response format:", response);
        setSelectedLead(null);
      }
      setShowLeadModal(true);
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
      setSelectedLead(null);
    }
  };

  const handleCloseLeadModal = () => {
    setShowLeadModal(false);
    setSelectedLead(null);
  };
  
  const exportToExcel = () => {
    const data = callLogs.map(log => ({
      "Call ID": log.call_id,
      "Customer Number": log.customer_number,
      "Customer Name": log.customer_name,
      "Call Started At": FormateTime(log.call_started_at),
      "Call Ended At": FormateTime(log.call_ended_at),

    }));
  
    const ws = XLSX.utils.json_to_sheet(data);
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Call Logs");
  
    XLSX.writeFile(wb, "CallLogs.xlsx");
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex items-center justify-center">
          <Loading />
        </div>
      )}
      
      <div className="bg-white text-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Call Logs</h1>
            <p className="text-gray-600 text-sm md:text-base">View and manage all your call records</p>
          </div>

          {/* Search and Actions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
              <div className="relative flex items-center w-full sm:w-auto">
                <FaSearch className="absolute left-4 text-lg text-gray-400" />
                <input
                  value={search}
                  onChange={e => {
                    setSearch(e.currentTarget.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name and phone number..."
                  className="w-full pl-12 pr-4 py-3 text-sm sm:text-base rounded-lg border border-primary focus:border-primary-dark focus:ring-2 focus:ring-primary focus:ring-opacity-20 outline-none transition-all duration-200 sm:w-80"
                />
              </div>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center border border-primary text-primary hover:bg-primary hover:text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 ease-in-out group shadow-sm hover:shadow-md"
              >
                <span>Export Call Logs</span>
                <BiExport className="text-lg transform transition-transform duration-300 ease-in-out group-hover:rotate-90" />
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact Number</th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Lead Name</th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Started At</th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost</th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                    <th className="py-4 px-4 md:px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Success Evaluation</th>
                    <th className="py-4 px-4 md:px-6 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCallLogs.length > 0 ? (
                    filteredCallLogs.map((log, index) => (
                      <tr 
                        key={log.id} 
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-4 md:px-6 text-sm text-gray-900 font-medium">
                          {(currentPage - 1) * 10 + index + 1}
                        </td>
                        <td className="py-4 px-4 md:px-6 text-sm text-gray-700">
                          {log.customer_number}
                        </td>
                        <td
                          className="py-4 px-4 md:px-6 text-sm text-primary hover:text-primary-dark cursor-pointer transition-colors duration-200 font-medium"
                          onClick={() => handleLeadDetail(log.lead_id)}
                        >
                          <span className="hover:underline">{log.customer_name || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-4 md:px-6 text-sm text-gray-700 whitespace-nowrap">
                          {FormateTime(log.call_started_at)}
                        </td>
                        <td className="py-4 px-4 md:px-6 text-sm text-gray-700 font-medium">
                          {log.cost ? `$${log.cost.toFixed(2)}` : <span className="text-gray-400">--</span>}
                        </td>
                        <td className="py-4 px-4 md:px-6 text-sm text-gray-700">
                          {formatDuration(log.call_duration)}
                        </td>
                        <td className="py-4 px-4 md:px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            log.criteria_satisfied === true 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {log.criteria_satisfied === true ? "Qualified" : "Unqualified"}
                          </span>
                        </td>
                        <td className="py-4 px-4 md:px-6 text-right">
                          <button
                            className="inline-flex items-center justify-center p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                            onClick={() => handleShowDetailsModal(log.call_id)}
                            aria-label="View Call Log"
                          >
                            <FaEye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-gray-400 text-5xl mb-4">📞</div>
                          <p className="text-lg font-medium text-gray-700 mb-2">No call logs found</p>
                          <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>



      <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true"></div>
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <Dialog.Panel className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-primary text-white px-6 py-4 rounded-t-2xl">
              <Dialog.Title className="text-2xl font-bold">Call Details</Dialog.Title>
              <p className="text-primary-100 text-sm mt-1">Detailed information about this call</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-6">
              <button
                className={`px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                  activeTab === "overview" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-600 hover:text-primary"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                  activeTab === "transcript" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-600 hover:text-primary"
                }`}
                onClick={() => setActiveTab("transcript")}
              >
                Transcript
              </button>
              <button
                className={`px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                  activeTab === "audio" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-600 hover:text-primary"
                }`}
                onClick={() => setActiveTab("audio")}
              >
                Audio Recording
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">

              {activeTab === "overview" && selectedLogDetails && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Call Overview</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedLogDetails.status === "Completed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {selectedLogDetails.status || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">End Reason</div>
                      <div className="text-base font-medium text-gray-900">
                        {selectedLogDetails.call_ended_reason || "N/A"}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Duration</div>
                      <div className="text-base font-medium text-gray-900">
                        {formatDuration(selectedLogDetails.call_duration)}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cost</div>
                      <div className="text-base font-medium text-gray-900">
                        {selectedLogDetails.cost ? `$${selectedLogDetails.cost.toFixed(2)}` : "N/A"}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Call Started At</div>
                      <div className="text-base font-medium text-gray-900">
                        {FormateTime(selectedLogDetails.call_started_at)}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Call Ended At</div>
                      <div className="text-base font-medium text-gray-900">
                        {FormateTime(selectedLogDetails.call_ended_at)}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Criteria Satisfied</div>
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedLogDetails.criteria_satisfied === true 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {selectedLogDetails.criteria_satisfied === true ? "Yes - Qualified" : "No - Unqualified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "audio" && selectedLogDetails?.recording_url && (
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Audio Recording</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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
                </div>
              )}

              {activeTab === "audio" && !selectedLogDetails?.recording_url && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">🎵</div>
                  <p className="text-gray-600">No audio recording available for this call</p>
                </div>
              )}

              {activeTab === "transcript" && selectedLogDetails?.transcript && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Call Transcript</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {selectedLogDetails.transcript.split("\n").map((line, index) => {
                        if (!line.trim()) return null;
                        const isAI = line.startsWith("AI:");
                        const isUser = line.startsWith("User:");
                        const speaker = isAI ? "AI" : isUser ? "User" : null;

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg ${
                              isAI 
                                ? "bg-primary bg-opacity-10 border-l-4 border-primary" 
                                : isUser 
                                ? "bg-gray-100 border-l-4 border-gray-400" 
                                : "bg-white border-l-4 border-gray-300"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`font-bold text-sm ${
                                isAI ? "text-primary" : isUser ? "text-gray-700" : "text-gray-600"
                              }`}>
                                {speaker || "System"}:
                              </span>
                              <p className="text-gray-800 flex-1">{line.replace(`${speaker}: `, "").trim()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transcript" && !selectedLogDetails?.transcript && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">📝</div>
                  <p className="text-gray-600">No transcript available for this call</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end rounded-b-2xl">
              <button
                className="px-6 py-3 bg-primary text-white text-base font-medium rounded-lg hover:bg-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 shadow-sm hover:shadow-md"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

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
  );
};

export default CallLogs;
