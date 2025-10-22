import type React from "react"
import { useState } from "react"
import { FaTimes } from "react-icons/fa"
import { notifyResponse } from "../Helpers/notyf"
import { backendRequest } from "../Helpers/backendRequest"

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
}

const BrandModal: React.FC<BrandModalProps> = ({ isOpen, onClose }) => {
  const [brandName, setBrandName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (brandName.trim()) {
      handleBrandSubmit(brandName.trim())
      setBrandName("")
      onClose()
    }
  }



  const handleBrandSubmit = async (brandName: string) => {

    try {
      const data = new FormData();
      data.append("name", brandName)
      const response = await backendRequest("POST", "/brand-name",data);
      notifyResponse(response);
      if (response.success) {
        console.log("Added successfully")
      } else {
        console.error("Upload failed:", response);
      }
    }catch(e)
    {
      console.log(e)
    }            
  }


  const handleCancel = () => {
    setBrandName("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0  bg-opacity-50 backdrop-blur-sm" onClick={handleCancel} />

      {/* Modal */}
      <div className="relative bg-white  rounded-2xl shadow-2xl border border-gray-200  w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 ">
          <h2 className="text-xl font-semibold text-gray-900 ">Brand Name</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100  rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaTimes className="w-5 h-5 text-gray-500 " />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-gray-700  mb-2">
                Enter Brand Name
              </label>
              <input
                id="brandName"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Nike, Apple, Google"
                className="w-full px-4 py-3 border border-gray-300  rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent  transition-all duration-200 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 px-4 text-white  hover:bg-gray-700 bg-gray-800 rounded-lg transition-all duration-200 font-medium "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!brandName.trim()}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary/70  disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium "
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BrandModal