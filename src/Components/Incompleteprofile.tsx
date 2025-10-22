import { useState } from "react";
import { ArrowLeft, Search, User, Mail, Clock, Shield, Trash2, X, AlertTriangle } from "lucide-react";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";

interface IncompleteProfile {
    id: number;
    name: string;
    email: string;
    email_confirmed: boolean;
    is_active: boolean;
    main_admin: boolean;
    created_at: string;
}

interface InCompleteProfilesProps {
    profiles: IncompleteProfile[];
    onClose: () => void;
    setIncompleteProfiles: any;
}

const Card = ({ children, className = "" }: { children: any, className: any }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
        {children}
    </div>
);

export default function InCompleteProfiles({ profiles, onClose, setIncompleteProfiles }: InCompleteProfilesProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<IncompleteProfile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const profilesPerPage = 6;

    const filteredProfiles = profiles.filter(profile =>
        (profile.name?.toLowerCase().includes(search.toLowerCase()) || '') ||
        profile.email.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLastProfile = currentPage * profilesPerPage;
    const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
    const currentProfiles = filteredProfiles.slice(indexOfFirstProfile, indexOfLastProfile);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);



    const handleDeleteClick = (profile: IncompleteProfile) => {
        setUserToDelete(profile);
        setShowDeleteModal(true);
    };

    const deleteUser = async () => {
        if (!userToDelete) {
            setShowDeleteModal(false);
            return notifyResponse({ success: false, detail: "User not found" });
        }

        setIsDeleting(true);
        try {
            const response = await backendRequest("DELETE", `/delete_user/${userToDelete.id}`);
            notifyResponse(response);
            if (response.success) {
                setIncompleteProfiles((prev: any) => prev.filter(profile => profile.id !== userToDelete.id));
            } else {
                console.error("Delete failed:", response);
            }

        } catch (error) {
            console.error("Delete error:", error);
            notifyResponse({ success: false, detail: "Network error occurred" });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };

    const closeDeleteModal = () => {
        if (!isDeleting) {
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
            <Card className="overflow-hidden">
                <div className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-6 border-b border-gray-200">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                            Incomplete Profiles
                        </h2>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-700 font-medium border border-gray-200 hover:border-gray-300 w-fit"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </div>
                    <div className="relative mt-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search profiles by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 text-sm md:text-base"
                        />
                    </div>

                    {profiles.length === 0 ? (
                        <div className="text-center py-12 md:py-16">
                            <div className="bg-gray-50 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4">
                                <User className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No incomplete profiles found</h3>
                            <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">There are currently no standalone incomplete profiles in the system.</p>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <div className="overflow-y-scroll border border-gray-200 rounded-xl" style={{
                                overflowY: 'scroll',
                                scrollbarWidth: 'thin',
                                msOverflowStyle: 'none',
                            }}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Account Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                        </tr>

                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentProfiles.map((profile) => (
                                            <tr key={profile.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">

                                                        <span className="text-sm font-medium text-gray-900">
                                                            {profile.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-700">{profile.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${profile.email_confirmed
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {profile.email_confirmed ? 'Confirmed' : 'Pending'}
                                                        </span>

                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(profile.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${profile.main_admin
                                                        ? 'bg-blue-100 text-primary'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        <Shield className="h-3 w-3" />
                                                        {profile.main_admin ? 'Main Admin' : 'Regular'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleDeleteClick(profile)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-lg transition-colors duration-200 text-sm font-medium border border-red-200 hover:border-red-300"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>


                            {filteredProfiles.length > profilesPerPage && (
                                <div className="flex justify-center mt-8">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <button
                                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <span className="hidden sm:inline">Previous</span>
                                            <span className="sm:hidden">‹</span>
                                        </button>

                                        <div className="flex gap-1">
                                            {Array.from({ length: Math.ceil(filteredProfiles.length / profilesPerPage) }).map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => paginate(index + 1)}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === index + 1
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => paginate(Math.min(Math.ceil(filteredProfiles.length / profilesPerPage), currentPage + 1))}
                                            disabled={currentPage === Math.ceil(filteredProfiles.length / profilesPerPage)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === Math.ceil(filteredProfiles.length / profilesPerPage)
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <span className="hidden sm:inline">Next</span>
                                            <span className="sm:hidden">›</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>


            {showDeleteModal && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 rounded-full p-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                                </div>
                                <button
                                    onClick={closeDeleteModal}
                                    disabled={isDeleting}
                                    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-600 mb-3">
                                    Are you sure you want to delete this user? This action cannot be undone.
                                </p>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">{userToDelete.name || 'N/A'}</div>
                                        <div className="text-gray-600">{userToDelete.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={closeDeleteModal}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={deleteUser}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4" />
                                            Delete User
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}