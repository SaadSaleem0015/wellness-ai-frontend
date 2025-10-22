import { useEffect, useMemo, useState } from "react";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { Loading } from "../Components/Loading";
import { TbEye } from "react-icons/tb";
import { Input } from "../Components/Input";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import LeadModal from "../Components/LeadModal";

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

  const { filteredItems, pagesCount, pageNumbers } = useMemo(() => {
    return filterAndPaginate(leads, search, currentPage, 10);
  }, [leads, search, currentPage]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await backendRequest<GhlLead[] | { data: GhlLead[] }>("GET", "/ghl_leads");
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      setLeads(data);
    } catch (e) {
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

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Loading />
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 items-center w-full">
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
              {filteredItems.map((lead: GhlLead) => (
                <tr className="border-b" key={lead.id}>
                  <td className="p-4 align-middle">{lead.name || "-"}</td>
                  <td className="p-4 align-middle">{lead.email || "-"}</td>
                  <td className="p-4 align-middle">{lead.phone || "-"}</td>
                  <td className="p-4 align-middle">{lead.add_date || lead.created_at || "-"}</td>
                  <td className="align-middle text-end">
                    <button className="xl:mr-2" onClick={() => handleModal(lead)}>
                      <TbEye />
                    </button>
                  </td>
                </tr>
              ))}
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
          lead={selectedLead as any}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      </Card>
    </div>
  );
}


