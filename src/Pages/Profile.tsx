import { TbPencil, TbUser } from "react-icons/tb";
import { Card } from "../Components/Card";
import { backendRequest } from "../Helpers/backendRequest";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button } from "../Components/Button";
import { notifyResponse } from "../Helpers/notyf";
import { Loading } from "../Components/Loading";

export function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
    type: "organizational_user", 
    company_name: "",
    address: { city: "", state: "", postal_code: "" , complete_address : "" },
    admin_name: "",
    phone_number: "",
    technical_contact: {
      name: "",
      email: "",
      phone_number: "",
      same_as_admin: false,
    },
    billing_contact: {
      name: "",
      email: "",
      phone_number: "",
      same_as_admin: false,
    },
  });
  const [editing, setEditing] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchProfile() {
    setLoading(true);
    const fetchedData = (await backendRequest(
      "GET",
      "/profile"
    )) as typeof profile;
    setProfile(fetchedData);
    setLoading(false);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setProfile((oldData) => ({ ...oldData, [e.target.name]: e.target.value }));
  }
  function handleContactChange(
    e: ChangeEvent<HTMLInputElement>,
    contactType: string
  ) {
    const { name, value, checked } = e.target;
    const isSameAsAdmin = name === "same_as_admin";

    setProfile((prevProfile) => {
      const updatedContact = isSameAsAdmin
        ? {
            ...prevProfile[contactType],
            name: checked ? prevProfile.admin_name : "",
            email: checked ? prevProfile.email : "",
            phone_number: checked ? prevProfile.phone_number : "",
            same_as_admin: checked,
          }
        : {
            ...prevProfile[contactType],
            [name]: value,
          };

      return { ...prevProfile, [contactType]: updatedContact };
    });
  }

