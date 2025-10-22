import { useEffect, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { RiDeleteBin6Line } from "react-icons/ri";
import { notifyResponse } from "../Helpers/notyf";
import ConfirmationModal from "./ConfirmationModal";
import { MdOutlineFileUpload } from "react-icons/md";
import { useNavigate } from "react-router-dom";



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

export const ViewDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
    const navigate = useNavigate()
    const fetchDocuments = async () => {
        try {
            const response = await backendRequest<Document[], []>("GET", "/knowledge-base-files");
            setDocuments(response);
        } catch (error) {
            console.error("Fetch documents error:", error);
        }
    };

    const confirmDeleteDocument = (id: string) => {
        setDocumentToDelete(id);
        setShowModal(true);
    };

    const deleteDocument = async () => {

        if (!documentToDelete) {
            setShowModal(false)
            return notifyResponse({ success: false, detail: "File is not found" });
        }
        try {
            const response = await backendRequest("DELETE", `/knowledge-base-files/${documentToDelete}`);
            notifyResponse(response);
            if (response.success) {
                fetchDocuments();
            } else {
                console.error("Delete failed:", response);
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setShowModal(false);
            setDocumentToDelete(null);
        }
    };

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
    const uploadFile = () => {
        navigate("/documents/upload")
    }
    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div>


            <div className="bg-white p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">

                    <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
                        Documents
                    </h1>

                    <button
                        onClick={uploadFile}
                        className="flex items-center justify-center w-full  sm:w-32 md:w-40 py-2 px-4 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 space-x-2"
                    >
                        <span>Upload Files</span>
                        <MdOutlineFileUpload />
                    </button>

                </div>


                <div className="space-y-4 pb-4">
                    {documents.length > 0 ? (
                        documents.map((doc, index) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 border-b-2">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h2 className="text-sm sm:text-base font-normal text-primary">
                                            {getDisplayFilename(doc.filename)}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Uploaded at: {formatDate(doc.upload_date)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="text-red-500 hover:text-red-700 transition"
                                    onClick={() => confirmDeleteDocument(doc.vapi_id)}
                                    title="Delete Document"
                                >
                                    <RiDeleteBin6Line />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center p-2 text-gray-500">No files uploaded yet.</p>
                    )}
                </div>
            </div>

            <ConfirmationModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={deleteDocument}
                message="Are you sure you want to delete this document? This action cannot be undone"
            />
        </div>
    );
};
