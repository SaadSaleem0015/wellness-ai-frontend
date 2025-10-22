import { useEffect, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { UploadFile } from "../Components/UploadFile";
import { Loading } from "../Components/Loading";
import { FaFolderOpen, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export interface File {
  id: number;
  name: string;
  user_id: number;
  url: string;
  is_syncing: boolean;
  sync_enable: boolean;
  sync_frequency: number;
}

export function Files() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [isUrlImport, setIsUrlImport] = useState(false);
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  // const [fileToDelete, setFileToDelete] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [isAppend, setIsAppend] = useState(false);
  const [isOverwrite, setIsOverwrite] = useState(false);
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncDuration, setSyncDuration] = useState("");
  const navigate = useNavigate();
  async function fetchFiles() {
    setLoading(true);
    const response = await backendRequest<File[], []>("GET", "/custom-leads-files");

    if (Array.isArray(response)) {
      setFiles(response);
    } else {
      console.error("Fetched data is not an array:", response);
      setFiles([]);
    }
    setLoading(false);
  }

  async function handleImport() {
    if (!url || !fileName) {
      notifyResponse({ success: false, detail: "Please fill in both fields." });
      return;
    }
    if (autoSyncEnabled && !syncDuration) {
      notifyResponse({
        success: false,
        detail: "Please select sync frequency to enable auto-sync.",
      });
      return;
    }

    setIsImporting(true);
    try {
      let endpoint = `/leads_from_url?url=${encodeURIComponent(
        url
      )}&filename=${encodeURIComponent(fileName)}`;

      if (autoSyncEnabled && syncDuration) {
        const duration = Number(syncDuration);
        endpoint += `&auto_sync=${autoSyncEnabled}&sync_frequency=${duration}`;
      }

      const response = await backendRequest("POST", endpoint);
      notifyResponse(response);
      if (response.success) {
        navigate("/view-leads");
      }
      fetchFiles();
    } catch (error) {
      console.log("Error during import:", error);
    } finally {
      setIsImporting(false);
    }
  }

  async function handleAppend() {
    if (!url || !selectedFile) {
      notifyResponse({
        success: false,
        detail: "Please fill in the URL and select an existing file.",
      });
      return;
    }

    setIsImporting(true);
    try {
      const endpoint = `/files/${selectedFile}/append?url=${encodeURIComponent(
        url
      )}`;
      const response = await backendRequest("POST", endpoint);

      notifyResponse(response);
      fetchFiles();
      if (response.success) {
        navigate("/view-leads");
      }
    } catch (error) {
      console.log("Error during append:", error);
    } finally {
      setUrl("");
      setFileName("");
      setIsImporting(false);
    }
  }

  async function handleOverwrite() {
    if (!url || !selectedFile) {
      notifyResponse({
        success: false,
        detail: "Please fill in the URL and select an existing file.",
      });
      return;
    }

    setIsImporting(true);
    try {
      const endpoint = `/files/${selectedFile}/overwrite?url=${encodeURIComponent(
        url
      )}`;
      const response = await backendRequest("POST", endpoint);
      notifyResponse(response);
      fetchFiles();
      if (response.success) {
        navigate("/view-leads");
      }
    } catch (error) {
      console.log("Error during overwrite:", error);
    } finally {
      setUrl("");
      setFileName("");
      setIsImporting(false);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Lead Files</h2>
        <div className="flex items-center">
          <button
            className={`p-2 md:p-3 w-24 text-xs md:text-sm md:w-32 tracking-wider rounded-l-full border-2 border-primary ${
              !isUrlImport
                ? "bg-primary text-white font-medium"
                : "text-primary"
            }`}
            onClick={() => {
              setIsUrlImport(false);
              setIsOverwrite(false);
              setIsAppend(false);
              setIsNew(false);
            }}
          >
            Upload File
          </button>
          <button
            className={`p-2 md:p-3 w-24 text-xs md:text-sm md:w-32 tracking-wider rounded-r-full border-2 border-primary ${
              isUrlImport ? "bg-primary text-white font-medium" : "text-primary"
            }`}
            onClick={() => setIsUrlImport(true)}
          >
            From URL
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <a href="/Leadfile_example.csv" download="Leadfile_example.csv">
          <button className="sm:pb-6 text-sm sm:text-base text-primary underline">
            Download CSV Template
          </button>
        </a>
      </div>
      {isUrlImport ? (
        <>
          <div className="mb-6 bg-white sm:p-6 rounded-lg p-3">
            <div className="flex items-center justify-end p-2">
              <div className="flex items-center p-1 sm:p-2 ml-3 rounded-xl bg-slate-100 b mb-2">
                <button
                  onClick={() => {
                    setIsOverwrite(false);
                    setIsAppend(false);
                    setIsNew(true);
                  }}
                  className={`flex items-center px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2 rounded-xl transition ${
                    isNew
                      ? "bg-white shadow-md  text-primary font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  <FaPlus className="mr-2" />
                  New
                </button>
                <button
                  onClick={() => {
                    setIsOverwrite(true);
                    setIsAppend(false);
                    setIsNew(false);
                  }}
                  className={`flex items-center px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2 rounded-xl transition ${
                    isOverwrite
                      ? "bg-white shadow-md  text-primary font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  <FaPlus className="mr-2" />
                  Overwrite
                </button>
                <button
                  onClick={() => {
                    setIsOverwrite(false);
                    setIsAppend(true);
                    setIsNew(false);
                  }}
                  className={`flex items-center text-sm sm:text-base px-4 py-2 rounded-xl transition ${
                    isAppend
                      ? "bg-white  shadow-md text-primary font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  <FaFolderOpen className="mr-2" />
                  Append
                </button>
              </div>
            </div>
            {isNew && (
              <div className="mb-6 bg-white sm:p-6 rounded-lg p-3">
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex flex-col md:w-1/2 mb-4 md:mb-0">
                    <label className="block text-sm font-medium mb-2">
                      Enter List URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/file.csv"
                      className="p-3 md:p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col md:w-1/2">
                    <label className="block text-sm font-medium mb-2">
                      List Name
                    </label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Enter file name"
                      className="p-3 md:p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center space-x-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span>Enable Auto-Sync</span>
                  </label>

                  {autoSyncEnabled && (
                    <div className="flex flex-col md:flex-row md:space-x-4 mt-4">
                      <div className="flex flex-col md:w-1/2">
                        <label className="block text-sm font-medium mb-2">
                          Sync Frequency
                        </label>
                        <select
                          value={syncDuration}
                          onChange={(e) => setSyncDuration(e.target.value)}
                          className="p-3 md:p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select Frequency</option>
                          <option value="60">Hourly</option>
                          <option value="1440">Daily</option>
                          <option value="10080">Weekly</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className={`px-4 py-3 ${
                      isImporting ? "bg-gray-400" : "bg-primary"
                    } text-white rounded-md focus:outline-none hover:bg-primary-dark`}
                  >
                    {isImporting ? "Importing..." : "Import List"}
                  </button>
                </div>
              </div>
            )}

            {isAppend && (
              <div className="mb-6 bg-white sm:p-6 rounded-lg p-3">
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex flex-col md:w-1/2 mb-4 md:mb-0">
                    <label className="block text-sm font-medium mb-2">
                      Enter List URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/file.csv"
                      className="p-3 md:p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col md:w-1/2">
                    <label className="block text-sm font-medium mb-2">
                      Select Existing List
                    </label>
                    <select
                      value={selectedFile || ""}
                      onChange={(e) => setSelectedFile(Number(e.target.value))}
                      className="p-3 md:p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option className="text-xs sm:text-sm" value="">
                        Select a List
                      </option>
                      {files.map((file) => (
                        <option key={file.id} value={file.id}>
                          {file.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    onClick={handleAppend}
                    disabled={isImporting || loading}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2.5 text-sm sm:text-base bg-primary text-white rounded-md focus:outline-none hover:bg-hoverdPrimary`}
                  >
                    Append Leads
                  </button>
                </div>
              </div>
            )}

            {isOverwrite && (
              <div className="mb-6 bg-white sm:p-6 rounded-lg p-3">
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex flex-col md:w-1/2 mb-4 md:mb-0">
                    <label className="block text-sm font-medium mb-2">
                      Enter List URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/file.csv"
                      className="p-3 md:p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col md:w-1/2">
                    <label className="block text-sm font-medium mb-2">
                      Select Existing List
                    </label>
                    <select
                      value={selectedFile || ""}
                      onChange={(e) => setSelectedFile(Number(e.target.value))}
                      className="p-3 md:p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option className="text-xs sm:text-sm" value="">
                        Select a List
                      </option>
                      {files.map((file) => (
                        <option key={file.id} value={file.id}>
                          {file.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    onClick={handleOverwrite}
                    disabled={isImporting || loading}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2.5 text-sm sm:text-base bg-primary text-white rounded-md focus:outline-none hover:bg-hoverdPrimary`}
                  >
                    Overwrite File
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <UploadFile onSuccess={fetchFiles} />
      )}
    </>
  );
}
