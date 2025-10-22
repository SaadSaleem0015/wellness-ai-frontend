import { useEffect, useMemo, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { Card } from "../Components/Card";
import { TbEye, TbTrash } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { notifyResponse } from "../Helpers/notyf";
import { Loading } from "../Components/Loading";
import ConfirmationModal from "../Components/ConfirmationModal";
import { MdOutlineFileUpload } from "react-icons/md";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import { FaSearch } from "react-icons/fa";
import { FormateTime } from "../Helpers/formateTime";
export interface File {
  id: number;
  name: string;
  type: string; // e.g., "CUSTOM"
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // allow generic filtering/search utility
}

export function ViewLeads() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const navigate = useNavigate();

  const {
    filteredItems = [],
    pagesCount = 1,
    pageNumbers = [],
  } = useMemo(
    () => filterAndPaginate<File>(files, search, currentPage),
    [files, search, currentPage]
  );

  async function fetchFiles() {
    setLoading(true);
    try {
      type ApiOk = { success: true; total: number; data: File[] };
      type ApiErr = { success: false | undefined; detail: string | object };
      const response = await backendRequest<ApiOk, ApiErr>(
        "GET",
        "/custom-leads-files"
      );

      if ("success" in response && response.success === true && Array.isArray(response.data)) {
        setFiles(response.data);
      } else {
        console.error("Unexpected response when fetching files:", response);
        setFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  const confirmDeleteFile = (id: number) => {
    setFileToDelete(id);
    setShowModal(true);
  };

  async function deleteFile() {
    if (fileToDelete === null) return;

    try {
      const response = await backendRequest("DELETE", `/custom-leads-file/${fileToDelete}`);
      notifyResponse(response);
      if (response.success) {
        setFiles((oldFiles) =>
          oldFiles.filter((file) => file.id !== fileToDelete)
        );
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setShowModal(false);
      setFileToDelete(null);
    }
  }

  // No sync controls for custom leads files

  useEffect(() => {
    fetchFiles();
  }, []);

  const uploadFile = () => {
    navigate("/files");
  };

  // No copy handler needed for custom leads files

  if (loading) return <Loading />;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-2xl font-medium sm:font-bold">
          Lead Files
        </h2>
        <div className="flex gap-4 sm:gap-8">
          <div className="relative flex items-center w-full md:w-auto">
            <FaSearch className="absolute left-4 text-base sm:text-lg text-gray-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setCurrentPage(1);
              }}
              placeholder="Search...."
              className="w-full pl-12 pr-4 py-2 text-sm sm:text-base sm:py-2.5 rounded-lg border border-primary outline-none sm:w-auto"
            />
          </div>
          <button
            onClick={uploadFile}
            className="flex items-center justify-center w-24 sm:w-32 md:w-40 py-2 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 space-x-2"
          >
            <span className="hidden sm:block">Upload Lead</span>
            <MdOutlineFileUpload />
          </button>
        </div>
      </div>
      <Card>
        <div className="overflow-auto">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left text-sm font-medium">ID</th>
                <th className="p-4 text-left text-sm font-medium">Name</th>
                <th className="p-4 text-left text-sm font-medium">Type</th>
                <th className="p-4 text-left text-sm font-medium">Created</th>
                <th className="p-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((file: File) => (
                <tr className="border-b hover:bg-gray-50" key={file.id}>
                  <td className="p-4 align-middle">{file.id}</td>
                  <td className="p-4 align-middle">
                    <span className="font-semibold text-sm sm:text-base text-gray-800">
                      {file.name}
                    </span>
                  </td>
                  <td className="p-4 align-middle">{file.type}</td>
                  <td className="p-4 align-middle w-100 whitespace-nowrap">
                    {file.created_at ? FormateTime(file.created_at) : "N/A"}
                  </td>
                  <td className="p-4 align-middle text-end flex items-center space-x-6 justify-end">
                    <Link
                      to={`/leads?file_id=${file.id}`}
                      className="transition-transform duration-200 hover:scale-110"
                      title="View Leads"
                    >
                      <TbEye className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => confirmDeleteFile(file.id)}
                      className="text-red-500 transition-transform duration-200 hover:scale-110"
                      title="Delete File"
                    >
                      <TbTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={100} className="text-center p-2">
                    No files found. Upload a new file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <PageNumbers
        pageNumbers={pageNumbers}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagesCount={pagesCount}
      />
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deleteFile}
        message="Are you sure you want to delete this file? This action cannot be undone."
      />
    </>
  );
}
