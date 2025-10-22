import React, { useEffect, useMemo, useState } from "react";
import { backendRequest } from "../../Helpers/backendRequest";
import { notifyResponse } from "../../Helpers/notyf";
import { TbTrash } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../Components/ConfirmationModal";
import { FaPencilAlt, FaPhone, FaSearch } from "react-icons/fa";
import Vapi from '@vapi-ai/web';
import CallForm from "../../Components/CallForm";
import CompactLanguageSelector from "./LanguageSelector";
import { IoLanguage } from 'react-icons/io5';


interface companyAssitantProps {
  company_id: string
}

const CompanyAssistant: React.FC<companyAssitantProps> = ({ company_id }) => {
  interface User {
    company_name: string;
    company_id: number;
  }

  interface Company {
    id: number;
    company_name: string;
    email_confirmed: boolean
  }

  interface Agent {
    id: number;
    name: string;
    transcribe_provider: string;
    voice_provider: string;
    first_message: string;
    vapi_assistant_id: string;
    user: User;
    category: string
  }

  interface FormData {
    first_name: string;
    last_name: string;
    email: string;
    add_date: string;
    mobile_no: string;
    custom_field_01: string;
    custom_field_02: string;
  }

  interface Language {
    language: string
  }
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [callAgentId, setCallAgentId] = useState<number | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [vapiAssitantId, setVapiAssitantId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [assignLanguage, setAssignLanguage] = useState<Language[]>([])
  const [loading, setLoading] = useState(false);
  const categories = [
    { label: "Warming Lead", value: "warming_lead" },
    { label: "Contacting Lead", value: "contacting_lead" },
  ];
  const [callButton, setCallButton] = useState<{
    assistantId: number | null;
    status: "Talk" | "EndCall" | "Connecting";
  }>({
    assistantId: 0,
    status: "Talk"
  });


  const vapi = useMemo(() => {
    console.log("Vapi Instance is Created...");
    return new Vapi('3524ffaf-1a0c-4490-9a16-0c7b9d2887ac');
  }, []);
  const navigate = useNavigate();

  const getAssistants = async () => {
    setLoading(true);
    try {
      const response = await backendRequest<Agent[], []>("GET", `/get-assistants/${company_id}`);
      setAgentList(response);
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
      setLoading(false)
    }
    finally {
      setLoading(false)
    }
  };

  const getAsignLanguage = async () => {
    setLoading(true);
    try {
      const response = await backendRequest<Language[], []>("GET", `/assign_language/${company_id}`);
      setAssignLanguage(response.language);
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
      setLoading(false)
    }
    finally {
      setLoading(false)
    }
  };
  const getCompanies = async () => {
    try {
      const response = await backendRequest<Company[], []>("GET", "/company");
      const confirmed_companies = response.filter(
        (company) => company.email_confirmed === true
      )
      setCompanyList(confirmed_companies);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  const handleSubmit = async (languages: string[]) => {


    try {
      const response = await backendRequest("POST", `/assign_language/${company_id}`, { languages: languages });
      if (response.success) {
        notifyResponse(response);
        getAsignLanguage()

      }
    } catch (error) {
      console.error("Failed to delete assistant:", error);
    } finally {
      setShowModal(false);
    }
  };

  const handleDeleteAssistant = async () => {
    if (selectedAgentId !== null) {
      try {
        const response = await backendRequest("DELETE", `/assistants/${selectedAgentId}`);
        if (response.success) {
          notifyResponse(response);
          setAgentList(prevAgents => prevAgents.filter(agent => agent.id !== selectedAgentId));
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
    navigate(`/admin/assistant/updateassistant?id=${id}`);
  };
  const handleCallAgent = (vapiAssistantId: string, id: number) => {
    setVapiAssitantId(vapiAssistantId);
    setCallAgentId(id);
    setShowCallModal(true);
  };
  const handleFormSubmit = async (data: FormData, action: "testCall" | "phoneCall"
  ) => {
    if (action === "phoneCall") {
      try {
        setShowCallModal(false);
        const response = await backendRequest(
          "POST",
          `/admin-demo-phone-call/${vapiAssitantId}/${data.mobile_no}`,
          data
        );
        notifyResponse(response);
        setLoading(false);
      } catch (error) {
        setShowCallModal(false)
        console.log({ error })
      }
    }
    else if (action === "testCall") {
      startCall(data);
      setShowCallModal(false);
    }
  };

  const startCall = (data: FormData,) => {
    const assistantOverrides = {
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-2",
        language: "en-AU" as const,
      },
      recordingEnabled: false,
      variableValues: {
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        mobile_no: data.mobile_no,
        add_date: data.add_date,
        custom_field_01: data.custom_field_01,
        custom_field_02: data.custom_field_02,
      },
    };

    try {
      vapi.start(vapiAssitantId, assistantOverrides);

      setCallButton({
        assistantId: callAgentId,
        status: "Connecting"
      });

      vapi.on('call-start', () => {
        setCallButton({
          assistantId: callAgentId,
          status: "EndCall"
        });
        console.log('Call has started.');
      });

      vapi.on('call-end', () => {
        setCallButton({
          assistantId: null,
          status: "Talk",
        });
        console.log("Call ended");
      });

      vapi.on('speech-start', () => {
        console.log('Assistant speech has started.');
      });

      vapi.on('speech-end', () => {
        console.log('Assistant speech has ended.');
      });

      vapi.on('error', (e) => {
        console.error('Error occurred:', e);
      });

    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const endCall = () => {
    vapi.stop();
    setCallButton({
      assistantId: 0,
      status: "Talk"
    });
    console.log('Call has been stopped.');
  };

  useEffect(() => {
    getAsignLanguage();
    getAssistants();
    getCompanies();
  }, []);

  const filteredAgents = agentList?.filter((agent) => {
    const matchesSearchTerm = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? agent.category === selectedCategory : true;
    return matchesSearchTerm && matchesCategory;
  });


  return (
    <div className="bg-white text-gray-900 p-2 sm:p-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-3">
        <div>
          <h1 className="text-base md:text-sm font-bold">Available Assistants</h1>
        </div>

        <div className="flex flex-col md:flex-row items-stretch w-full md:w-auto gap-1.5 md:gap-2">

          <button
            onClick={() => setIsPopupOpen(true)}
            className=" bg-primary hover:bg-primary/90 text-white py-2 px-2 rounded flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <IoLanguage className="block md:hidden  lg:block w-4 h-4" />
            Assign Languages
          </button>

          <div className="relative flex items-center w-full md:w-40">
            <FaSearch className="absolute left-2 text-sm text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-7 pr-2 py-2 text-sm rounded border border-gray-300 outline-none focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>


          <div className="relative flex items-center w-full md:w-36">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-2 pr-2 py-2 text-sm rounded border border-gray-300 outline-none focus:border-primary"
            >
              <option value="">Types</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">

        {assignLanguage?.length > 0 && (
          <div className="my-6 p-1  rounded-2xl border border-primary/50 shadow-sm">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-md">
                  <IoLanguage className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-gray-800">
                    Assigned Languages
                  </span>
                  <div className="flex items-center space-x-1 text-dark px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                    <span>{assignLanguage?.length}</span>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="flex flex-wrap gap-2.5">
                {assignLanguage.map((lang, index) => (
                  <span
                    key={lang}
                    className="inline-flex items-center  text-primary text-sm font-medium px-4 py-2 rounded-full border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span className="select-none">{lang}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}


        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm bg-gray-50 border-b">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Agent Name</th>
              <th className="py-2 px-2">Company</th>
              <th className="py-2 px-2">Transcriber</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">Voice Provider</th>
              <th className="py-2 px-2" colSpan={2}> Actions</th>
              {/* <th className="py-2 px-2"></th> */}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-4 text-center text-sm text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredAgents.length > 0 ? 
            (
              filteredAgents.map((agent, index) => (
                <tr key={agent.id} className="border-b">
                  <td className="py-2 px-2 text-sm">{index + 1}</td>
                  <td className="py-2 px-2 text-sm">{agent.name}</td>
                  <td className="py-2 px-2 text-sm">{agent.user.company_name}</td>
                  <td className="py-2 px-2 text-sm">{agent.transcribe_provider}</td>
                  <td className="py-2 px-2 text-sm">{agent.category}</td>
                  <td className="py-2 px-2 text-sm">{agent.voice_provider}</td>
                  <td className="py-2 px-2">
                    {callButton.assistantId !== agent.id && (
                      <button
                        onClick={() => handleCallAgent(agent.vapi_assistant_id, agent.id)}
                        className="text-white w-32 text-sm px-2 py-1.5 rounded bg-primary flex items-center justify-center"
                      >
                        Talk <FaPhone className="ml-1 text-sm" />
                      </button>
                    )}

                    {callButton.status === "Connecting" && callButton.assistantId === agent.id && (
                      <button className="text-white w-32 text-sm px-2 py-1.5 rounded bg-primary">
                        Connecting...
                      </button>
                    )}

                    {callButton.status === "EndCall" && callButton.assistantId === agent.id && (
                      <button
                        onClick={() => endCall()}
                        className="text-white w-32 text-sm px-2 py-1.5 rounded bg-red-500"
                      >
                        End Call
                      </button>
                    )}
                  </td>

                  <td className="flex justify-center items-center gap-1">
                    <button
                      onClick={() => handleUpdateAssistant(agent.id)}
                      className="text-green-600 hover:text-green-800 p-1"
                    >
                      <FaPencilAlt className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleShowDeleteModal(agent.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <TbTrash className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            ) : 
            (
              <tr>
                <td colSpan={8} className="py-4 text-center text-sm text-gray-400">
                  No data found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {showCallModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <CallForm onSubmit={handleFormSubmit} onClose={() => setShowCallModal(false)} />
        </div>
      )}

      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeleteAssistant}
        message="Are you sure you want to delete this assistant? This action cannot be undone."
      />
      <CompactLanguageSelector
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleSubmit}
        initialSelected={assignLanguage}
        title="Assign Languages"

      />
    </div>

  );
};

export default CompanyAssistant;
