import React, { useState } from 'react';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  add_date: string;
  mobile_no: string;
  custom_field_01: string;
  custom_field_02: string;
}

interface CallFormProps {
  onSubmit: (data: FormData, action: 'phoneCall' | 'testCall') => void;
  onClose: () => void;
}

const CallForm: React.FC<CallFormProps> = ({ onSubmit, onClose }) => {
  const [actionType, setActionType] = useState<'testCall' | 'phoneCall'>('testCall');

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    add_date: '',
    mobile_no: '',
    custom_field_01: '',
    custom_field_02: '',
  });


  const isFormValid = (): boolean => {
    const isValid =
      formData.first_name.trim() !== '' &&
      formData.last_name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.add_date.trim() !== '' &&
      formData.mobile_no.trim() !== '';
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAction = (action: 'phoneCall' | 'testCall') => {

    // console.log({action})
    if (isFormValid()) {
      setActionType(action);
      onSubmit(formData, action);
    } else {
      console.warn('Form is invalid');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center p-12 z-50">
      <div className="bg-white py-6 px-6 md:px-10 rounded-lg shadow-lg max-w-full md:max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-500 hover:text-red-500 text-4xl focus:outline-none"
          aria-label="Close Form"
        >
          &times;
        </button>
        <h2 className="text-xl md:text-2xl font-semibold sm:font-bold mb-6 text-primary">Enter Call Details</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-2 text-xs sm:text-base text-gray-700 font-semibold">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-xs sm:text-base text-gray-700 font-semibold">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
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
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
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
              className="border text-xs sm:text-base border-gray-400 focus:border-primary focus:ring-primary focus:outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col">
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
          </div>
        </div>

        <div className="md:col-span-2 mt-8 flex justify-end space-x-4">
          <button
            className="border bg-white text-gray-950 text-xs sm:text-base border-primary hover:bg-primary hover:text-white py-1.5 sm:py-2 px-4 rounded-md transition duration-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`bg-primary text-white py-2 text-xs sm:text-base sm:py-2 px-4 rounded-md transition duration-300 ${
              isFormValid() ? 'hover:bg-[#005b89]' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => handleAction('testCall')}
            disabled={!isFormValid()}
          >
            Make Test Call
          </button>
          <button
            type="button"
            className={`bg-primary text-white py-2 text-xs sm:text-base sm:py-2 px-4 rounded-md transition duration-300 ${
              isFormValid() ? 'hover:bg-[#005b89]' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => handleAction('phoneCall')}
            disabled={!isFormValid()}
          >
            Make Phone Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallForm;
