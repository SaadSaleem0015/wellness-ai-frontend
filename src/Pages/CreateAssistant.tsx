import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaRobot, FaMicrophone } from "react-icons/fa";
import Model from "../Components/CreateAssistantTabs/Model";
import Voice from "../Components/CreateAssistantTabs/Voice";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import ForwardingPhoneNumber from "../Components/CreateAssistantTabs/ForwardingPhoneNumber";
import { MdPhoneForwarded } from "react-icons/md";

interface AssistantData {
  id?: number;
  name: string;
  provider: string;
  first_message: string;
  model: string;
  systemPrompt: string;
  knowledgeBase: [];
  temperature: number;
  maxTokens: number;
  transcribe_provider: string;
  transcribe_language: string;
  transcribe_model: string;
  voice_provider: string;
  voice: string;
  voice_model:string;
  forwardingPhoneNumber: string;
  endCallPhrases: string[];
  attached_Number: string | null;
  draft: boolean;
  assistant_toggle: boolean | null;
  // success_evalution: string | null;
}

const CreateAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "Model" | "Voice" | "forwadingPhone"
  >("Model");
  const [loading, setLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState()
  const [isDataLoaded, setIsDataLoaded] = useState(false); 

 const [assistantData, setAssistantData] = useState({
  name: "New Assistant",
  provider: "openai",
  first_message: "Hello, this is Ava. How may I assist you today?",
  model: "gpt-4o-mini",
  systemPrompt: "I'm your virtual assistant. How can I help you today? I can provide information about our products, assist with placing orders, or help with any questions you may have. Just let me know what you're looking for!",
  knowledgeBase: [],
  temperature: 0.5,
  maxTokens: 250,
  transcribe_provider: "deepgram",
  transcribe_language: "en", 
  transcribe_model: "nova-2", 
 
  voice_provider: "11labs",
  voice: "zRnbvqTgWeC7hva0Brxq",
  voice_model: "eleven_flash_v2_5", 
  
  forwardingPhoneNumber: "",
  endCallPhrases: [],
  attached_Number: null,
  draft: false,
  assistant_toggle: null,
});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assistantId = searchParams.get("id");
  const handleChange = (
    key: keyof AssistantData,
    value: string | number | string[] | boolean
  ) => {
    setAssistantData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchAssistantData = async () => {
      if (assistantId) {
        setIsDataLoaded(false);
        try {
          const response = await backendRequest<AssistantData>(
            "GET",
            `/get-assistant/${assistantId}`
          );
          if (response) {
            setAssistantData(response);
            setSelectedCategory(response.category)
            setIsDataLoaded(true); 
          }
        } catch (error) {
          console.error("Failed to fetch assistant data:", error);
          setIsDataLoaded(true); 
        }
      } else {
    
        setIsDataLoaded(true);
      }
    };

    fetchAssistantData();
  }, [assistantId]);


  const handleUpdate = async (draft = false) => {
    console.log("this is the assistant to data"+ assistantData.voice_model)
    if (assistantData) {
      setLoading(true);

      try {
        const response = await backendRequest(
          "PUT",
          `/update_assistant/${assistantId}`,
          { ...assistantData, draft: draft, category: selectedCategory ? selectedCategory : "contacting_lead" }
        );
        console.log("randasijdp:", response);
        if (response.success) {
          navigate("/assistant");
          notifyResponse(response);
          setLoading(false);
        } else {
          notifyResponse(response);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to update assistant:", error);
        setLoading(false);
      }
    }
  };
  
  const handleSubmit = async (draft = false) => {
    console.log({assistantData})
    setLoading(true)
    try {
      const response = await backendRequest(
        "Post",
        "/assistants",
        {
          ...assistantData, draft: draft, category: selectedCategory ? selectedCategory : "contacting_lead"
        }
      );
      console.log("respone:", response);

      if (response.success) {
        notifyResponse(response);
        setLoading(false);
        navigate("/assistant");
      } else {
        notifyResponse(response);
        setLoading(false);

        throw new Error("Failed to save assistant");
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false); 
    }
  };

  const handleDraftSave = () => {
    setAssistantData((old) => ({ ...old, draft: true }));
    setIsSavingDraft(true);
    console.log("Before Submit the form request react state is ", assistantData.draft)
    handleSubmit(true);
    setIsSavingDraft(false);
  };

  const handlePublish = () => {
    setLoading(true);
    setAssistantData((old) => ({ ...old, draft: false }));
    console.log("Console log before submit form", assistantData)
    handleUpdate(false)
    setLoading(false);
  };

  const UpdateDraft = () => {
    setLoading(true);
    setAssistantData((old) => ({ ...old, draft: true }));
    handleUpdate(true)
    setLoading(false);
  }

  const isButtonsDisabled = loading || isSavingDraft || (assistantId && !isDataLoaded);

  return (
    <div className=" text-sm md:text-md bg-white text-gray-900 p-4 pb-2 md:pt-4 md:px-8 ">
      <div className="flex flex-col lg:flex-row justify-between gap-4 py-3 w-full">
        <div className="flex justify-between gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("Model")}
            className={`px-4 py-2 flex items-center space-x-2 rounded-lg text-sm font-medium transition-all ${activeTab === "Model"
              ? "bg-primary text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100/80"
              }`}
          >
            <FaRobot className="text-sm" />
            <span>Model</span>
          </button>
          <button
            onClick={() => setActiveTab("Voice")}
            className={`px-4 py-2 flex items-center space-x-2 rounded-lg text-sm font-medium transition-all ${activeTab === "Voice"
              ? "bg-primary text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100/80"
              }`}
          >
            <FaMicrophone className="text-sm" />
            <span>Voice</span>
          </button>
          <button
            onClick={() => setActiveTab("forwadingPhone")}
            className={`px-4 py-2 flex items-center space-x-2 rounded-lg text-sm font-medium transition-all ${activeTab === "forwadingPhone"
              ? "bg-primary text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100/80"
              }`}
          >
            <MdPhoneForwarded className="text-sm" />
            <span>Phone Number</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-between md:w-auto items-center">
         

          <div className="flex flex-row justify-between w-full sm:w-auto gap-3">
            {assistantId ? (
              <>

                <button
                  className={`px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-all ${isButtonsDisabled ? "opacity-80 cursor-not-allowed" : "hover:shadow-md"
                    }`}
                  onClick={assistantData.draft ? handlePublish : () => handleUpdate(false)}
                  disabled={isButtonsDisabled}
                >
                  {!isDataLoaded 
                    ? "Loading..." 
                    : loading
                    ? assistantData.draft
                      ? "Publishing..."
                      : "Updating..."
                    : assistantData.draft
                      ? "Publish"
                      : "Update"}
                </button>
              </>
            ) : (
              <>
               
                <button
                  className={`px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-all ${loading ? "opacity-80 cursor-not-allowed" : "hover:shadow-md"
                    }`}
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                >
                  {loading ? "Publishing..." : "Publish"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>


      <div className="mt-4">
        {activeTab === "Model" && (
          <Model
            assistantData={assistantData}
            handleChange={handleChange}
            setAssistantData={setAssistantData}
          />
        )}
        {activeTab === "Voice" && (
          <Voice assistantData={assistantData} handleChange={handleChange} />
        )}
        {activeTab === "forwadingPhone" && (
          <ForwardingPhoneNumber
            assistantData={assistantData}
            handleChange={handleChange}
          />
        )}
      </div>
    </div>
  );
};

export default CreateAssistant;