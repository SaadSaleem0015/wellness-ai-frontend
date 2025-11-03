import { useEffect, useMemo, useState } from "react";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { Loading } from "../Components/Loading";
import { TbEye } from "react-icons/tb";
import { TbTrash } from "react-icons/tb";
import { Input } from "../Components/Input";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import LeadModal from "../Components/LeadModal";
import ConfirmationModal from "../Components/ConfirmationModal";
import { notifyResponse } from "../Helpers/notyf";

interface GhlLead {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  is_called?: boolean | null;
  source?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  ghl_id?: string | null;
  add_date?: string | null;
  tags?: string[];
  location_id?: string | null;
  call_count?: number | null;
  last_called_at?: string | null;
  created_at?: string | null;
}

export default function GhlLeads() {
  const [leads, setLeads] = useState<GhlLead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLead, setSelectedLead] = useState<GhlLead | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const { filteredItems, pagesCount, pageNumbers } = useMemo(() => {
    return filterAndPaginate(leads as unknown as Record<string, unknown>[], search, currentPage, 10);
  }, [leads, search, currentPage]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await backendRequest<GhlLead[] | { data: GhlLead[] }>("GET", "/ghl_leads");
      const data = Array.isArray(res) ? res : (res as { data: GhlLead[] })?.data || [];
      setLeads(data);
    } catch (error) {
      console.error("Failed to fetch GHL leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModal = (lead: GhlLead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setShowModal(false);
  };

  const handleDeleteLead = async () => {
    if (selectedLeadId !== null) {
      try {
        const response = await backendRequest("DELETE", `/delete/ghl_lead/${selectedLeadId}`);
        setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== selectedLeadId));
        notifyResponse(response);
      } catch (error) {
        console.error("Failed to delete GHL lead:", error);
      } finally {
        setShowDeleteModal(false);
        setSelectedLeadId(null);
      }
    }
  };

  const handleShowDeleteModal = (leadId: number) => {
    setSelectedLeadId(leadId);
    setShowDeleteModal(true);
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
            <Loading />
            <p className="mt-4 text-gray-600 text-sm">Loading GHL leads...</p>
          </div>
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 items-center w-full">
        <div className="flex items-center w-full sm:w-auto gap-2">
          <h1 className="text-2xl font-bold mb-2">GHL Leads</h1>
          </div>
          <div className="flex items-center w-full sm:w-auto gap-2">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-full sm:w-auto h-full text-sm lg:text-lg px-4 py-2 sm:py-3 rounded-md border border-gray-300"
            />
          </div>
        </div>

        <div className="overflow-auto mb-6">
          <table className="min-w-full">
            <thead>
              <tr className="border-b text-left align-middle">
                <th className="p-4 align-middle">Name</th>
                <th className="p-4 align-middle">Email</th>
                <th className="p-4 align-middle">Phone</th>
                <th className="p-4 align-middle whitespace-nowrap">Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((lead: unknown) => {
                const leadData = lead as GhlLead;
                return (
                  <tr className="border-b" key={leadData.id}>
                    <td className="p-4 align-middle">{leadData.name || "-"}</td>
                    <td className="p-4 align-middle">{leadData.email || "-"}</td>
                    <td className="p-4 align-middle">{leadData.phone || "-"}</td>
                    <td className="p-4 align-middle">{leadData.add_date || leadData.created_at || "-"}</td>
                    <td className="align-middle text-end">
                      <div className="flex items-center gap-2 justify-end">
                        <button 
                          className="text-blue-600 hover:text-blue-800 transition-colors" 
                          onClick={() => handleModal(leadData)}
                          aria-label="View Lead"
                        >
                          <TbEye className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 transition-colors" 
                          onClick={() => handleShowDeleteModal(leadData.id)}
                          aria-label="Delete Lead"
                        >
                          <TbTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={100} className="text-center p-2">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PageNumbers
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagesCount={pagesCount}
        />

        <LeadModal
          lead={selectedLead as unknown}
          isOpen={showModal}
          onClose={handleCloseModal}
        />

        <ConfirmationModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteLead}
          message="Are you sure you want to delete this GHL lead? This action cannot be undone."
        />
      </Card>
    </div>
  );
}


