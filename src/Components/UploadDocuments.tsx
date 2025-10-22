import React, { ChangeEvent, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { TbUpload } from "react-icons/tb";
import { FcCheckmark } from "react-icons/fc";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { notifyResponse } from "../Helpers/notyf";
import { useNavigate } from "react-router-dom";

export interface UploadFileProps {
    onSuccess?: (response: object) => void;
    onStart?: () => void;
}



export const UploadDocuments: React.FC<UploadFileProps> = ({ onSuccess, onStart }) => {
    const [fileName, setFileName] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [fileUploaded, setFileUploaded] = useState<boolean>(false);

const navigate = useNavigate()
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            setFile(e.currentTarget.files[0]);
            setFileUploaded(true);
        } else {
            setFile(null);
            setFileUploaded(false);
        }
    };

    const resetFileSelection = () => {
        setFile(null);
        setFileUploaded(false);
        setFileName("");
    };

    const upload = async () => {
        if (!file || !fileName) {
            notifyResponse({ success: false, detail: "Please provide both a file and a file name" });
            return;
        }

        if (onStart) onStart();

        const data = new FormData();
        data.append("file", file);
        data.append("name", fileName);

        try {
            const response = await backendRequest("POST", "/upload", data, {}, true);
            notifyResponse(response);
            if (response.success && onSuccess) {
                onSuccess(response);
                navigate("/documents")
                resetFileSelection();
            } else {
                console.error("Upload failed:", response);
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    return (
        <div>
            <div className="bg-white mx-auto my-8 p-5 sm:p-10 rounded-lg w-full">
                <div className="flex flex-col items-center w-full">
                    <div className="mb-4 w-full flex flex-col items-center justify-center gap-4 p-10 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition relative">
                        <label
                            className="w-full flex flex-col items-center justify-center text-center cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf, .doc, .docx" />
                            <div className="text-primary text-3xl sm:text-5xl flex justify-center items-center">
                                {fileUploaded ? <FcCheckmark /> : <TbUpload />}
                            </div>
                            <div className="text-gray-500">
                                {fileUploaded && file ? (
                                    <>
                                        <span>File Selected:</span>{" "}
                                        <span className="font-semibold">{file.name}</span>
                                    </>
                                ) : (
                                    <span className="text-sm sm:text-base">Drop file here or click to select a file...</span>
                                )}
                            </div>
                        </label>

                        {fileUploaded && file && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    resetFileSelection();
                                }}
                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none"
                            >
                                <AiOutlineCloseCircle className="text-2xl" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col mt-4 w-full">
                        <label className="block text-sm font-medium mb-2">List Name:</label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="Enter List Name..."
                            className="p-1.5 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={upload}
                        className="w-24 sm:w-32 md:w-40 lg:w-48 py-2 sm:py-3 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    >
                        Upload
                    </button>
                </div>
            </div>

          

        
        </div>
    );
};
