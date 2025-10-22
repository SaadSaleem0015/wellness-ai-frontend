import { useEffect, useMemo, useState } from "react";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { Loading } from "../Components/Loading";
import { TbTrash, TbEye } from "react-icons/tb";
import { notifyResponse } from "../Helpers/notyf";
import { Input } from "../Components/Input";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import { useSearchParams } from "react-router-dom";
import LeadModal from "../Components/LeadModal";
import { FcCalendar, FcPhone } from "react-icons/fc";
import { AddLeadModal } from "../Components/AddLeadModal";
import 'react-datepicker/dist/react-datepicker.css';
import { CiFilter } from "react-icons/ci";
import DatePicker from "react-datepicker";
import { HiAdjustmentsHorizontal, HiArrowUturnLeft } from "react-icons/hi2";
import ConfirmationModal from "../Components/ConfirmationModal";
import { FormateTime } from "../Helpers/formateTime";

interface Lead extends Record<string, unknown> {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  salesforce_id: string;
  add_date: string;
  mobile: string;
  other_data?: string[];
  file_id: number;
  state: string
  timezone: string | null
}

interface CustomLead extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  country: string | null;
  add_date: string | null;
  created_at: string;
  status: boolean;
}

interface Assistant {
  id: string;
  name: string;
  vapi_assistant_id: string;
}

type ModalLead = {
  first_name?: string;
  last_name?: string;
  email?: string;
  add_date?: string;
  mobile?: string;
  salesforce_id?: string;
  other_data?: string[];
  state?: string | null;
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  tags?: string[] | null;
};

