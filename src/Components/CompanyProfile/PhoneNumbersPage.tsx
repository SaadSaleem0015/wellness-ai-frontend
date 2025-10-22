import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { backendRequest } from "../../Helpers/backendRequest";
import { FormateTime } from "../../Helpers/formateTime";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { PageNumbers } from "../PageNumbers";
import { filterAndPaginate } from "../../Helpers/filterAndPaginate";
import { Loading } from "../Loading";

interface PhoneNumber {
  id: number;
  phone_number: string;
  friendly_name: string;
  region: string;
  iso_country: string;
  created_at: Date;
}

const PhoneNumbersPage = ({ id }: { id: string }) => {
  const companyId = id;
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [company_name, setCompanyName] = useState<string>("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    try {
      const fetchPhoneNumbers = async () => {
        const response = await backendRequest<PhoneNumber[], []>(
          "GET",
          `/company/${companyId}/phone-numbers`
        );
        setPhoneNumbers(response?.phone_numbers);
        setCompanyName(response.company_name);
      };

      fetchPhoneNumbers();
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }, [companyId]);
  const {
    filteredItems: filteredPhoneNumbers,
    pagesCount,
    pageNumbers,
  } = useMemo(() => {
    return filterAndPaginate(phoneNumbers, search, currentPage, 10, 7);
  }, [phoneNumbers, search, currentPage]);


  return (
    <div >
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <h2 className=" text-md font-medium sm:text-2xl sm:font-bold">
            Phone numbers of{" "}
            <span className="text-primary">{company_name}</span>
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex items-center w-full md:w-auto">
            <FaSearch className="absolute left-4 text-sm md:text-lg text-gray-500" />
            <input
              type="text"
              placeholder="Search Phone..."
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              id="search"
              aria-label="Search files"
              className="bg-gray-50 border text-sm md:text-base border-gray-400 text-gray-900 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none block w-full md:w-64 pl-10 py-2"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-8 bg-white">
        <table className="w-full table-auto rounded-lg">
          <thead>
            <tr className="text-left text-sm md:text-md bg-gray-100 border-b-2">
              <th className="py-3 px-2 md:px-6">#</th>
              <th className="py-3 px-2 md:px-6">Phone Number</th>
              <th className="py-3 px-2 md:px-6">Friendly Name</th>
              <th className="py-3 px-2 md:px-6">Purchased Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <p>Loading...</p>
                  </div>
                </td>
              </tr>
            ) : filteredPhoneNumbers.length > 0 ? (
              filteredPhoneNumbers.map((number, index) => (
                <tr key={number.id} className="border-b">
                  <td className="py-3 px-2 md:px-6">{index + 1}</td>
                  <td className="py-3 px-2 md:px-6">{number.phone_number}</td>
                  <td className="py-3 px-2 md:px-6">{number.friendly_name}</td>
                  <td className="py-3 px-2 md:px-6">{FormateTime(number?.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <p>No phone numbers found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
      <PageNumbers
        pageNumbers={pageNumbers}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagesCount={pagesCount}
      />
    </div>
  );
};

export default PhoneNumbersPage;
