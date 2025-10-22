import React, { useEffect, useState } from "react";
import Select, { MultiValue } from "react-select";
import {
  backendRequest,
  backendStreamingRequest,
} from "../../Helpers/backendRequest";
import {
  ArrowPathIcon,
  ClipboardIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import ChatLoading from "../../Helpers/chatLoading";
interface AssistantData {
  name: string;
  provider: string;
  first_message: string;
  model: string;
  systemPrompt: string;
  knowledgeBase: string[];
  temperature: number;
  maxTokens: number;
  leadsfile: number[];
  tools: string[];
}

interface ModelProps {
  assistantData: AssistantData;
  setAssistantData: (data: AssistantData) => void;
  handleChange: (
    key: keyof AssistantData,
    value: string | number | string[] | number[]
  ) => void;
}

interface Document {
  user_id: number;
  id: number;
  filename: string;
  upload_date: string;
  company_id: number;
  original_filename: string;
  vapi_id: string;
  file_format: string;
}


interface Tool {
  orgId: string;
  name: string;
  created_at: string;
  description: string;
  id: number;
  updated_at: string;
  vapi_id: string;
  credentialId: string | null;
}

const Model: React.FC<ModelProps> = ({
  assistantData,
  handleChange,
  setAssistantData,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [showEnhancedModel, setShowEnhancedModel] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false)

  const fetchDocuments = async () => {
    try {
      const response = await backendRequest<Document[], []>(
        "GET",
        "/knowledge-base-files"
      );
      setDocuments(response);
    } catch (error) {
      console.error("Fetch documents error:", error);
    }
  };

  const fetchTools = async () => {
    try {
      const response = await backendRequest<{ success: boolean; message: string; tools: Tool[] }>("GET", "/tools");
      if (response.success) {
        setTools(response.tools);
      }
    } catch (error) {
      console.error("Fetch tools error:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchTools();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayFilename = (filename: string) => {
    const parts = filename.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : filename;
  };

  const documentOptions = documents.map((doc) => ({
    value: doc.vapi_id,
    label: `${getDisplayFilename(doc.filename)} - ${formatDate(doc.upload_date)}`,
  }));


  const toolOptions = tools.map((tool) => ({
    value: tool.vapi_id,
    label: tool.name,
  }));


  const handleDocumentSelection = (
    selectedOptions: MultiValue<{ value: string; label: string }>
  ) => {
    const selectedIds = selectedOptions.map((option) => option.value);
    handleChange("knowledgeBase", selectedIds);
  };

  const handleToolsSelection = (
    selectedOptions: MultiValue<{ value: string; label: string }>
  ) => {
    const selectedIds = selectedOptions.map((option) => option.value);
    handleChange("tools", selectedIds);
  };



  const addVariable = (
    field: string,
    input: "first_message" | "systemPrompt"
  ) => {
    const firstMessage = document.getElementById(
      input === "first_message" ? "first_message" : "systemPrompt"
    ) as HTMLInputElement;
    const newValue =
      firstMessage?.value?.substring(0, firstMessage.selectionStart!) +
      `{{${field}}}` +
      firstMessage?.value?.substring(firstMessage.selectionEnd!);
    setAssistantData({
      ...assistantData,
      [input]: newValue,
    });
  };

  const handleEnhancedPrompt = async () => {
    const prompt = assistantData.systemPrompt;
    // console.log("loading", loading);
    setShowEnhancedModel(true);
    setLoading(true)
    try {
      const stream = backendStreamingRequest("POST", "/enhanced_prompt", {
        prompt,
      });
      let enhancedText = "";
      for await (const chunk of stream) {
        if (chunk) {
          setLoading(false)

          enhancedText += chunk;
          setEnhancedPrompt(enhancedText);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white text-gray-800 p-0 sm:p-4 pb-0">
      <div className="w-full mx-auto rounded-lg">
        <h1 className="text-2xl font-bold text-primary mb-2">Model</h1>
        <p className="text-gray-500 text-sm mb-3">
          This section allows you to configure the model for the assistant.
        </p>
        <hr className="bg-gray-200 pt-[.8px] mb-3" />
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assistant Name
            </label>
            <input
              type="text"
              id="name"
              value={assistantData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Knowledge Base
            </label>
            <Select
              isMulti
              value={documentOptions.filter((option) =>
                (assistantData.knowledgeBase || []).includes(option.value)
              )}
              options={documentOptions}
              onChange={handleDocumentSelection}
              placeholder="Select Files"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tools
            </label>
            <Select
              isMulti
              value={toolOptions.filter((option) =>
                (assistantData.tools || []).includes(option.value)
              )}
              options={toolOptions}
              onChange={handleToolsSelection}
              placeholder="Select Tools"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 mb-6">
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
            </div>

            <textarea
              value={assistantData.systemPrompt}
              rows={7}
              id="systemPrompt"
              onChange={(e) => handleChange("systemPrompt", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <div className="flex flex-wrap mt-2 gap-2 ">
              <button
                className="py-1 px-4 rounded-full border border-gray-400 hover:bg-primary hover:text-white "
                onClick={() => addVariable("first_name", "systemPrompt")}
              >
                first_name
              </button>
              <button
                className="py-1 px-4 rounded-full border border-gray-400  hover:bg-primary hover:text-white  "
                onClick={() => addVariable("last_name", "systemPrompt")}
              >
                last_name
              </button>
              <button
                className="py-1 px-4 rounded-full border border-gray-400  hover:bg-primary hover:text-white  "
                onClick={() => addVariable("email", "systemPrompt")}
              >
                email
              </button>
              <button
                className="py-1 px-4 rounded-full border border-gray-400  hover:bg-primary hover:text-white  "
                onClick={() => addVariable("add_date", "systemPrompt")}
              >
                add_date
              </button>
              <button
                className="py-1 px-4 rounded-full border border-gray-400 hover:bg-primary hover:text-white  "
                onClick={() => addVariable("mobile_no", "systemPrompt")}
              >
                mobile_no
              </button>
              <button
                className="py-1 px-4 rounded-full border border-gray-400 hover:bg-primary hover:text-white  "
                onClick={() => addVariable("custom_field1", "systemPrompt")}
              >
                custom_field 01
              </button>
              <button
                className="py-1 px-4 rounded-full border border-gray-400 hover:bg-primary hover:text-white  "
                onClick={() => addVariable("custom_field2", "systemPrompt")}
              >
                custom_field 02
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:gap-6 mb-6">
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Message
              </label>
              <input
                value={assistantData.first_message}
                type="text"
                id="first_message"
                onChange={(e) => handleChange("first_message", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <div className="flex flex-wrap mt-2 gap-2 ">
                <button
                  className="py-1 px-4 rounded-full border border-gray-400 hover:bg-primary hover:text-white "
                  onClick={() => addVariable("first_name", "first_message")}
                >
                  first_name
                </button>
                <button
                  className="py-1 px-4 rounded-full border border-gray-400  hover:bg-primary hover:text-white  "
                  onClick={() => addVariable("last_name", "first_message")}
                >
                  last_name
                </button>
                <button
                  className="py-1 px-4 rounded-full border border-gray-400  hover:bg-primary hover:text-white  "
                  onClick={() => addVariable("email", "first_message")}
                >
                  email
                </button>
                <button
                  className="py-1 px-4 rounded-full border border-gray-400  hover:bg-primary hover:text-white  "
                  onClick={() => addVariable("add_date", "first_message")}
                >
                  add_date
                </button>
                <button
                  className="py-1 px-4 rounded-full border border-gray-400 hover:bg-primary hover:text-white  "
                  onClick={() => addVariable("mobile_no", "first_message")}
                >
                  mobile_no
                </button>
                <button
                  className="py-1 px-4 rounded-full border border-gray-400 hover:bg-primary hover:text-white  "
                  onClick={() => addVariable("custom_field1", "first_message")}
                >
                  custom_field 01
                </button>
                <button
                  className="py-1 px-4 rounded-full border border-gray-400 hover:bg-primary hover:text-white  "
                  onClick={() => addVariable("custom_field2", "first_message")}
                >
                  custom_field 02
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="bg-gray-200 pt-[.8px] mb-5 pb-2" />

      {showEnhancedModel && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 md:w-5/12  relative transform transition-all duration-300 scale-105">
            <button
              onClick={() => setShowEnhancedModel(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="text-xl flex items-center gap-2 font-bold text-gray-800 mb-4">
              <SparklesIcon className="w-6 h-6 text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
              Enhanced System Prompt
            </h2>
            {loading ? (
              <ChatLoading />
            ) : (
              <textarea
                value={enhancedPrompt}
                rows={8}
                onChange={(e) => setEnhancedPrompt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
            )}


            <div className="flex justify-end items-center gap-3 mt-4">
              <button
                onClick={handleEnhancedPrompt}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Regenerate
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(enhancedPrompt);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-hoverdPrimary transition"
              >
                <ClipboardIcon className="w-5 h-5" />
                Copy to Clipboard
              </button>
            </div>

            {copied && (
              <div className="fixed bottom-14 right-1 bg-black/50 text-white px-4 py-2 rounded-lg shadow-lg fade-in-out">
                Copied to clipboard!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Model;