export function Leads() {
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customLeads, setCustomLeads] = useState<CustomLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ModalLead | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editStateModalVisible, setEditStateModalVisible] = useState(false);
  const [newStateValue, setNewStateValue] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);
  const [salesforceId, setSalesforceId] = useState('');
  const[tempSalesforceId,setTempSalesforceId] = useState('')
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [leadIdsToDelete, setLeadIdsToDelete] = useState<number[]>([]);
  const [leadToAddDnc, setLeadToAddDnc] = useState<number | null>(null);
  const [dncConfirmationModalVisible, setDncConfirmationModalVisible] = useState<boolean>(false);

  const fileId = searchParams.get("file_id");
  const isCustom = !!fileId;

  const { filteredItems: filteredLeads, pagesCount, pageNumbers } = useMemo(() => {
    const fromDate = startDate ? new Date(startDate) : undefined;
    const toDate = endDate ? new Date(endDate) : undefined;
    const baseList: Record<string, unknown>[] = (isCustom ? customLeads : leads) as unknown as Record<string, unknown>[];
    return filterAndPaginate<Record<string, unknown>>(baseList, search, currentPage, 10, 7, fromDate, toDate ,salesforceId); 
  }, [leads, customLeads, search, currentPage, startDate, endDate, salesforceId, isCustom]); 

  useEffect(() => {
    fetchAssistants();
    fetchLeads(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    if (isCustom) {
      try {
        type ApiOk = { success: true; file: { id: number; name: string; type: string; created_at: string; updated_at: string }; total: number; data: CustomLead[] };
        type ApiErr = { success: false | undefined; detail: string | object };
        const response = await backendRequest<ApiOk, ApiErr>("GET", `/custom-leads/${fileId}`);
        if ("success" in response && response.success === true && Array.isArray(response.data)) {
          setCustomLeads(response.data);
        } else {
          setCustomLeads([]);
        }
      } catch {
        setCustomLeads([]);
      }
    } else {
      const response = await backendRequest<Lead[], []>(
        "GET",
        "/leads"
      );
      setLeads(response);
    }
    setLoading(false);
  };

  const fetchAssistants = async () => {
    try {
      const response = await backendRequest<Assistant[]>('GET', '/get-user-assistants');
      setAssistants(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const handleFilterApply = () => {
    setSalesforceId(tempSalesforceId)
    setEndDate(tempEndDate)
    setStartDate(tempStartDate)
    setFilterModalVisible(false);
    setCurrentPage(1);
  };

  const remove = async (leadIds: number[]) => {
    const response = await backendRequest("DELETE", "/leads", { ids: leadIds });
    notifyResponse(response);
    if (response.success)
      setLeads(oldLeads => oldLeads.filter(lead => !leadIds.includes(lead.id)));
  };

  const handleConfirmAddLeadToDNC = async () =>{
    const leadId = leadToAddDnc
    try {
      const res = await backendRequest("POST", `/add-lead-todnc/${leadId}`)
      notifyResponse(res)
      setDncConfirmationModalVisible(false) 
      setLeadToAddDnc(null)
    } catch (error) {
      console.log(error);
    }
  }

  const handleCall = async () => {
    setLoading(true)
    if (selectedLeadId && selectedAssistant) {
      try {
        const response = await backendRequest("POST", `/assistant-call/${selectedAssistant}/${selectedLeadId}`);
        notifyResponse(response);
        setModalVisible(false);
      } catch (error) {
        console.error("Failed to Call:", error);
      } finally {
        setLoading(false)
      }
    }
  };

  const handleModal = (lead: Lead | CustomLead) => {
    const modalLead: ModalLead = ("first_name" in lead)
      ? {
          first_name: (lead as Lead).first_name,
          last_name: (lead as Lead).last_name,
          email: (lead as Lead).email,
          add_date: (lead as Lead).add_date,
          mobile: (lead as Lead).mobile,
          state: (lead as Lead).state,
        }
      : {
          name: (lead as CustomLead).name,
          email: (lead as CustomLead).email,
          phone: (lead as CustomLead).phone,
          city: (lead as CustomLead).city,
          state: (lead as CustomLead).state,
          country: (lead as CustomLead).country,
          add_date: (lead as CustomLead).created_at,
        };
    setSelectedLead(modalLead);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  const handleCallModal = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setModalVisible(true);
  };

  const handleCloseAssitantModal = () => {
    setModalVisible(false);
    setSelectedAssistant(null);
    setSelectedLeadId(null);
  };

  const handleAddLeadModalOpen = () => {
    setIsAddLeadModalOpen(true);
  };

  const handleAddLeadModalClose = () => {
    setIsAddLeadModalOpen(false);
  };

  const handleDeleteConfirmation = (leadIds: number[]) => {
    setLeadIdsToDelete(leadIds);
    setConfirmationModalVisible(true);
  };

  const handleAddLeadToDNC = (leadId: number) => {
    setLeadToAddDnc(leadId)
    setDncConfirmationModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    await remove(leadIdsToDelete);
    setConfirmationModalVisible(false);
  };
  
  const handleAddLead = async (lead: { first_name: string; last_name: string; email: string; mobile: string; startDate: string; salesforce_id: string }) => {
    const fileId = searchParams.get("file_id");
    const leadData = {
      ...lead,
      add_date: lead.startDate,
      file_id: fileId ? Number(fileId) : null
    };

    const response = await backendRequest("POST", "/add_manually_lead", leadData);
    notifyResponse(response);
    if (response.success) {
      await fetchLeads();
    }
  };

  const handleResetFilters = () => {
    setTempEndDate(undefined)
    setTempSalesforceId('')
    setTempStartDate(undefined)
    setEndDate(undefined)
    setSalesforceId('')
    setStartDate(undefined)
  }

  const handleUpdateState = async () => {
    if (!editingLead) return;
    
    try {
      setLoading(true);
      const state = newStateValue
      const response = await backendRequest("PUT", `/update-lead-state/${editingLead.id}`,{state});
      
      notifyResponse(response);
      if (response.success) {
        setLeads(leads.map(lead => 
          lead.id === editingLead.id ? {
            ...lead, 
            state: newStateValue,
            timezone: "corrected" 
          } : lead
        ));
        setEditStateModalVisible(false);
      }
    } catch (error) {
      console.error("Error updating state:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Loading />
        </div>
      )}
      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 items-center w-full">
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto mb-4 sm:mb-0 sm:mr-2 gap-2">
            <Input
              value={search}
              onChange={e => {
                setSearch(e.currentTarget.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-full sm:w-auto h-full text-sm lg:text-lg px-4 py-2 sm:py-3 rounded-md border border-gray-300"
            />
            <button
              onClick={() => setFilterModalVisible(true)}
              className="flex items-center gap-3 w-full sm:w-auto bg-primary hover:bg-hoverdPrimary text-white font-semibold text-sm lg:text-lg px-6 py-2 sm:py-3 rounded-md shadow-lg transition duration-300 ease-in-out sm:ml-3"
            >
              <CiFilter className="text-xl lg:text-2xl" />
              <span>Filter Search</span>
            </button>
          </div>
          {!isCustom && (
            <div className="flex flex-col sm:flex-row sm:justify-start items-center w-full sm:w-auto gap-2">
              <button
                onClick={handleAddLeadModalOpen}
                className="w-full sm:w-auto bg-primary hover:bg-hoverdPrimary text-white font-semibold text-sm lg:text-lg px-6 py-2 sm:py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out sm:ml-2"
              >
                Add
              </button>
              <AddLeadModal
                isOpen={isAddLeadModalOpen}
                onClose={handleAddLeadModalClose}
                onSubmit={handleAddLead}
              />
            </div>
          )}
        </div>

        <div className="overflow-auto mb-6">
          <table className="min-w-full">
            <thead>
              <tr className="border-b text-left align-middle">
                {isCustom ? (
                  <>
                    <th className="p-4 align-middle">Name</th>
                    <th className="p-4 align-middle">Email</th>
                    <th className="p-4 align-middle">Phone</th>
                    <th className="p-4 align-middle">City</th>
                    <th className="p-4 align-middle">State</th>
                    <th className="p-4 align-middle">Country</th>
                    <th className="p-4 align-middle whitespace-nowrap">Created</th>
                    <th></th>
                  </>
                ) : (
                  <>
                    <th className="p-4 align-middle">Name</th>
                    <th className="p-4 align-middle">Email</th>
                    <th className="p-4 align-middle whitespace-nowrap">Start Date</th>
                    <th className="p-4 align-middle">Mobile</th>
                    <th className="p-4 align-middle">State</th>
                    <th className="py-4 px-6 align-middle whitespace-nowrap">Add to DNC</th>
                    <th></th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr className="border-b" key={(lead as { id: number }).id}>
                  {isCustom ? (
                    <>
                      <td className="p-4 align-middle">{(lead as CustomLead).name}</td>
                      <td className="p-4 align-middle">{(lead as CustomLead).email}</td>
                      <td className="p-4 align-middle">{(lead as CustomLead).phone}</td>
                      <td className="p-4 align-middle">{(lead as CustomLead).city || "-"}</td>
                      <td className="p-4 align-middle">{(lead as CustomLead).state || "-"}</td>
                      <td className="p-4 align-middle">{(lead as CustomLead).country || "-"}</td>
                      <td className="p-4 align-middle">{(lead as CustomLead).created_at}</td>
                      <td className="align-middle text-end">
                        <button className="xl:mr-2" onClick={() => handleModal(lead as unknown as Lead)}>
                          <TbEye />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 align-middle">{(lead as Lead).first_name} {(lead as Lead).last_name}</td>
                      <td className="p-4 align-middle">{(lead as Lead).email}</td>
                      <td className="p-4 align-middle">{FormateTime((lead as Lead).add_date)}</td>
                      <td className="p-4 align-middle">{(lead as Lead).mobile}</td>
                      <td className="p-4 align-middle">
                        {(lead as Lead).timezone === null ? (
                          <div 
                            className="inline-flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setEditingLead(lead as Lead);
                              setNewStateValue((lead as Lead).state);
                              setEditStateModalVisible(true);
                            }}
                          >
                            <span>{(lead as Lead).state}</span>
                            <span className="text-red-600 border border-red-300 rounded px-2 py-1 text-xs">Incorrect</span>
                          </div>
                        ) : (
                          (lead as Lead).state
                        )}
                      </td>
                      <td className="p-4 align-middle"> 
                        <button 
                          onClick={() => handleAddLeadToDNC((lead as Lead).id)} 
                          className="text-white bg-primary p-2 rounded-md"
                        >
                          Add
                        </button>
                      </td>
                      <td className="align-middle text-end">
                        <button onClick={() => handleCallModal(lead as Lead)} className="text-green-800 xl:mr-2 hover:underline" aria-placeholder="CALL"> <FcPhone /> </button>
                        <button className="xl:mr-2" onClick={() => handleModal(lead as Lead)}>
                          <TbEye />
                        </button>
                        <button className="text-red-600" onClick={() => handleDeleteConfirmation([(lead as Lead).id])}>
                          <TbTrash />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {leads.length === 0 &&
                <tr>
                  <td colSpan={100} className="text-center p-2">Upload file to show leads.</td>
                </tr>
              }
            </tbody>
          </table>

          {/* Edit State Modal */}
          {editStateModalVisible && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Edit State</h2>
                <p className="text-sm text-gray-600 mb-4">
                  This lead has an incorrect timezone. Please update the state to fix this.
                </p>
                
                <Input
                  value={newStateValue}
                  onChange={(e) => setNewStateValue(e.target.value)}
                  placeholder="Enter correct state"
                  className="w-full mb-4"
                />
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditStateModalVisible(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateState}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other modals... */}
          {modalVisible && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center px-2 z-50">
              <div className="bg-white p-3 sm:p-4 md:p-10 rounded-lg shadow-lg max-w-xl w-full">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Select Assistant</h2>
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col">
                    <label htmlFor="assistantSelect" className="mb-2 text-gray-600 font-medium">
                      Select an Assistant
                    </label>
                    <select
                      id="assistantSelect"
                      className="p-3 border border-gray-300 rounded-lg text-gray-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={selectedAssistant || ''}
                      onChange={(e) => setSelectedAssistant(e.target.value)}
                    >
                      <option value="" disabled>
                        Choose an assistant...
                      </option>
                      {assistants.map((assistant) => (
                        <option key={assistant.id} value={assistant.vapi_assistant_id}>
                          {assistant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      className="px-7 py-2 bg-primary text-white rounded hover:bg-primary-dark transition duration-200"
                      onClick={handleCall}
                      disabled={!selectedAssistant || loading}
                    >
                      {loading ? "Calling..." : 'Call'}
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-200"
                      onClick={handleCloseAssitantModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filterModalVisible && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full transform transition-all duration-500 ease-in-out">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 text-center">Filter Leads</h2>
                  <button
                    onClick={handleResetFilters}  
                    className="font-medium text-red-800 hover:text-gray-700 transition ease-in-out duration-200"
                  >
                    <HiArrowUturnLeft className="inline-block text-lg mr-1" /> Reset Filters
                  </button>
                </div>

                <div className="mb-6 relative">
                  <label className="block text-gray-700 font-medium mb-2">From</label>
                  <div className="relative">
                    <DatePicker
                      selected={tempStartDate}
                      onChange={(date) => setTempStartDate(date as Date)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ease-in-out duration-200 pl-10"
                      placeholderText="Select Start Date"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <FcCalendar className="text-2xl" />
                    </div>
                  </div>
                </div>

                <div className="mb-6 relative">
                  <label className="block text-gray-700 font-medium mb-2">To</label>
                  <div className="relative">
                    <DatePicker
                      selected={tempEndDate}
                      onChange={(date) => setTempEndDate(date as Date)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ease-in-out duration-200 pl-10"
                      placeholderText="Select End Date"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <FcCalendar className="text-2xl" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setFilterModalVisible(false)}
                    className="w-full mr-3 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFilterApply}
                    className="w-full ml-3 py-2.5 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-dark transition duration-200 ease-in-out flex items-center justify-center gap-2"
                  >
                    Apply Filters
                    <HiAdjustmentsHorizontal className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {confirmationModalVisible && (
          <ConfirmationModal
            show={confirmationModalVisible}
            onClose={() => setConfirmationModalVisible(false)}
            onConfirm={handleConfirmDelete}
            message="Are you sure you want to delete this lead? This action cannot be undone."
          />
        )}
        {dncConfirmationModalVisible && (
          <ConfirmationModal
            show={dncConfirmationModalVisible}
            onClose={() => setDncConfirmationModalVisible(false)}
            onConfirm={handleConfirmAddLeadToDNC}
            message="Are you sure you want to add this lead to DNC? This action cannot be undone."
          />
        )}

        <PageNumbers
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagesCount={pagesCount}
        />

        <LeadModal
          lead={selectedLead as ModalLead}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      </Card>
    </div>
  );
}