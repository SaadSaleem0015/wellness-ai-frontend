import React, { useState } from 'react';
import { FaRobot, FaMicrophone } from 'react-icons/fa'; 

import AvailableNumbers from '../Components/GetNumberTabs/AvailableNumbers';
import PurchasedNumbers from '../Components/GetNumberTabs/PurchasedNumbers';

const GetNumbers: React.FC = () => {
  const [activeTab, setActiveTab] = useState('PurchasedNumbers');

  return (
    <div className=" bg-white text-gray-900 pt-0 p-2 sm:p-4">
      <div className="flex flex-wrap md:justify-start space-x-2 md:space-x-4 border-b pb-4 overflow-auto mt-2">
       

        <button
          onClick={() => setActiveTab('PurchasedNumbers')}
          className={`py-1.5 sm:py-3 px-2 sm:px-4  text-sm sm:text-base flex items-center sm:space-x-2 gap-2 ${
            activeTab === 'PurchasedNumbers' ? 'rounded bg-primary text-white' : 'text-gray-700'
          }`}
        >
          <FaMicrophone /> <span>Active Numbers</span>
        </button>
        <button
          onClick={() => setActiveTab('AvailableNumbers')}
          className={` py-1.5 sm:py-3 px-2 sm:px-4  text-sm sm:text-base flex items-center sm:space-x-2 gap-2 ${
            activeTab === 'AvailableNumbers' ? 'rounded bg-primary text-white' : 'text-gray-700'
          }`}
        >
          <FaRobot /> <span>Available Numbers</span>
        </button>
      </div>

      <div className="sm:mt-4">
        {activeTab === 'AvailableNumbers' && (
          <div className="transition-all duration-300 ease-in-out">
            <AvailableNumbers />
          </div>
        )}
        {activeTab === 'PurchasedNumbers' && (
          <div className="transition-all duration-300 ease-in-out">
            <PurchasedNumbers />
          </div>
        )}
   
      </div>
    </div>
  );
};

export default GetNumbers;
