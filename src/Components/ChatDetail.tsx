import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaArrowLeft, FaUser, FaRobot, FaCalendar, FaSpinner } from 'react-icons/fa';
import { backendRequest } from '../Helpers/backendRequest';

interface ChatMessage {
  message: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

interface ChatHistory {
  history: ChatMessage[];
}

interface ChatDetailProps {
  phoneNumber: string;
  onBack: () => void;
}

const ChatDetail = ({ phoneNumber, onBack }: ChatDetailProps) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch chat history from API
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!phoneNumber) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Encode phone number for URL (replace + with %2B and handle other special characters)
        const encodedPhoneNumber = encodeURIComponent(phoneNumber);
        const response = await backendRequest<ChatHistory>("GET", `/chats/${encodedPhoneNumber}`);
        
        // Check if the response has success property (error response)
        if (response && typeof response === 'object' && 'success' in response && !response.success) {
          throw new Error('Failed to fetch chat history');
        }
        
        // Handle response - could be ChatHistory directly or wrapped in an object
        if (response && 'history' in response && Array.isArray(response.history)) {
          setChatHistory(response);
        } else if (response && typeof response === 'object' && 'data' in response) {
          setChatHistory((response as any).data);
        } else {
          // If response doesn't have history, create empty history
          setChatHistory({ history: [] });
        }
        
        setError('');
      } catch (err) {
        setError('Failed to load chat history');
        console.error('Error fetching chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [phoneNumber]);

  // Format date label for grouping (Today, Yesterday, or Month Day)
  const formatDateLabel = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare only dates
    const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Check if date is same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Group messages by date
  const groupMessagesByDate = (): Array<{ dateLabel: string; messages: ChatMessage[] }> => {
    if (!chatHistory?.history || chatHistory.history.length === 0) return [];

    const grouped: Array<{ dateLabel: string; messages: ChatMessage[] }> = [];
    let currentDateGroup: { date: Date; messages: ChatMessage[] } | null = null;

    for (const message of chatHistory.history) {
      const messageDate = new Date(message.created_at);
      
      if (currentDateGroup === null || !isSameDay(messageDate, currentDateGroup.date)) {
        // Save previous group if exists
        if (currentDateGroup !== null && currentDateGroup.messages.length > 0) {
          const prevDate = currentDateGroup.date;
          grouped.push({
            dateLabel: formatDateLabel(prevDate.toISOString()),
            messages: [...currentDateGroup.messages]
          });
        }
        // Start new group
        currentDateGroup = {
          date: messageDate,
          messages: [message]
        };
      } else if (currentDateGroup !== null) {
        // Add to current group
        currentDateGroup.messages.push(message);
      }
    }

    // Add last group
    if (currentDateGroup !== null && currentDateGroup.messages.length > 0) {
      const lastDate = currentDateGroup.date;
      grouped.push({
        dateLabel: formatDateLabel(lastDate.toISOString()),
        messages: [...currentDateGroup.messages]
      });
    }

    return grouped;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-poppins">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <FaArrowLeft className="mr-2" />
                Back to List
              </button>
              <div className="text-lg font-medium text-gray-600">Loading chat history...</div>
            </div>
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading conversation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-poppins">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <FaArrowLeft className="mr-2" />
                Back to List
              </button>
            </div>
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-hoverdPrimary text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-4 md:p-6 font-poppins">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl mb-6 overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium rounded-xl text-white hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 shadow-sm"
                >
                  <FaArrowLeft className="mr-2" />
                  Back
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Chat Conversation</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <FaUser className="text-white text-xs" />
                    </div>
                    <span className="text-base font-medium text-white/90">{phoneNumber}</span>
                  </div>
                </div>
              </div>
              <div className="text-right bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30">
                <div className="text-xs text-white/80 font-medium uppercase tracking-wide">Total Messages</div>
                <div className="text-3xl font-bold text-white mt-1">
                  {chatHistory?.history?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="space-y-6">
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-5">
              {/* Date Header */}
              <div className="flex items-center justify-center my-6">
                <div className="flex items-center space-x-3 px-5 py-2 bg-white rounded-full shadow-md border border-gray-200">
                  <FaCalendar className="text-primary text-sm" />
                  <span className="text-sm font-semibold text-gray-700">{group.dateLabel}</span>
                </div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-4">
                {group.messages.map((message, messageIndex) => (
                  <div key={messageIndex} className="space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="flex items-end space-x-3 max-w-[75%] md:max-w-[70%]">
                        <div className="flex-1"></div>
                        <div className="bg-gradient-to-br from-primary to-primary/90 text-white rounded-3xl rounded-br-md px-5 py-3.5 shadow-lg hover:shadow-xl transition-shadow duration-200">
                          <div className="text-sm leading-relaxed font-medium">{message.message}</div>
                        </div>
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-primary/90 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                          <FaUser className="text-white text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="flex items-end space-x-3 max-w-[75%] md:max-w-[70%]">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                          <FaRobot className="text-white text-xs" />
                        </div>
                        <div className="bg-white rounded-3xl rounded-bl-md px-5 py-3.5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                          <div className="text-sm text-gray-800 leading-relaxed">
                            <ReactMarkdown>
                              {message.answer || ''}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(!chatHistory?.history || chatHistory.history.length === 0) && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <div className="text-4xl">💬</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-500">There are no messages in this conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDetail;