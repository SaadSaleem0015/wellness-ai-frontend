import { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { TbTrash } from "react-icons/tb";
import ConfirmationModal from "../Components/ConfirmationModal";
import { FaPencilAlt, FaPhone, FaSearch } from "react-icons/fa";
import Vapi from "@vapi-ai/web";
import { PageNumbers } from "../Components/PageNumbers";
import {  filterAndPaginateAssis } from "../Helpers/filterAndPaginate";
interface Agent extends Record<string, unknown> {
  add_voice_id_manually: boolean;
  first_message: string;
  id: number;
  knowledgeBase: number;
  leadsfile: number;
  maxTokens: number;
  model: string;
  name: string;
  provider: string;
  systemPrompt: string;
  temperature: number;
  transcribe_language: string;
  transcribe_model: string;
  transcribe_provider: string;
  user_id: number;
  voice: string;
  voice_provider: string;
  vapi_assistant_id: string;
  category: string;
}

const Assistant = () => {
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = [
    { label: "Warming Lead", value: "warming_lead" },
    { label: "Contacting Lead", value: "contacting_lead" },
  ];

  const [callButton, setCallButton] = useState<{
    assistantId: number | null;
    status: "Talk" | "EndCall" | "Connecting";
  }>({
    assistantId: 0,
    status: "Talk",
  });

  const navigate = useNavigate();

  const {
    filteredItems: filteredAgentList,
    pagesCount,
    pageNumbers,
  } = useMemo(
    () => filterAndPaginateAssis(agentList, search, selectedCategory, currentPage),
    [agentList, search, currentPage, selectedCategory]
  );
  const vapi = useMemo(() => {
    console.log("Vapi Instance is Created...");
    return new Vapi("90179d05-d3bd-42e5-ae0b-27680739a33e");
  }, []);

  const getAssistants = async () => {
    try {
      const response = await backendRequest<Agent[], []>(
        "GET",
        "/get-user-assistants"
      );
      const agents: Agent[] = response;
      setAgentList(agents);
      console.log("All assistant", agents);
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
    }
  };

  const handleCreateAssistant = () => {
    navigate("/assistant/createassistant");
  };

  const handleCallAgent = (vapiAssistantId: string, id: number) => {
    startCall(vapiAssistantId, id);
  };



  const startCall = (vapiAssistantId: string, agentId: number) => {
    const assistantOverrides = {
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-2",
        language: "en-AU" as const,
      },
      recordingEnabled: true
    };

    try {
      vapi.start(vapiAssistantId, assistantOverrides);

      setCallButton({
        assistantId: agentId,
        status: "Connecting",
      });

      vapi.on("call-start", () => {
        setCallButton({
          assistantId: agentId,
          status: "EndCall",
        });
        console.log("Call has started.");
      });

      vapi.on("call-end", () => {
        setCallButton({
          assistantId: null,
          status: "Talk",
        });
        console.log("Call ended");
      });

      vapi.on("speech-start", () => {
        console.log("Assistant speech has started.");
      });

      vapi.on("speech-end", () => {
        console.log("Assistant speech has ended.");
      });

      vapi.on("error", (e) => {
        console.error("Error occurred:", e);
      });
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  const endCall = () => {
    vapi.stop();
    setCallButton({
      assistantId: 0,
      status: "Talk",
    });
    console.log("Call has been stopped.");
  };

  const handleDeleteAssistant = async () => {
    if (selectedAgentId !== null) {
      try {
        const response = await backendRequest(
          "DELETE",
          `/assistants/${selectedAgentId}`
        );
        if (response.success) {
          notifyResponse(response);
          setAgentList((prevAgents) =>
            prevAgents.filter((agent) => agent.id !== selectedAgentId)
          );
        }
      } catch (error) {
        console.error("Failed to delete assistant:", error);
      } finally {
        setShowModal(false);
      }
    }
  };

  const handleShowDeleteModal = (id: number) => {
    setSelectedAgentId(id);
    setShowModal(true);
  };

  const handleUpdateAssistant = async (id: number) => {
    navigate(`/assistant/createassistant?id=${id}`);
  };

 
  useEffect(() => {
    getAssistants();
  }, []);

  function capitalizeCategory(agent: Agent) {
    if (agent && agent.category) {
      const parts = agent.category.split("_");

      if (parts[0] && parts[1]) {
        return (
          parts[0].charAt(0).toUpperCase() +
          parts[0].slice(1).toLowerCase() +
          " " +
          parts[1].charAt(0).toUpperCase() +
          parts[1].slice(1).toLowerCase()
        );
      }
    }
    return "";
  }

  return (
    <div className="bg-white text-gray-900 p-2 sm:p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
        <div>
          <h1 className="text-base sm:text-xl md:text-2xl font-semibold">
            Available Assistants
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Available Assistant Details
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-48">
            <FaSearch className="absolute left-3 text-sm text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm rounded-md border border-primary outline-none"
            />
          </div>

          <div className="relative flex items-center w-full md:w-40">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.currentTarget.value)}
              className="w-full pl-3 pr-3 py-1.5 text-xs sm:text-sm rounded-md border border-primary outline-none"
            >
              <option value="">Type</option>
              {categories.map((category, index) => (
                <option key={index} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateAssistant}
            className="bg-primary hover:bg-hoverdPrimary text-xs sm:text-sm text-white font-medium py-1.5 px-3 rounded-md flex items-center gap-1.5"
          >
            <FiPlus className="text-sm" />
            Create Assistant
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mt-8 p-2"       style={{
        overflowX: "scroll",
        scrollbarWidth: "thin",
        msOverflowStyle: "none",
      }}>
        <table className="w-full table-auto rounded-lg bg-slate-50">
          <thead>
            <tr className="text-left text-sm md:text-lg">
              <th className="py-2 sm:py-3 text-sm  px-2 md:px-6">
                ID
              </th>
              <th className="py-3 px-2 text-sm  md:px-6 whitespace-nowrap ">
                Agent Name
              </th>
              <th className="py-2 sm:py-3 text-sm  px-2 md:px-6 whitespace-nowrap">
                Transcriber
              </th>
              <th className="py-2 sm:py-3 text-sm  px-2 md:px-6 whitespace-nowrap">
                Voice Provider
              </th>
      
            </tr>
          </thead>
          <tbody>
            {filteredAgentList.length > 0 ? (
              filteredAgentList.map((agent) => (
                <tr key={agent.id} className="border-b">
                  <td className="py-2 sm:py-3 text-sm  px-2 md:px-6">
                
                        {agent.id}
              
                  </td>
                  <td className="py-2 sm:py-3 text-sm  px-2 md:px-6">
                    {agent.name}{" "}
                    {agent.draft ? (
                      <span className="text-red-400"> (Draft) </span>
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="py-3 px-2 md:px-6">
                    {agent.transcribe_provider}
                  </td>
                  <td className="py-3 px-2 md:px-6">{agent.voice_provider}</td>
                  <td className="py-3 px-2 md:px-6 whitespace-nowrap">
                    {capitalizeCategory(agent)}
                  </td>
              
                  <td className="py-4 flex flex-col md:flex-row items-center justify-center md:justify-end px-5 gap-2 md:gap-4">
                    {callButton.assistantId !== agent.id && (
                      <button
                        onClick={() =>
                          handleCallAgent(agent.vapi_assistant_id, agent.id)
                        }
                        className="text-white w-full sm:w-40 lg:w-48 text-xs sm:text-sm px-3 py-2 rounded-md bg-primary hover:bg-hoverdPrimary flex items-center justify-center transition duration-300"
                      >
                        Talk With Assistant <FaPhone className="ml-2" />
                      </button>
                    )}

                    {callButton.status === "Connecting" &&
                      callButton.assistantId === agent.id && (
                        <button className="text-white w-full sm:w-40 lg:w-48 text-xs sm:text-sm px-3 py-2 rounded-md bg-primary flex items-center justify-center transition duration-300">
                          Connecting...
                        </button>
                      )}

                    {callButton.status === "EndCall" &&
                      callButton.assistantId === agent.id && (
                        <button
                          onClick={() => endCall()}
                          className="text-white w-full sm:w-40 lg:w-48 text-xs sm:text-sm px-3 py-2 rounded-md bg-primary animate-blink flex items-center justify-center transition duration-300"
                        >
                          End Call
                        </button>
                      )}

                    <button
                      onClick={() => handleUpdateAssistant(agent.id)}
                      className="text-green-700 hover:text-green-900 transition duration-200 mt-2 sm:mt-0"
                      aria-placeholder="EDIT"
                    >
                      <FaPencilAlt className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShowDeleteModal(agent.id)}
                      className="text-red-500 hover:text-red-700 transition duration-200 mt-2 sm:mt-0"
                      aria-placeholder="DELETE"
                    >
                      <TbTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <p>No data found</p>
                  </div>
                </td>
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
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeleteAssistant}
        message="Are you sure you want to delete this assistant? This action cannot be undone."
      />
    </div>
  );
};

export default Assistant;
