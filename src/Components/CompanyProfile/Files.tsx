import { useEffect, useMemo, useState } from "react";
import { backendRequest } from "../../Helpers/backendRequest";
import { Card } from "../../Components/Card";
import { TbEye, TbTrash } from "react-icons/tb";
import { Link } from "react-router-dom";
import { notifyResponse } from "../../Helpers/notyf";
import { formatDate } from "../../Helpers/date.helper";
import { PageNumbers } from "../../Components/PageNumbers";
import { filterAndPaginate } from "../../Helpers/filterAndPaginate";
import { FaSearch } from "react-icons/fa";

export interface File {
    id: number;
    name: number;
    user_id: number;
    company_name: string;
    updated_at: string;
    user: {
        email: string;
        type: string;
        company_id: number
    };
}


export function AdminFiles({ company_id }:any) {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<File[]>([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const {
        filteredItems: filteredFiles,
        pagesCount,
        pageNumbers,
    } = useMemo(() => {
            return filterAndPaginate(files, search, currentPage, 6, 7);
    }, [files, search, currentPage]);

    async function fetchFiles() {
        setLoading(true);
       try {
         const response = await backendRequest<File[], []>(
             "GET",
             `/all_leads/all_files/${company_id}`
         );
 
         setFiles(
             response.filter(
                 (file) => file.user.email != localStorage.getItem("email")
             )
         );
         setLoading(false);
       } catch (error) {
        setLoading(false)
       }
       finally{
        setLoading
       }
    }



    async function deleteFile(file_id: number) {
        const response = await backendRequest("DELETE", `/files/${file_id}`);
        notifyResponse(response);
        if (response.success) {
            setFiles((oldFiles) => oldFiles?.filter((file) => file.id !== file_id));
        }
    }

    useEffect(() => {
        fetchFiles();
    }, [company_id]);


    return (
        <>
            <div>
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Files</h1>

                    <div className="flex flex-col md:flex-row gap-5 w-full md:w-auto">
                        <div className="relative flex items-center w-full md:w-auto">
                            <FaSearch className="absolute left-4 text-lg text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search Files..."
                                value={search}
                                onChange={(e) => setSearch(e.currentTarget.value)}
                                id="search"
                                aria-label="Search files"
                                className="border text-sm md:text-base border-gray-400 text-gray-900 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none block w-full md:w-64 pl-10 py-2"
                            />
                        </div>


                    </div>
                </div>

                <div className="overflow-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-sm md:text-md  bg-gray-50 border-b-2">
                                <td className="py-3 text-xs sm:text-base  px-4  font-bold">
                                    File
                                </td>
                                <td className="py-3 text-xs sm:text-base   font-bold">
                                    Account Name
                                </td>
                                <td className="py-3 text-xs sm:text-base   font-bold">
                                    Uploaded at
                                </td>

                                <td className="py-3 text-xs sm:text-base  px-2 md:px-6 font-bold"></td>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-2">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredFiles.length > 0 ? (
                                filteredFiles.map((file) => (
                                    <tr className="border-b" key={file.id}>
                                        <td className="p-4 text-xs sm:text-base align-middle">
                                            {file.name}
                                        </td>
                                        <td className="text-xs sm:text-base userName">
                                            {file.company_name}
                                        </td>
                                        <td className="text-xs sm:text-base userName">
                                            {file.updated_at && formatDate(file.updated_at)}
                                        </td>

                                        <td className="p-4 align-middle text-end">
                                            <Link
                                                to={`/admin/leads?file_id=${file.id}`}
                                                className="sm:mr-4 inline-block"
                                            >
                                                <TbEye />
                                            </Link>
                                            <button
                                                className="text-red-600"
                                                onClick={() => deleteFile(file.id)}
                                            >
                                                <TbTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-2">
                                        No files found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <PageNumbers
                pageNumbers={pageNumbers}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pagesCount={pagesCount}
            />
        </>
    );
}
