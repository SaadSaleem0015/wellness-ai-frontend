import React, { useState, useEffect, ChangeEvent } from "react";
import { FiPlus } from "react-icons/fi";
import { MdSearch } from "react-icons/md";
import { backendRequest } from "../../Helpers/backendRequest";
import { notifyResponse } from "../../Helpers/notyf";
import { Input } from "../Input";
import { Loading } from "../Loading";
import { PageNumbers } from "../PageNumbers";
import TwilioModal from "../TwilioModal";
import ConfirmationModal from "../ConfirmationModal";
import { IoSearchOutline } from "react-icons/io5";

interface NumberCapabilities {
  voice: boolean;
  SMS: boolean;
}

interface PhoneNumber {
  friendly_name: string;
  phone_number: string;
  region: string;
  postal_code: string;
  iso_country: string;
  capabilities: NumberCapabilities;
}

const AvailableNumbers: React.FC = () => {
  const [showModal, setShowModal] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<PhoneNumber[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);


  const handleOpenModal = (type: string) => {
    setShowModal(type);
  };

  const handleCloseModal = () => {
    setShowModal("");
    setSelectedNumber(null);
  };

  const handleNumberBuyModal = (phoneNumber: string) => {
    setSelectedNumber(phoneNumber);
    setShowModal("BuyNumber");
  };

  const handleCheckboxChange = (phoneNumber: PhoneNumber, checked: boolean) => {
    setSelectedNumbers((prev: string[]) => {
      if (checked) {
        return [...prev, phoneNumber.phone_number];
      } else {
        return prev.filter((num: string) => num !== phoneNumber.phone_number);
      }
    });
    console.log(selectedNumbers);
  };

  const handleSelectAllNumbers = () => {
    if (selectedNumbers.length === availableNumbers.length) {
      setSelectedNumbers([]);
      console.log(selectedNumbers)
    } else {
      setSelectedNumbers(availableNumbers.map(num => num.phone_number));
    }
  };


  useEffect(() => { }, [selectedNumbers]);



  async function handleSubmit(values: Record<string, string>) {
    setLoading(true);
    try {
      console.log("Area code:", values.area_code);
      console.log("Country:", values.country);

      const response = await backendRequest<PhoneNumber[], []>(
        "POST",
        "/available_phone_numbers",
        { area_code: values.area_code, country: values.country || "US" }
      );

      if (Array.isArray(response)) {
        setAvailableNumbers(response);
        console.log("Found", response.length, "available numbers");
      }
    } catch (error) {
      console.error("Error fetching available numbers:", error);
    } finally {
      setLoading(false);
    }
  }


  async function handleBuyNumber() {
    if (!selectedNumber) return;
    setLoading(true);
    try {
      const response = await backendRequest("POST", "/purchase_phone_number", {
        phone_number: [selectedNumber],
      });
      notifyResponse(response);
      if (response.success) {
        setAvailableNumbers((prevNumbers) =>
          prevNumbers.filter((number) => number.phone_number !== selectedNumber)
        );
      }
    } catch (error) {
      console.error("Error purchasing phone number:", error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  }

  async function handleBuyNumbers() {
    if (selectedNumbers.length === 0) return;
    console.log(selectedNumbers);
    setLoading(true);
    try {
      const response = await backendRequest("POST", "/purchase_phone_number", {
        phone_number: selectedNumbers,
      });
      notifyResponse(response);
      if (response.success) {
        setAvailableNumbers((prevNumbers) =>
          prevNumbers.filter(
            (number) => !selectedNumbers.includes(number.phone_number)
          )
        );
        setSelectedNumbers([]);
      }
    } catch (error) {
      console.error("Error purchasing phone numbers:", error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  }

  const handleVvNumberGroupUse = async () => {
    try {
      const res = await backendRequest("POST", "/request-to-use-vvnumbers");
      notifyResponse(res);
    } catch (error) {
      console.log(error);
    } finally {
      setShowRequestModal(false);
    }
  };


  const itemsPerPage = 10;
  const filteredNumbers = availableNumbers?.filter(
    (num) =>
      num.phone_number.includes(search) || num.friendly_name.includes(search)
  );
  const pagesCount = Math.ceil(filteredNumbers.length / itemsPerPage);
  const pageNumbers = Array.from({ length: pagesCount }, (_, i) => i + 1);
  const currentNumbers: PhoneNumber[] = filteredNumbers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  if (loading) return <div className="mt-6 w-full flex justify-center items-center">Loading...</div>;

  return (
    <>
      <div className=" bg-white text-gray-900 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            {availableNumbers.length > 0 && (
              <div className="relative flex items-center w-full md:w-auto mt-4">
                <MdSearch className="absolute left-4 text-xl text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search available numbers..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-primary outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <button
              onClick={() => handleOpenModal("Numbers")}
              className="bg-primary hover:bg-hoverdPrimary text-xs md:text-base text-white font-semibold py-2  px-3 rounded-lg flex items-center gap-2"
            >
              <span className="lg:text-xl">
                <FiPlus />
              </span>{" "}
              Add New
            </button>
          </div>
        </div>
        {selectedNumbers.length > 0 && (
          <div className="flex justify-between items-center mt-4 p-4 bg-gray-100 border rounded-lg">
            <span className="font-semibold">
              Selected {selectedNumbers.length} numbers
            </span>
            <button
              onClick={() => handleOpenModal("ConfirmBuyNumbers")}
              className="bg-primary hover:bg-[#006195] text-white font-semibold py-2 px-6 rounded-lg"
            >
              Confirm Purchase
            </button>
          </div>
        )}
        <div className="mt-8 overflow-auto mb-6">
          <table className="min-w-full">
            <thead>
              <tr className="border-b text-left align-middle">
                <th className="p-2 sm:p-4 text-sm  align-middle">
                  <input type="checkbox" className="mr-1" onChange={handleSelectAllNumbers} checked={selectedNumbers.length === availableNumbers.length && availableNumbers.length > 0}
                  />
                  Select All
                </th>
                <th className="p-2 sm:p-4 text-sm  align-middle">
                  Phone Number
                </th>
                <th className="p-2 sm:p-4 text-sm  align-middle">
                  Region
                </th>
                <th className="p-2 sm:p-4 text-sm  align-middle">
                  Voice
                </th>
                <th className="p-2 sm:p-4 text-sm  align-middle">
                  SMS
                </th>
                <th className="p-2 sm:p-4 text-sm  align-middle"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center p-2 mt-5">
                    <Loading />
                  </td>
                </tr>
              ) : currentNumbers.length > 0 ? (
                currentNumbers.map((num) => (
                  <tr className="border-b" key={num.phone_number}>
                    <td className={`p-2 sm:p-4 text-sm sm:text-base align-middle`}>
                      <input
                        type="checkbox"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleCheckboxChange(num, e.target.checked)
                        }

                        checked={selectedNumbers.includes(num.phone_number)}
                      />
                    </td>

                    <td className="p-2 sm:p-4 text-sm sm:text-base align-middle">
                      {num.friendly_name}
                    </td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base align-middle">
                      {num.region || "N/A"}
                    </td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base align-middle">
                      {num.capabilities?.voice ? "Yes" : "No"}
                    </td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base align-middle">
                      {num.capabilities?.SMS ? "Yes" : "No"}
                    </td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base align-middle">
                      <button
                        className="bg-primary hover:bg-hoverdPrimary text-white font-semibold py-1.5 px-4 rounded"
                        onClick={() => handleNumberBuyModal(num.phone_number)}
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8">
                    <div className="w-full px-1 py-3">
                      <div className="max-w-4xl mx-auto">
                        <div className="text-center space-y-2 mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mx-auto text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 tracking-tight">
                            No available numbers found
                          </p>
                        </div>
                        <div className="bg-white rounded-2xl  overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <button
                              onClick={() => handleOpenModal('Numbers')}
                              className="flex-1 relative group px-6 py-4 text-primary font-medium  sm:border-r  hover:bg-primary/5 transition-colors duration-300"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-primary text-lg"><IoSearchOutline/></span>
                                </div>
                                <span className="text-sm">Search Numbers</span>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>


                           
                          </div>
                        </div>

                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredNumbers.length > 0 && (
          <PageNumbers
            pageNumbers={pageNumbers}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagesCount={pagesCount}
          />
        )}
      </div>

      {showModal === "Twilio" && (
        <TwilioModal
          showModal={"Twilio"}
          title="Add Twilio Credentials"
          fields={[
            {
              label: "Twilio SID",
              type: "text",
              placeholder: "Enter your Twilio SID",
            },
            {
              label: "Twilio Auth Token",
              type: "password",
              placeholder: "Enter your Twilio Auth Token",
            },
          ]}
          onSubmit={handleSubmit}
          handleCloseModal={handleCloseModal}
          buttonText={"Submit"}
        />
      )}

      {showModal === "Numbers" && (
        <TwilioModal
          showModal={"Numbers"}
          title="Search Phone Numbers"
          fields={[
            {
              label: "Enter Area Code",
              type: "text",
              placeholder: "Enter Area Code (e.g., 415, 469, 212)",
            },
          ]}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
          handleCloseModal={handleCloseModal}
          buttonText={"Search Numbers"}
        />
      )}

      {showModal === "BuyNumber" && selectedNumber && (
        <TwilioModal
          showModal={"BuyNumber"}
          title={`Confirm Purchase for ${selectedNumber}`}
          fields={[]}
          onSubmit={handleBuyNumber}
          handleCloseModal={handleCloseModal}
          buttonText={"Purchase"}
        />
      )}

      {showModal === "ConfirmBuyNumbers" && selectedNumbers && (
        <TwilioModal
          showModal={"ConfirmBuyNumbers"}
          title={`Confirm Purchase for ${selectedNumbers.length} Numbers`}
          fields={[]}
          onSubmit={handleBuyNumbers}
          handleCloseModal={handleCloseModal}
          buttonText={"Purchase"}
        />
      )}

      <ConfirmationModal
        show={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onConfirm={handleVvNumberGroupUse}
        message="Are you sure you want to use wellness voice numbers? This action cannot be undone."
      />
    </>
  );
};

export default AvailableNumbers;
