import { useState, useEffect, useMemo } from 'react';
import { FaEye, FaTrash, FaSpinner, FaTimes, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import ChatDetail from '../Components/ChatDetail';
import { backendRequest } from '../Helpers/backendRequest';
import { filterAndPaginate } from '../Helpers/filterAndPaginate';
import { PageNumbers } from '../Components/PageNumbers';
import ChatSettings from '../Components/ChatSetting';

interface Chat extends Record<string, unknown> {
  phone_number: string;
  first_message: string;
  first_answer: string;
  created_at: string;
  updated_at: string;
}

const ChatList = () => {
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'settings'>('list');
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [phoneNumberToDelete, setPhoneNumberToDelete] = useState<string>('');

  // Fetch chats from API with polling
  useEffect(() => {
    const fetchChats = async (showLoading: boolean = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        const messageList = await backendRequest<Chat[]>("GET", "/chats");
        
        // Check if the response has success property (error response)
        if (messageList && typeof messageList === 'object' && 'success' in messageList && !messageList.success) {
          throw new Error('Failed to fetch chats');
        }
        
        // Handle array response directly or extract from response object
        if (Array.isArray(messageList)) {
          setChats(messageList);
        } else if (messageList && typeof messageList === 'object' && 'data' in messageList) {
          setChats((messageList as any).data);
        } else {
          setChats([]);
        }
        
        setError('');
      } catch (err) {
        setError('Failed to load chats');
        console.error('Error fetching chats:', err);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

    // Initial fetch with loading
    fetchChats(true);

    // Set up polling every 30 seconds without loading
    const intervalId = setInterval(() => {
      fetchChats(false);
    }, 30000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleViewChat = (phoneNumber: string) => {
    setSelectedPhoneNumber(phoneNumber);
    setCurrentView('detail');
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
  };

  const handleDeleteClick = (phoneNumber: string) => {
    setPhoneNumberToDelete(phoneNumber);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!phoneNumberToDelete) return;
    
    try {
      await backendRequest("DELETE", `/chats/${phoneNumberToDelete}`);
      
      // Update local state
      const updatedChats = chats.filter(chat => chat.phone_number !== phoneNumberToDelete);
      setChats(updatedChats);
      
      // Reset to first page if current page becomes empty after deletion
      const filteredCount = updatedChats.filter(chat => {
        const searchLower = search.toLowerCase();
        return Object.values(chat).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchLower)
        );
      }).length;
      
      if (filteredCount === 0 && currentPage > 1) {
        setCurrentPage(Math.max(1, currentPage - 1));
      }
      
      // Close modal and reset
      setShowDeleteModal(false);
      setPhoneNumberToDelete('');
    } catch (err) {
      console.error('Error deleting chat:', err);
      alert('Failed to delete chat');
      setShowDeleteModal(false);
      setPhoneNumberToDelete('');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPhoneNumberToDelete('');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPhoneNumber('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Pagination and filtering
  const { filteredItems, pagesCount, pageNumbers } = useMemo(
    () => filterAndPaginate<Chat>(chats, search, currentPage, 10),
    [chats, search, currentPage]
  );
  
  const filteredChats = filteredItems as Chat[];

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // If we're in detail view, show ChatDetail component
  if (currentView === 'detail') {
    return (
      <ChatDetail 
        phoneNumber={selectedPhoneNumber} 
        onBack={handleBackToList}
      />
    );
  }

  // If we're in settings view, show ChatSettings component
  if (currentView === 'settings') {
    return (
      <ChatSettings
        onBack={handleBackToList}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-poppins">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-poppins">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-hoverdPrimary text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-poppins">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Chat Conversations</h1>
                <p className="text-white mt-1">Manage and view all customer conversations</p>
              </div>
              <button
                onClick={handleSettingsClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-white hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                <FaCog className="mr-2" />
                Chat Assistant Settings
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by phone number, message, or response..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    First Message
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    First Response
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChats.map((chat, index) => (
                  <tr 
                    key={`${chat.phone_number}-${index}`} 
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {String(chat.phone_number)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">
                        {truncateText(String(chat.first_message))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">
                        {truncateText(String(chat.first_answer))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(String(chat.updated_at))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewChat(String(chat.phone_number))}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-hoverdPrimary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <FaEye className="mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteClick(String(chat.phone_number))}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredChats.length === 0 && chats.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-500">When customers start chatting, they'll appear here.</p>
            </div>
          )}

          {/* No Search Results */}
          {filteredChats.length === 0 && chats.length > 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
              <p className="text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {filteredChats.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <PageNumbers
                pageNumbers={pageNumbers}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pagesCount={pagesCount}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-red-50 rounded-t-2xl px-6 py-5 border-b border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-3 rounded-full">
                    <FaExclamationTriangle className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Delete Conversation</h3>
                    <p className="text-sm text-gray-600 mt-0.5">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Close modal"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <p className="text-gray-700 mb-1">
                Are you sure you want to delete the conversation with
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-4 break-all">
                {phoneNumberToDelete}
              </p>
              <p className="text-sm text-gray-500">
                All messages and conversation history will be permanently deleted.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center space-x-2"
              >
                <FaTrash className="w-4 h-4" />
                <span>Delete Conversation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;