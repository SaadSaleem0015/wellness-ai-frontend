import React, { useState, useEffect } from 'react';
import { backendRequest } from '../../Helpers/backendRequest';
import { Loading } from '../Loading';
import { PageNumbers } from '../PageNumbers';
import { notifyResponse } from '../../Helpers/notyf';
import { formatDate } from '../../Helpers/date.helper';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface PurchasedNumber {
  friendly_name: string;
  phone_number: string;
  username: string;
  email: string;
  created_at: string;
  attached?: boolean;
  attached_assistant: number;
  company_name: string;
  user_id: number;
}



const PurchasedNumbers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [purchasedNumbers, setPurchasedNumbers] = useState<PurchasedNumber[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [returnNumber, setReturnNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [numberDeleteModel, setNumberDeleteModel] = useState<boolean>(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPurchasedNumbers();
  }, []);

  const fetchPurchasedNumbers = async () => {
    try {
      setLoading(true);
      const response = await backendRequest<PurchasedNumber[]>('GET', '/purchased_numbers');
      setLoading(false);
      setPurchasedNumbers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching purchased numbers:', error);
    }
  };



  const filteredNumbers = purchasedNumbers.filter(
    (num) =>
      num.phone_number.includes(search) ||
      num.friendly_name?.includes(search) ||
      num.username.includes(search)
  );

  const pagesCount = Math.ceil(filteredNumbers.length / itemsPerPage);
  const currentNumbers = filteredNumbers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);



  const handleReturnNumber = async () => {
    if (!returnNumber) return;
    try {
      const response = await backendRequest('POST', '/remove-phone-number', { phone_number: returnNumber });
      setNumberDeleteModel(false);
      notifyResponse(response);

      if (response.success) {
        setPurchasedNumbers((prevNumbers) => prevNumbers.filter((num) => num.phone_number !== returnNumber));
      }
    } catch (error) {
      console.error('Error removing number:', error);
    }
  };

  const handleRemoveNumber = (number: string) => {
    setReturnNumber(number);
    setNumberDeleteModel(true);
  };


  const closeModal = () => {
    setNumberDeleteModel(false);
  };




  return (
    <div className="bg-white text-gray-900 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-semibold sm:font-bold">Active Numbers</h1>
        </div>
        <div className="relative flex items-center w-full md:w-auto">
          <FaSearch className="absolute left-4 text-sm sm:text-lg text-gray-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setCurrentPage(1);
            }}
            placeholder="Search existing number ..."
            className="w-full pl-12 pr-4 py-1.5 text-sm sm:text-base sm:py-3.5 rounded-lg border border-primary outline-none sm:w-auto"
          />
        </div>
      </div>

      <div className="mt-8 overflow-auto mb-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left align-middle">
              <th className="p-2 text-sm sm:p-4 align-middle">Buyer</th>
              <th className="p-2 text-sm sm:p-4 align-middle">Phone Number</th>
              <th className="p-2 text-sm sm:p-4 align-middle">Buying Date</th>
              <th className="p-2 sm:p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  <Loading />
                </td>
              </tr>
            ) : currentNumbers.length > 0 ? (
              currentNumbers.map((num) => (
                <tr className="border-b" key={num.phone_number}>
                  <td className="p-2 text-sm sm:text-base sm:p-4 align-middle">
                    {num.username}
                  </td>
                  <td className="p-2 text-sm sm:text-base sm:p-4 align-middle">{num.phone_number}</td>
                  <td className="p-2 text-sm sm:text-base sm:p-4 align-middle">{formatDate(num.created_at)}</td>

                  <td className="p-4 align-middle flex flex-col sm:flex-row justify-end gap-3 text-sm">
                 
                    
                        <button
                          className="text-red-500 text-center mx-auto sm:mx-0"
                          onClick={() => handleRemoveNumber(num.phone_number)}
                        >
                          <FaTimes />
                        </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredNumbers.length > 0 && (
        <PageNumbers
          pageNumbers={Array.from({ length: pagesCount }, (_, i) => i + 1)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagesCount={pagesCount}
        />
      )}

 

  
      {/* Delete Number Modal */}
      {numberDeleteModel && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-6">
          <div className="bg-white pb-6 p-6 rounded-lg shadow-lg max-w-md w-full">
            <p className="text-xl mb-6">Are you sure you want to return this phone number?</p>
            <div className="flex justify-end gap-4 text-center">
              <button
                onClick={closeModal}
                className="bg-primary text-center hover:bg-[#006195] text-white font-semibold py-2 px-6 rounded-md w-20"
              >
                No
              </button>
              <button
                onClick={handleReturnNumber}
                className="bg-primary text-center hover:bg-[#006195] text-white font-semibold py-2 px-6 rounded-md w-24"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasedNumbers;
