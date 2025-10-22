import { useEffect, useMemo, useState } from "react";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { Loading } from "../Components/Loading";
import { TbUser, TbEye } from "react-icons/tb";
import { Input } from "../Components/Input";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import LeadModal from "../Components/LeadModal";
import { FcCalendar } from "react-icons/fc";
import 'react-datepicker/dist/react-datepicker.css';
import { CiFilter } from "react-icons/ci";
import DatePicker from "react-datepicker";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";

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
}

interface LeadSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: number;
  onSelectLeads: (selectedLeadIds: number[]) => void; 
  initialSelectedLeadIds :number [] 
}

const ShowLeadsModal: React.FC<LeadSelectionModalProps> = ({ isOpen, onClose, fileId, onSelectLeads, initialSelectedLeadIds = [] }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>(initialSelectedLeadIds);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined); 
  const [salesforceId, setSalesforceId] = useState('');
  
  const { filteredItems: filteredLeads, pagesCount, pageNumbers } = useMemo(() => {
    const fromDate = startDate ? new Date(startDate) : undefined;
    const toDate = endDate ? new Date(endDate) : undefined;

    return filterAndPaginate(leads, search, currentPage, 10, 7, fromDate, toDate);
  }, [leads, search, currentPage, startDate, endDate]);

  useEffect(() => {
    fetchLeads();
  }, [fileId]); 

  if (!isOpen) return null;

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await backendRequest<Lead[], []>(
        "GET",
        fileId ? `/leads?file_id=${fileId}` : "/leads"
      );
      setLeads(response);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = () => {
    setEndDate(tempEndDate);
    setStartDate(tempStartDate);
    setFilterModalVisible(false);
    setCurrentPage(1);
  };

  const selectAll = (value: boolean) => {
    if (!value) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(lead => lead.id));
    }
  };

  const select = (leadId: number, value: boolean) => {
    if (value) {
      setSelectedLeadIds(oldValue => oldValue.includes(leadId) ? oldValue : [...oldValue, leadId]);
    } else {
      setSelectedLeadIds(oldValue => oldValue.filter(id => id !== leadId));
    }
  };

  const handleModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleApplySelection = () => {
    onSelectLeads(selectedLeadIds); 
    onClose(); 
  };

  if (loading) return <Loading />;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-2 rounded-xl shadow-xl max-w-4xl w-full overflow-hidden">
        <Card>
          <div className="flex flex-col sm:flex-row sm:justify-between mb-6 items-center w-full">
            <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto sm:mb-0 sm:mr-2 gap-2">
              <Input
                value={search}
                onChange={e => {
                  setSearch(e.currentTarget.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="w-full sm:w-auto h-full text-sm lg:text-lg px-4 py-2 sm:py-2.5 rounded-md border border-gray-300"
              />
              <button
                onClick={() => setFilterModalVisible(true)}
                className="flex items-center gap-3 w-full sm:w-auto bg-primary hover:bg-hoverdPrimary text-white font-semibold text-sm lg:text-lg px-6 py-2 sm:py-2.5 rounded-md shadow-lg transition duration-300 ease-in-out sm:ml-3"
              >
                <CiFilter className="text-xl lg:text-2xl" />
                <span>Filter Search</span>
              </button>
            </div>
          </div>

          <div className="overflow-auto mb-6 max-h-96 overflow-y-auto"> 
            <table className="min-w-full">
              <thead>
                <tr className="border-b text-left align-middle">
                  <th>
                    <input type="checkbox" onChange={e => selectAll(e.currentTarget.checked)} />
                  </th>
                  <th className="p-4 align-middle" colSpan={2}>Name</th>
                  <th className="p-4 align-middle">Email</th>
                  <th className="p-4 align-middle">Start Date</th>
                  <th className="p-4 align-middle">Mobile</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead =>
                  <tr className="border-b" key={lead.id}>
                    <td>
                      <input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={e => select(lead.id, e.currentTarget.checked)} />
                    </td>
                    <td className="p-4 align-middle">
                      <TbUser />
                    </td>
                    <td className="p-4 align-middle">{lead.first_name} {lead.last_name}</td>
                    <td className="p-4 align-middle">{lead.email}</td>
                    <td className="p-4 align-middle">{lead.add_date}</td>
                    <td className="p-4 align-middle">{lead.mobile}</td>
                    <td className="align-middle text-end">
                      <button className="xl:mr-2" onClick={() => handleModal(lead)}>
                        <TbEye />
                      </button>
                    </td>
                  </tr>
                )}
                {
                  leads.length === 0 &&
                  <tr>
                    <td colSpan={100} className="text-center p-2">Upload file to show leads.</td>
                  </tr>
                }
              </tbody>
            </table>

            {filterModalVisible && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50">
                <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full transform transition-all duration-500 ease-in-out">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Filter Leads</h2>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Salesforce ID</label>
                    <input
                      type="text"
                      value={salesforceId}
                      onChange={(e) => setSalesforceId(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ease-in-out duration-200"
                      placeholder="Enter Salesforce ID"
                    />
                  </div>

                  <div className="mb-6 relative">
                    <label className="block text-gray-700 font-medium mb-2">From</label>
                    <div className="relative">
                      <DatePicker
                        selected={tempStartDate}
                        onChange={(date) => setTempStartDate(date)}
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
                        onChange={(date) => setTempEndDate(date)}
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

          <PageNumbers
            pageNumbers={pageNumbers}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagesCount={pagesCount}
          />

          <LeadModal
            lead={selectedLead}
            isOpen={showModal}
            onClose={handleCloseModal}
          />
        </Card>
        <div className="flex justify-end  p-5 space-x-3"> 
  <button
    onClick={handleApplySelection} 
    className="py-2.5 px-5 bg-primary text-white rounded-md hover:bg-hoverdPrimary transition duration-200 ease-in-out"
  >
    Select Leads
  </button>
  <button
    onClick={onClose}
    className="py-2.5 px-5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200 ease-in-out"
  >
    Close
  </button>
</div>

      </div>
    </div>
  );
};

export default ShowLeadsModal;
