import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FaEye, FaListUl, FaPencilAlt, FaRegCalendarAlt } from "react-icons/fa";
import { TbTrash } from "react-icons/tb";
import { backendRequest } from "../Helpers/backendRequest";
import ShowLeadsModal from "../Components/showLeadsModel";
import { notifyResponse } from "../Helpers/notyf";
import ConfirmationModal from "../Components/ConfirmationModal";
import { Dialog } from "@headlessui/react";
import { AiFillFile } from "react-icons/ai";
import { GiCancel, GiConfirmed } from "react-icons/gi";
import CalenderView from "../Components/CalenderView";
import { useNavigate } from "react-router-dom";

interface Call {
  id: number;
  vapi_assistant_id: string;
  title?: string;
  date?: Date[];
  file_id: number;
  leads?: number[];
  call_id: string | null;
  status?: string;
  timeZone?: string;
  scdedule?: object[];
}
interface CallLog extends Record<string, unknown> {
  id: number;
  ended_reason: string;
  status: string;
  successEvaluation: boolean | unknown;
}

const AllScheduleCall = () => {
  const [scheduledCalls, setScheduledCalls] = useState<Call[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [leadsModalOpen, setLeadsModalOpen] = useState<boolean>(false);
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"leads" | "overview">("overview");
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [successfulCalls, setSuccessfulCalls] = useState<number>(0);
  const [failedCalls, setFailedCalls] = useState<number>(0);
  const [selectedCallDetails, setSelectedCallDetails] = useState<
    CallLog[] | null
  >(null);
  const [leadsDetailLoading, setLeadsDetailLoading] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<"list" | "calendar">("list");
  useEffect(() => {
    fetchCalls();
  }, []);
  const navigate = useNavigate();

  console.log(scheduledCalls);

  const fetchCalls = async () => {
    try {
      const response = await backendRequest<Call[], []>(
        "GET",
        "/get_schedule_calls"
      );
      const sanitizedResponse = response.map((call) => ({
        ...call,
        date: Array.isArray(call.date)
          ? call.date
          : call.date
          ? [call.date]
          : [],
      }));
      setScheduledCalls(sanitizedResponse);
    } catch (error) {
      console.error("Error fetching calls:", error);
    }
  };

  const handleUpdateAssistant = async (id: number) => {
    navigate(`/scheduleCall?id=${id}`);
  };

  const handleDeleteCall = async () => {
    if (selectedCallId !== null) {
      try {
        const response = await backendRequest(
          "DELETE",
          `/delete_scheduled_call/${selectedCallId}`
        );
        notifyResponse(response);
        if (response.success) {
          setScheduledCalls((prevCalls) =>
            prevCalls.filter((call) => call.id !== selectedCallId)
          );
        }
      } catch (error) {
        console.error("Error deleting call:", error);
      } finally {
        setShowModal(false);
      }
    }
  };
  const handleCloseLeadsModal = () => setLeadsModalOpen(false);

  const handleLeadsSelection = (selectedLeadIds: number[]) => {
    setSelectedLeadIds(selectedLeadIds);
    handleCloseLeadsModal();
  };

  const handleShowDeleteModal = (id: number) => {
    setSelectedCallId(id);
    setShowModal(true);
  };

  const handleShowDetailsModal = async (id: number) => {
    setSelectedCallId(id);
    setActiveTab("overview");
    try {
      const callDetails = await backendRequest<Call>(
        "GET",
        `/get_scheduled_call/${id}`
      );
      setSelectedCall(callDetails);
      setDataFetched(false);
      setLeadsDetailLoading(false);

      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to fetch call details:", error);
    }
  };
  const handleLeadDetail = async () => {
    setLeadsDetailLoading(true);

    setActiveTab("leads");

    if (dataFetched) return;

    try {
      const response = await backendRequest<{ call_details: CallLog[] }>(
        "GET",
        `/scheduled_call/${selectedCallId}`
      );
      setSelectedCallDetails(response.call_details);
      setTotalLeads(response.call_details.length);
      setSuccessfulCalls(
        response.call_details.filter((call) => call.status === "Completed")
          .length
      );
      setFailedCalls(
        response.call_details.filter((call) => call.status !== "Completed")
          .length
      );
      setDataFetched(true);
    } catch (error) {
      console.error("Failed to fetch call details:", error);
      setSelectedCallDetails([]);
    } finally {
      setLeadsDetailLoading(false);
    }
  };

  const handleDetailsModal = () => {
    setShowDetailsModal(false);
  };
  const handleToggle = (view: "list" | "calendar") => {
    setSelectedView(view);
  };
  return (
    <div className="container mx-auto p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg sm:text-2xl font-bold">All Scheduled Calls</h1>
      </div>

      <div className="flex items-center justify-start">
        {/* <div className="flex items-center p-2 ml-3 rounded-xl bg-slate-100">
          <button
            onClick={() => handleToggle("list")}
            className={`flex items-center text-xs sm:text-base px-2 sm:px-4 py-2 rounded-xl transition ${
              selectedView === "list"
                ? "bg-white shadow-md text-primary font-semibold"
                : "text-gray-700"
            }`}
          >
            <FaListUl className="mr-2" />
            List view
          </button>
          <button
            onClick={() => handleToggle("calendar")}
            className={`flex items-center text-xs sm:text-base px-2 sm:px-4 py-2 rounded-xl transition ${
              selectedView === "calendar"
                ? "bg-white shadow-md text-primary font-semibold"
                : "text-gray-700"
            }`}
          >
            <FaRegCalendarAlt className="mr-2" />
            Calendar view
          </button>
        </div> */}
      </div>
      {selectedView === "list" && (
        <div className="overflow-x-auto mt-8 p-2">
          <table className="w-full table-auto rounded-lg bg-slate-50">
            <thead>
              <tr className="text-left text-sm md:text-lg bg-slate-100">
                <th className="py-3 px-2 md:px-6">#</th>
                <th className="py-3 px-2 md:px-6">Schdule Title</th>
                <th className="py-3 px-2 md:px-6">Time Zone</th>

                <th className="py-3 px-2 md:px-4"></th>
              </tr>
            </thead>
            <tbody>
              {scheduledCalls.length > 0 ? (
                scheduledCalls.map((call, index) => (
                  <tr key={index} className={`border-b hover:bg-slate-100`}>
                    <td className="py-3 px-2 md:px-6">{index + 1}</td>
                    {/* <td className="py-3 px-2 md:px-6">
  {Array.isArray(call.date) && call.date.length > 0 ? (
    call.date.map((date, i) => (
      <div key={i} className="flex items-center p-2 rounded-lg shadow-sm space-x-2">
        <span className="font-semibold text-gray-600 text-sm md:text-base">
          {format(new Date(date), 'EEEE').toUpperCase()}
        </span>
        <span className="text-gray-500 text-xs md:text-sm">
          {format(new Date(date), 'dd MMMM yyyy')}
        </span>
      </div>
    ))
  ) : (
    <span className="text-gray-400">No Date</span>
  )}
</td> */}
                    <td className="py-3 px-2 md:px-6">{call.title}</td>
                    <td className="py-3 px-2 md:px-6">{call.timeZone}</td>

                    {/* <td className="py-3 px-2 md:px-6">
          {call.date && call.date.length > 0 ? (
            call.date?.map((date, i) => (
              <div key={i}>
                {format(new Date(date), 'hh:mm aa')} <span className='text-sm'>({call.timeZone})</span>
              </div>
            ))
          ) : (
            'No Time'
          )}
        </td> */}

                    <td className="gap-2 py-3 px-2 md:px-6">
                      <div className="flex items-center justify-end">
                        {/* <button
                          className={` font-semibold w-24 sm:w-32 mr-4 text-sm px-2 py-2 rounded-md ${
                            call.status === "Pending"
                              ? "bg-blue-100 border text-primary"
                              : call.status === "Failed"
                              ? "bg-red-200 text-red-800"
                              : "bg-green-200 text-green-900"
                          } flex items-center justify-center`}
                        >
                          {call.status}
                        </button> */}
                        {/* <button
                          onClick={() => handleShowDetailsModal(call.id)}
                          aria-label="View Call Log"
                        >
                          <FaEye className="inline-block w-4 h-4" />
                        </button> */}
                        <button
                          onClick={() => handleUpdateAssistant(call.id)}
                          className="text-green-800 hover:underline ml-4"
                        >
                          <FaPencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShowDeleteModal(call.id)}
                          className="text-red-500 hover:underline ml-4"
                        >
                          <TbTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <p>No scheduled calls yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {selectedView === "calendar" && (
        <div className=" mt-12">
          <CalenderView scheduledCalls={scheduledCalls} />
        </div>
      )}

      {leadsModalOpen && (
        <ShowLeadsModal
          isOpen={leadsModalOpen}
          onClose={handleCloseLeadsModal}
          fileId={selectedFile ? selectedFile : 0}
          onSelectLeads={handleLeadsSelection}
          initialSelectedLeadIds={selectedLeadIds}
        />
      )}
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeleteCall}
        message="Are you sure you want to delete this scheduled call? This action cannot be undone."
      />

      <Dialog
        open={showDetailsModal}
        onClose={() => handleDetailsModal()}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
        ></div>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
            <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">
              Call Details
            </Dialog.Title>
            <div className="flex mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-2 ${
                  activeTab === "overview"
                    ? "bg-primary text-white"
                    : "hover:bg-gray-200"
                } rounded-md`}
              >
                Overview
              </button>
              <button
                onClick={() => handleLeadDetail()}
                className={`px-6 py-2 ${
                  activeTab === "leads"
                    ? "bg-primary text-white"
                    : "hover:bg-gray-200"
                } rounded-md`}
              >
                Leads
              </button>
            </div>

            {activeTab === "overview" && selectedCall && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                  <AiFillFile className="text-4xl text-blue-400 mr-4" />
                  <div>
                    <h2 className="text-xl font-semibold">Total Leads</h2>
                    <p className="text-lg">{totalLeads}</p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg flex items-center">
                  <GiConfirmed className="text-4xl text-green-300 mr-4" />
                  <div>
                    <h2 className="text-xl font-semibold">Successful Calls</h2>
                    <p className="text-lg">{successfulCalls}</p>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg flex items-center">
                  <GiCancel className="text-4xl text-red-300 mr-4" />
                  <div>
                    <h2 className="text-xl font-semibold">Failed Calls</h2>
                    <p className="text-lg">{failedCalls}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "leads" && Array.isArray(selectedCallDetails) && (
              <div className="mt-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Lead Status
                  </h3>
                  {leadsDetailLoading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 h-8 border-4 border-primary border-dotted rounded-full animate-spin"></div>
                      <p className="text-center text-xl font-medium text-gray-500">
                        Fetching lead details, please wait...
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Lead ID</th>
                          <th className="py-3 px-6 text-left">Ended Reason</th>
                          <th className="py-3 px-6 text-left">
                            Success Evaluation
                          </th>
                          <th className="py-3 px-6 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600">
                        {selectedCallDetails.map((call, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-gray-100"
                          >
                            <td className="py-3 px-6">
                              {call.lead_id as React.ReactNode}
                            </td>
                            <td className="py-3 px-6">
                              {call.ended_reason || "N/A"}
                            </td>
                            <td className="py-3 px-6">
                              {typeof call.successEvaluation === "number"
                                ? call.successEvaluation.toFixed(4)
                                : ((call.successEvaluation ||
                                    "Unknown") as React.ReactNode)}
                            </td>
                            <td
                              className={`py-3 px-6 font-semibold ${
                                call.status === "Completed"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {call.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => handleDetailsModal()}
                className="bg-primary text-white px-6 py-3 rounded-lg"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default AllScheduleCall;
