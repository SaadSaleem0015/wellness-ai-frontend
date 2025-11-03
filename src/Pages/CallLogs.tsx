import React, { ReactNode, useEffect, useMemo, useState } from "react";
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
  const [initialLoading, setInitialLoading] = useState(true)


  const { filteredItems: filteredCallLogs, pagesCount, pageNumbers } = useMemo(
    () => filterAndPaginate(callLogs, search, currentPage),
    [callLogs, search, currentPage]
  )
  useEffect(() => {
    const fetchCallLogs = async () => {
      setInitialLoading(true)
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
      } finally {
        setInitialLoading(false)
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

  const handleShowDetailsModal = async (id: number) => {
    setLoading(true)

    setSelectedLogId(id);
    setActiveTab("overview");

    try {
      const callDetails = await backendRequest<CallLog[]>("GET", `/call/${id}`);
      setSelectedLogDetails(callDetails);
      setShowDetailsModal(true);
    setLoading(false)

    } catch (error) {
      console.error("Failed to fetch call details:", error);
    }
  };



  const handleLeadDetail = async (leadId: number) => {
    try {
      const response = await backendRequest<Lead>("GET", `/leads/${leadId}`);
      setSelectedLead(response[0]);
      setShowLeadModal(true);
      
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
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

  // if (loading) return <Loading />;
  return (
    <div className="relative">

    {(loading || initialLoading) && (
      <div className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
          <Loading />
          <p className="mt-4 text-gray-600 text-sm">
            {initialLoading ? "Loading call logs..." : "Processing..."}
          </p>
        </div>
      </div>
    )}
    <div className="bg-white text-gray-900 p-4 md:p-8">
        <h1 className="text-xl md:text-3xl font-bold mb-4">Call Logs</h1>

      <div className="flex flex-col sm:flex-row justify-start sm:justify-between gap-10  items-center">
        <div className="flex gap-6">
        <div className="relative flex items-center w-full md:w-auto">
          <FaSearch className="absolute left-4 sm:text-lg text-gray-500" />
          <input
            value={search}
            onChange={e => {
              setSearch(e.currentTarget.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name and phone no"
            className="w-full pl-12 pr-4 py-3 sm:py-3.5 text-xs sm:text-base rounded-lg border border-primary outline-none  sm:w-auto"
          />
        </div>
        <button
  onClick={exportToExcel}
  className="flex items-center gap-2 text-xs sm:text-base  w-full border-b border-primary text-primary hover:text-black hover:border-black sm:w-auto font-medium px-4 py-2 rounded-md transition duration-300 ease-in-out group"
>
  Export Call Logs
  <BiExport className="text-inherit transform transition duration-100 ease group-hover:rotate-[90deg]" />
</button>

        </div>
       

      </div>

      <div className="overflow-x-auto mt-8">
        <table className="w-full table-auto rounded-lg">
          <thead>
            <tr className="text-left text-sm md:text-md bg-gray-50 border-b-2">
              <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">#</th>
              <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">Contact Number</th>
              <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6 ">Lead Name</th>
              <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">Started At</th>
              <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">Cost</th>
              <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">Duration</th>
              <th className="py-1.5 sm:py-3 px-1 sm:px-2 md:px-6">Success Evalution</th>


              <th className="py-3 px-2 md:px-6 text-end"></th>
            </tr>
          </thead>
          <tbody>
            {filteredCallLogs.length > 0 ? (
              filteredCallLogs.map((log, index) => (
                <tr key={log.id} className="border-b">
                  <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6">{index + 1}</td>
                  <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6">{log.customer_number}</td>
                  <td
                    className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6 underline hover:no-underline text-primary cursor-pointer "
                    onClick={() => handleLeadDetail(log.lead_id)}
                  >
                    {log.customer_name}
                  </td>
                  <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6">{FormateTime(log.call_started_at)}</td>
                  <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6">{log.cost ? `${log.cost}$` : '-- -- --'}</td>
                  <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6">{formatDuration(log.call_duration)}</td>
                  <td className="py-1.5 sm:py-3 text-xs sm:text-base px-2 md:px-6"> <span className={` font-medium text-gray-800 ${log?.criteria_satisfied == true ? "text-green-800" : "text-red-600"}`}>
                        {log?.criteria_satisfied == true ? "Qualified" : "Unqualified"}
                      </span></td>


                  <td className="py-1.5 sm:py-3 px-2 md:px-6 text-end">
                    <button
                      className="hover:underline ml-4"
                      onClick={() => handleShowDetailsModal(log?.call_id)}
                      aria-label="View Call Log"
                    >
                      <FaEye className="inline-block sm:w-4 sm:h-4" />
                    </button>
                    {/* <button
                      className="text-red-500 hover:underline ml-4"
                      onClick={() => handleShowDeleteModal(log.call_id)}
                      aria-label="Delete Call Log"
                    >
                      <TbTrash className="inline-block sm:w-5 sm:h-5" />
                    </button> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <p>No call logs found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>



      <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="relative z-50">
        <div className="fixed w-full inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true"></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">Call Details</Dialog.Title>

            <div className="flex mb-6">
              <button
                className={`px-6 py-2 text-lg font-semibold transition-all duration-200 ${activeTab === "overview" ? "text-white bg-primary rounded-md " : "text-gray-600 hover:bg-gray-200 rounded-md "
                  }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={` px-6 py-2 text-lg font-semibold transition-all duration-200 ${activeTab === "transcript" ? "text-white bg-primary rounded-md " : "text-gray-600 hover:bg-gray-200  rounded-md"
                  }`}
                onClick={() => setActiveTab("transcript")}
              >
                Transcript
              </button>
              <button
                className={` px-6 py-2 text-lg font-semibold transition-all duration-200 ${activeTab === "audio" ? "text-white bg-primary rounded-md" : "text-gray-600 hover:bg-gray-200 rounded-md "
                  }`}
                onClick={() => setActiveTab("audio")}
              >
                Audio Recording
              </button>
            </div>

            {activeTab === "overview" && selectedLogDetails && (
              <div className="bg-white p-6 rounded-lg">
                <div className="mb-4 leading-8">
                  <h3 className="text-2xl font-bold text-primary mb-4">Call Overview</h3>

                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                      <span className="text-lg font-semibold text-gray-700">Status:</span>
                      <span
                        className={`text-lg font-semibold ${selectedLogDetails.status === "Completed" ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {selectedLogDetails.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                      <span className="text-lg font-semibold text-gray-700">End Reason:</span>
                      <span className="text-lg text-gray-800">{(selectedLogDetails.ended_reason as ReactNode)|| "00-00-00"}</span>
                    </div>

                    <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                      <span className="text-lg font-semibold text-gray-700">Duration:</span>
                      <span className="text-lg text-gray-800">{formatDuration(selectedLogDetails.call_duration)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                      <span className="text-lg font-semibold text-gray-700">Call Started At:</span>
                      <span className="text-lg text-gray-800">{FormateTime(selectedLogDetails.call_started_at)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2  rounded-md shadow-sm">
                      <span className="text-lg font-semibold text-gray-700">Call Ended At:</span>
                      <span className="text-lg text-gray-800">{FormateTime(selectedLogDetails.call_ended_at)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md shadow-sm">
                      <span className="text-lg font-semibold text-gray-700">Criteria Satisfied</span>
                      <span className="text-lg text-gray-800">
                        {selectedLogDetails?.successEvalution === "true" ? "Yes" : "No"}
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
              <div className="text-gray-700 text-base leading-relaxed bg-gray-50 p-2 rounded-lg shadow-inner">
                <div className="max-h-72 overflow-y-auto">
                  {selectedLogDetails.transcript.split("\n").map((line, index) => {
                    const isAI = line.startsWith("AI:");
                    const isUser = line.startsWith("User:");
                    const speaker = isAI ? "AI" : isUser ? "User" : null;

                    return (
                      <div
                        key={index}
                        className={`border border-gray-300 px-5 py-2 rounded-md mb-2 mx-2 ${isAI ? "bg-blue-100" : isUser ? "bg-gray-100" : "bg-gray-200"
                          }`}
                      >
                        <strong className={isAI ? "text-primary" : isUser ? "text-gray-800" : "text-gray-600"}>
                          {speaker}
                        </strong>
                        <p>{line.replace(`${speaker}: `, "")}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                className="px-6 py-3 bg-primary text-white text-lg font-medium rounded-lg hover:bg-primary transition-all duration-200"
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
    </div>

  );
};

export default CallLogs;