async function save(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  let payload = { ...profile };

  if (profile.type === "invited_user") {
    payload = {
      name: profile.name,
      email: profile.email,
      company_name: profile.company_name,
      type: profile.type,
      password: profile.password || null,
      role: null, 
      phone_number: null, 
      address: null, 
      technical_contact: null, 
      billing_contact: null, 
      admin_name: null,
    };
  }

  if (profile.type === "organizational_user") {
    payload = { ...profile };
  }

  const response = await backendRequest("PUT", "/update-profile", payload);
  notifyResponse(response);

  if (response.success) {
    fetchProfile();
  }
}

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (editing)
      document.querySelector<HTMLInputElement>(`[name=${editing}]`)?.focus();
  }, [editing]);

  if (loading) return <Loading />;
  return (
    <Card className=" bg-white rounded-lg">
      <div className="flex justify-center mb-8">
        <div className="rounded-full ring-4 ring-primary-500 p-1">
          <TbUser className="w-32 h-32 p-4 text-primary-500" />
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="overflow-auto mb-6">
          <table className="w-full">
            <tbody>
              <tr className="hover:bg-gray-50">
                <th className="text-left sm:p-4 font-medium text-xs sm:text-base text-gray-600">
                  Name
                </th>
                <td className="text-left text-xs sm:text-base sm:p-4">
                  <input
                    value={profile.name}
                    onChange={handleChange}
                    name="name"
                    className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:ring-2 focus:border-transparent"
                    readOnly={editing !== "name"}
                  />
                </td>
                <td className="text-end p-4">
                  <button
                    onClick={() => setEditing("name")}
                    type="button"
                    className="text-primary-500 text-xs sm:text-base hover:text-primary-600"
                  >
                    <TbPencil />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <th className="text-left sm:p-4 text-xs sm:text-base font-medium text-gray-600">
                  Email
                </th>
                <td className="text-left sm:p-4 text-xs sm:text-base">
                  <input
                    value={profile.email}
                    onChange={handleChange}
                    name="email"
                    className="w-full text-xs sm:text-base bg-gray-100 border border-gray-300 rounded-md p-2  focus:ring-2 focus:ring-primary focus:border-transparent"
                    readOnly={editing !== "email"}
                  />
                </td>
                <td className="text-end p-4">
                  <button
                    onClick={() => setEditing("email")}
                    type="button"
                    className="text-primary-500 hover:text-primary-600"
                  >
                    <TbPencil />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <th className="text-left sm:p-4  text-xs sm:text-base font-medium text-gray-600">
                  Password
                </th>
                <td className="text-left p-4">
                  <input
                    type="password"
                    value={profile.password}
                    name="password"
                    placeholder="********"
                    onChange={handleChange}
                    className="w-full text-xs sm:text-base bg-gray-100 border  border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:ring-2 focus:border-transparent"
                    readOnly={editing !== "password"}
                  />
                </td>
                <td className="text-end p-4">
                  <button
                    onClick={() => setEditing("password")}
                    type="button"
                    className="text-primary-500 hover:text-primary-600"
                  >
                    <TbPencil />
                  </button>
                </td>
              </tr>
              {profile?.type !== "organizational_user" && (
                <tr className="hover:bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-600">
                    Company Name
                  </th>
                  <td className="text-left p-4">
                    <input
                      type="text"
                      value={profile.company_name}
                      name="company_name"
                      placeholder="Enter Company name"
                      disabled
                      className={`w-full bg-gray-100 border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:ring-2 focus:border-transparent cursor-not-allowed opacity-50`}
                    />
                  </td>
                  <td className="text-end p-4">
                    <button
                      type="button"
                      disabled={true}
                      className="text-primary-500 hover:text-primary-600"
                    >
                      <TbPencil className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {profile?.type === "organizational_user" && (
          <>
            <hr className="mb-4 border-gray-300" />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name
                </label>
                <input
                  value={profile.company_name}
                  onChange={handleChange}
                  name="company_name"
                  placeholder="Enter company name"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  value={profile.address?.complete_address}
                  onChange={(e) =>
                    setProfile((oldData) => ({
                      ...oldData,
                      address: {
                        ...oldData.address,
                        postal_code: e.target.value,
                      },
                    }))
                  }
                  name="complete_address"
                  placeholder="address"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>

            <div className="grid sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  value={profile.address?.city}
                  onChange={(e) =>
                    setProfile((oldData) => ({
                      ...oldData,
                      address: { ...oldData.address, city: e.target.value },
                    }))
                  }
                  name="city"
                  placeholder="Enter city"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  value={profile.address?.state}
                  onChange={(e) =>
                    setProfile((oldData) => ({
                      ...oldData,
                      address: { ...oldData.address, state: e.target.value },
                    }))
                  }
                  name="state"
                  placeholder="Enter state"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Postal Code
                </label>
                <input
                  value={profile.address?.postal_code}
                  onChange={(e) =>
                    setProfile((oldData) => ({
                      ...oldData,
                      address: {
                        ...oldData.address,
                        postal_code: e.target.value,
                      },
                    }))
                  }
                  name="postal_code"
                  placeholder="Enter postal code"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
            </div>
        
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Name
                </label>
                <input
                  value={profile.admin_name}
                  onChange={handleChange}
                  name="admin_name"
                  placeholder="Enter admin name"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone_number}
                  onChange={handleChange}
                  name="phone_number"
                  placeholder="Enter admin phone number"
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h2 className="text-lg font-semibold">Technical Contact</h2>
              <input
                name="name" 
                value={profile.technical_contact?.name}
                onChange={(e) => handleContactChange(e, "technical_contact")}
                placeholder="Enter technical contact name"
                className="border border-gray-300 rounded-md p-2 w-full"
              />
              <input
                name="email" 
                value={profile.technical_contact?.email}
                onChange={(e) => handleContactChange(e, "technical_contact")}
                placeholder="Enter technical contact email"
                className="border border-gray-300 rounded-md p-2 w-full"
              />
              <input
                name="phone_number" 
                value={profile.technical_contact?.phone_number}
                onChange={(e) => handleContactChange(e, "technical_contact")}
                placeholder="Enter technical contact phone number"
                className="border border-gray-300 rounded-md p-2 w-full"
              />

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="same_as_admin"
                  checked={profile.technical_contact?.same_as_admin}
                  onChange={(e) => handleContactChange(e, "technical_contact")}
                  className="mr-2"
                />
                <label>Same as Admin</label>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h2 className="text-lg font-semibold">Billing Contact</h2>
              <input
                name="name" 
                value={profile.billing_contact?.name}
                onChange={(e) => handleContactChange(e, "billing_contact")}
                placeholder="Enter billing contact name"
                className="border border-gray-300 rounded-md p-2 w-full"
              />

              <input
                name="email"
                value={profile.billing_contact?.email}
                onChange={(e) => handleContactChange(e, "billing_contact")}
                placeholder="Enter billing contact email"
                className="border border-gray-300 rounded-md p-2 w-full"
              />

              <input
                name="phone_number" 
                value={profile.billing_contact?.phone_number}
                onChange={(e) => handleContactChange(e, "billing_contact")}
                placeholder="Enter billing contact phone number"
                className="border border-gray-300 rounded-md p-2 w-full"
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="same_as_admin"
                  checked={profile.billing_contact?.same_as_admin}
                  onChange={(e) => handleContactChange(e, "billing_contact")}
                  className="mr-2"
                />
                <label>Same as Admin</label>
              </div>
            </div>
          </>
        )}

        <div className="text-end">
          <button className="bg-primary-500 text-white bg-primary hover:bg-primary-600 rounded-md py-2 px-4 sm:px-6 sm:py-2">
            Save
          </button>
        </div>
      </form>
    </Card>
  );
}
