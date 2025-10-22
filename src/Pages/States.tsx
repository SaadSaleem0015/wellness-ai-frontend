import { useEffect, useMemo, useState } from "react";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { Loading } from "../Components/Loading";
import { Input } from "../Components/Input";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import "react-datepicker/dist/react-datepicker.css";
import { getTimeZoneName } from "../Helpers/TimeZoneName";

interface State {
  zone: string;
  gmt: string;
  name: string;
}

export function States() {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    filteredItems: filteredStates,
    pagesCount,
    pageNumbers,
  } = useMemo(() => {
    return filterAndPaginate(states, search, currentPage, 10, 7);
  }, [states, search, currentPage]);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setLoading(true);
    const response = await backendRequest<State[], []>("GET", "/states");
    if (Array.isArray(response)) {
      setStates(response);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between mb-6 items-center w-full">
          <h2 className="text-2xl font-bold">States</h2>
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto mb-4 sm:mb-0 sm:mr-2 gap-2">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-full sm:w-auto h-full text-sm lg:text-lg px-2 py-1 rounded-md border border-gray-300"
            />
          </div>
        </div>

        <div className="overflow-auto mb-6">
          <table className="min-w-full table-auto ">
            <thead>
              <tr className="border-b text-left align-middle">
                <th className="p-3">State</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Time Zone</th>
                <th className="p-3">GMT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    <div className="w-8 h-8 border-4 border-t-4 border-gray-300 border-solid rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredStates.length > 0 ? (
                filteredStates.map((state, index) => (
                  <tr className="border-b" key={index}>
                    <td className="p-3">{state.name}</td>
                    <td className="p-3">{state.zone}</td>
                    <td className="p-3">{getTimeZoneName(state.zone, state.gmt)}</td>
                    <td className="p-3">{state.gmt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No records found
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
      </Card>
    </div>
  );
}
