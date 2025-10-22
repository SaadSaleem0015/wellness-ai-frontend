import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaPencilAlt } from "react-icons/fa";
import { backendRequest } from "../../Helpers/backendRequest";
import { useNavigate } from "react-router-dom";
import { TbTrash } from "react-icons/tb";
import ConfirmationModal from "../../Components/ConfirmationModal";
import { notifyResponse } from "../../Helpers/notyf";
import { filterAndPaginate } from "../../Helpers/filterAndPaginate";
import { PageNumbers } from "../PageNumbers";

interface Agent {
  id: number;
  name: string;
  transcribe_provider: string;
  voice_provider: string;
  first_message: string;
  vapi_assistant_id: string;
}

const AgentsPage = ({ id }: { id: string }) => {
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const companyId = id;
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    filteredItems: filteredAgents,
    pagesCount,
    pageNumbers,
  } = useMemo(() => {
    return filterAndPaginate(agentList, search, currentPage, 10, 7);
  }, [agentList, search, currentPage]);

  useEffect(() => {
    setLoading(true)
    try {
      const fetchAssistants = async () => {
        const response = await backendRequest<Agent[], []>(
          "GET",
          `/company/${companyId}/assistants`
        );
        setAgentList(response.assistants);
        setCompanyName(response.company_name);
      };

      fetchAssistants();
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }, [companyId]);


  const handleDeleteAssistant = async () => {
    if (selectedAgentId !== null) {
      try {
        const response = await backendRequest(
          "DELETE",
          `/assistants/${selectedAgentId}`
        );
        notifyResponse(response);
        if (response.success) {
          setAgentList((prevAgents) =>
            prevAgents.filter((agent) => agent.id !== selectedAgentId)
          );
        }
      } catch (error) {
        console.error("Failed to delete assistant:", error);
      } finally {
        setShowDeleteModal(false);
      }
    }
  };

  const handleShowDeleteModal = (id: number) => {
    setSelectedAgentId(id);
    setShowDeleteModal(true);
  };

  const handleEditAgent = (id: number) => {
    navigate(`/admin/assistant/updateassistant?id=${id}`);
  };

  return (
    <div className="">
    
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">
            Assistants of <span className="text-primary">{companyName}</span>
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex items-center w-full md:w-auto">
            <FaSearch className="absolute left-4 text-lg text-gray-500" />
            <input
              type="text"
              placeholder="Search Assistant..."
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              id="search"
              aria-label="Search files"
              className="bg-gray-50 border text-sm md:text-base border-gray-400 text-gray-900 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none block w-full md:w-64 pl-10 py-2"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-8 bg-white">
        <table className="w-full table-auto rounded-lg">
          <thead>
            <tr className="text-left text-sm md:text-md bg-gray-100 border-b-2">
              <th className="py-3 px-2 md:px-6">#</th>
              <th className="py-3 px-2 md:px-6">Agent Name</th>
              <th className="py-3 px-2 md:px-6">Transcriber</th>
              <th className="py-3 px-2 md:px-6">Voice Provider</th>
              <th className="py-3 px-2 md:px-6"></th>
            </tr>
          </thead>
          <tbody>
            {!loading ? (
              filteredAgents.length > 0 ? (
                filteredAgents.map((agent, index) => (
                  <tr key={agent.id} className="border-b">
                    <td className="py-3 px-2 md:px-6">{index + 1}</td>
                    <td className="py-3 px-2 md:px-6">{agent.name}</td>
                    <td className="py-3 px-2 md:px-6">{agent.transcribe_provider}</td>
                    <td className="py-3 px-2 md:px-6">{agent.voice_provider}</td>
                    <td className="flex space-x-2 md:px-6 justify-center lg:pt-5">
                      <button
                        onClick={() => handleEditAgent(agent.id)}
                        className="text-green-800 hover:underline"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => handleShowDeleteModal(agent.id)}
                        className="text-red-600 hover:underline"
                      >
                        <TbTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <p>No assistants found</p>
                    </div>
                  </td>
                </tr>
              )
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <p>Loading...</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>


        </table>
      </div>

      {showDeleteModal && (
        <ConfirmationModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAssistant}
          message="Are you sure you want to delete this assistant? This action cannot be undone."
        />
      )}
      <PageNumbers
        pageNumbers={pageNumbers}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagesCount={pagesCount}
      />
    </div>
  );
};

export default AgentsPage;
