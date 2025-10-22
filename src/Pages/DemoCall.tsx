import React, { useEffect, useState } from 'react';
import { backendRequest } from '../Helpers/backendRequest';
import { notifyResponse } from '../Helpers/notyf';

interface FormData {
  first_name: string;
  // last_name: string;
  email: string;
  // add_date: string;
  mobile_no: string;
  // custom_field_01: string;
  // custom_field_02: string;
}

// interface DemoPhoneCallProps {
//   onSubmit: (data: FormData, action: 'phoneCall' | 'testCall') => void;
//   onClose: () => void;
// }

const initialForm = {
  first_name: '',
  // last_name: '',
  email: '',
  // add_date: '',
  mobile_no: '',
  // custom_field_01: '',
  // custom_field_02: '',
}

const DemoPhoneCall = () => {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [loading,setLoading] = useState(false)
  const [nameFromUrl, setNameFromUrl] = useState<string | null>(null);
  
  // const [actionType, setActionType] = useState<'testCall' | 'phoneCall'>('testCall');

  const isFormValid = (): boolean => {
    const isValid =
      formData.first_name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.mobile_no.trim() !== '';
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleAction = (action: 'phoneCall' | 'testCall') => {
  //   if (isFormValid()) {
  //     setActionType(action);
  //     onSubmit(formData, action);
  //   } else {
  //     console.warn('Form is invalid');
  //   }
  // };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    setNameFromUrl(name);
  }, [window.location.search]); 

  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      const queryParam = nameFromUrl ? `?name=${nameFromUrl}` : '';
      const response = await backendRequest(
        'POST',
        `/demo-phone-call/ea931a77-f129-45ac-b09c-42b8058f1899/${formData.mobile_no}${queryParam}`,
        formData
      );
      notifyResponse(response);
      setLoading(false);
    } catch {
      console.log('Error in handleFormSubmit:');
      setLoading(false);
    }
  };


  return (
    <div>
       
    <div className=" flex flex-col justify-center items-center md:p-12 bg-gray-100 min-h-screen ">
    <div className="mb-8 mt-5 md:mt-0">
                    <img src="/images/wellness-voice-ai-horizontal.png" alt="wellness Voice AI Logo" className="h-14" />
                </div>
      <div className="bg-white py-6 px-6 md:px-10 rounded-lg  max-w-full md:max-w-4xl w-full   relative">

        <h2 className="text-xl md:text-2xl font-semibold sm:font-bold mb-6 text-primary">Enter Call Details</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
          <div className="flex flex-col">
            <label className="mb-2 text-xs sm:text-base text-gray-700 font-semibold">Full Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2.5"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-xs sm:text-base text-gray-700 font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2.5"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-xs sm:text-base text-gray-700 font-semibold">Mobile No</label>
            <input
              type="text"
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleChange}
              placeholder="Enter Mobile No"
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2.5"
            />
          </div>

          {/* <div className="flex flex-col">
            <label className="mb-2 text-xs sm:text-base text-gray-700 font-semibold">Acquisition Date</label>
            <input
              type="date"
              name="add_date"
              value={formData.add_date}
              onChange={handleChange}
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-xs sm:text-base text-gray-700 font-semibold">Custom Field 01</label>
            <input
              type="text"
              name="custom_field_01"
              value={formData.custom_field_01}
              onChange={handleChange}
              placeholder="Custom Field 01"
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-xs sm:text-base text-gray-700 font-semibold">Custom Field 02</label>
            <input
              type="text"
              name="custom_field_02"
              value={formData.custom_field_02}
              onChange={handleChange}
              placeholder="Custom Field 02"
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div> */}


        </div>

        <div className="md:col-span-2 mt-8 flex justify-end space-x-4">
          {/* <button
            className="border bg-white text-gray-950 text-xs sm:text-base border-primary hover:bg-primary hover:text-white py-1.5 sm:py-2 px-4 rounded-md transition duration-300"
            // onClick={onClose}
          >
            Cancel
          </button> */}
          {/* <button
            type="button"
            className={`bg-primary text-white py-2 text-xs sm:text-base sm:py-2 px-4 rounded-md transition duration-300 ${
              isFormValid() ? 'hover:bg-[#005b89]' : 'opacity-50 cursor-not-allowed'
            }`}
            // onClick={() => handleAction('testCall')}
            disabled={!isFormValid()}
          >
            Make Test Call
          </button> */}
          <button
            type="button"
            className={`bg-primary text-white py-2 text-xs sm:text-base sm:py-2 px-4 rounded-md transition duration-300 ${
              (isFormValid() || loading )  ? 'hover:bg-[#005b89]' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={handleFormSubmit}
            disabled={!isFormValid() || loading}
          >
            Make Phone Call
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DemoPhoneCall;
