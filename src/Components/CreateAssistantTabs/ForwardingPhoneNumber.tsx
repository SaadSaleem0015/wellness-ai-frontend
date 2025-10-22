import React, { useState, useEffect } from 'react';
import { backendRequest } from '../../Helpers/backendRequest';

interface AssistantData {
  forwardingPhoneNumber?: string;
  attached_Number?: string; 
  endCallPhrases?: string[];
}
interface User {
  username: string;
  email: string;
}

interface PurchasedNumber {
  friendly_name: string;
  phone_number: string;
  user: User;
  date_purchased: string;
  attached?: boolean;
  attached_assistant: number;
}
interface TranscribeProps {
  assistantData: AssistantData;
  handleChange: (key: keyof AssistantData, value: string | string[]) => void;
}

const ForwardingPhoneNumber: React.FC<TranscribeProps> = ({ assistantData, handleChange }) => {
  const [purchasedNumbers, setPurchasedNumbers] = useState<PurchasedNumber[]>([]);
  
  useEffect(() => {
    fetchPurchasedNumbers();
  }, []);

  const fetchPurchasedNumbers = async () => {
    try {
      const response = await backendRequest<PurchasedNumber[]>('GET', '/get-purchased-and-vv-numbers');
      setPurchasedNumbers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching purchased numbers:', error);
    }
  };

  const handleEndCallPhrasesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleChange('endCallPhrases', [value]);
  };
  console.log("assistantData.attached_Number",assistantData.attached_Number);
  
  return (
    <div className="bg-white text-gray-800 p-1 sm:p-4">
      <div className="w-full mx-auto rounded-lg">
        <h1 className="text-2xl font-bold text-primary mb-2">Phone Number</h1>
        <p className="text-gray-500 text-sm mb-3">This section allows you to configure the phone settings for the assistant.</p>
        <hr className="bg-gray-200 pt-[.8px] mb-5" />

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forwarding Phone Number</label>
            <input
              type="text"
              placeholder="Enter Forwarding number"
              value={assistantData.forwardingPhoneNumber}
              onChange={(e) => handleChange('forwardingPhoneNumber', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Call Phrases</label>
            <textarea
              value={assistantData.endCallPhrases || ''}
              rows={1}
              placeholder="Phrases that if spoken by the bot will end the call. Eg: goodbye"
              onChange={handleEndCallPhrasesChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attach Number</label>
            <select
              value={assistantData.attached_Number || ''}
              onChange={(e) => handleChange('attached_Number', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="" disabled>Choose a number...</option>
              {purchasedNumbers
                 
                .map(number => (
                  <option key={number.phone_number} value={number.phone_number}>
                   {number.phone_number}  {!number.attached_assistant ? "" :" {Attached} "}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <hr className="bg-gray-200 pt-[.8px] mb-5" />
      </div>
    </div>
  );
};

export default ForwardingPhoneNumber;
