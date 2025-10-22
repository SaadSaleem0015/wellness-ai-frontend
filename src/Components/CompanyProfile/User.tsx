import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { backendRequest } from "../../Helpers/backendRequest";
import { PageNumbers } from "../PageNumbers";
import { filterAndPaginate } from "../../Helpers/filterAndPaginate";
import ConfirmationModal from "../ConfirmationModal";
import { notifyResponse } from "../../Helpers/notyf";
import { Loading } from "../Loading";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  type: string;
  main_admin: boolean;
}



interface Response {
  users: User[];
  company_name: string;
}

const UsersPage = ({ id }: { id: string }) => {
  const companyId = id
  const [users, setUsers] = useState<User[]>([]);
  const [company_name, setCompanyName] = useState<string>("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userForRoleChange, setUserForRoleChange] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [showRoleChangeModel, setShowRoleChangeModel] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCallLogs = async () => {
    try {
      setLoading(true)
      const response = await backendRequest<Response>(
        "GET",
        `/company/${companyId}/users`
      );
      setUsers(response.users);
      setCompanyName(response.company_name);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false)
    }
    finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchCallLogs();
    // console.log("user",users)
  }, [companyId]);

  useEffect(() => {
    //  console.log("users"+users)
  }, [users])
  const { filteredItems: filteredUsers, pagesCount, pageNumbers } = useMemo(() => {
    return filterAndPaginate(users, search, currentPage, 10, 7);
  }, [users, search, currentPage]);

  const handleChangeRole = (id: number) => {
    setUserForRoleChange(id);
    setShowRoleChangeModel(true);
  };

  const handleRoleChange = async () => {
    if (!userForRoleChange || !selectedRole) return;
    try {
      const res = await backendRequest("PUT", `/change-role/${userForRoleChange}`, { role: selectedRole });
      notifyResponse(res);
      if (res.success) {
        setShowRoleChangeModel(false);
        await fetchCallLogs();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div >
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-md font-medium sm:text-2xl sm:font-bold">
            Users of <span className="text-primary">{company_name}</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex items-center w-full md:w-auto">
            <FaSearch className="absolute left-4 text-lg text-gray-500" />
            <input
              type="text"
              placeholder="Search User..."
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
              <th className="py-3 px-2 md:px-6">Name</th>
              <th className="py-3 px-2 md:px-6">Email</th>
              <th className="py-3 px-2 md:px-6">Role</th>
              <th className="py-3 px-2 md:px-6">Main Admin</th>
              <th className="py-3 px-2 md:px-6"></th>
            </tr>
          </thead>
          <tbody>
            {
              !loading ? (
                filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 px-2 md:px-6">{index + 1}</td>
                      <td className="py-3 px-2 md:px-6">{user.name}</td>
                      <td className="py-3 px-2 md:px-6">{user.email}</td>
                      <td className="py-3 px-2 md:px-6">{user.role}</td>
                      <td className="py-3 px-2 md:px-6">
                        {user.main_admin ? (
                          <span className="text-primary text-lg font-bold">✔</span>
                        ) : (
                          <span className="text-gray-500">✘</span>
                        )}
                      </td>
                      <td className="py-3 px-2 md:px-6">
                        <button
                          onClick={() => handleChangeRole(user.id)}
                          className="bg-primary text-sm text-white py-1 px-4 rounded-md"
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <p>No Users found</p>
                      </div>
                    </td>
                  </tr>
                )
              ) :<tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <p>Loading...</p>
                      </div>
                    </td>
                  </tr>
            }

          </tbody>
        </table>
      </div>

      <PageNumbers
        pageNumbers={pageNumbers}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagesCount={pagesCount}
      />

      <ConfirmationModal
        show={showRoleChangeModel}
        onClose={() => setShowRoleChangeModel(false)}
        onConfirm={handleRoleChange}
        message={
          <>
            <div className="flex flex-col items-center gap-4">
              <p>Select Role:</p>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-white border-gray-400 text-gray-900 rounded-lg py-2 px-4"
              >
                <option value="admin">Admin</option>
                <option value="company_admin">Company Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </>
        }
      />
    </div>
  );
};

export default UsersPage;
