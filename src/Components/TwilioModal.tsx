import React from "react";
import { BiPhoneCall } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";

interface Field {
  label: string;
  type: string;
  placeholder: string;
}

interface TwilioModalProps {
  showModal: string;
  handleCloseModal: () => void;
  title: string;
  fields: Field[];
  buttonText: string;
  onSubmit: (values: Record<string, string>) => void;
}

const TwilioModal: React.FC<TwilioModalProps> = ({
  showModal,
  handleCloseModal,
  title,
  fields,
  onSubmit,
  buttonText,
}) => {
  const [areaCode, setAreaCode] = React.useState("");

  const handleAreaCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAreaCode(e.target.value);
  };


  const handleSubmit = () => {
    onSubmit({
      area_code: areaCode,
      country: "US"
    });
    handleCloseModal();
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 px-2 sm:px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-md lg:max-w-lg mx-auto transform transition-all duration-300 hover:shadow-3xl">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <BiPhoneCall className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {title}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              >
                <IoMdClose className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-gray-700 group-hover:rotate-90 transition-all duration-200" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-6">
              <div className="space-y-4">
                {fields?.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.label}
                      placeholder={field.placeholder}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 text-gray-800"
                      onChange={handleAreaCodeChange}
                      value={areaCode}
                    />
                  </div>
                ))}
              </div>

         
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
              <button
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-white bg-primary hover:bg-primary/90 text-white"`}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TwilioModal;
