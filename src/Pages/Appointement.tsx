import { MdOutlineArrowBackIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Appointment() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []); 
  
    const isValidEmail = (email: string | null) => {
      if (!email) return false;
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
    };
  

    // wellnessvoiceai-accounts-i5e4zx
    const calLink = token
      ? isValidEmail(email)
        ? `https://cal.com/wellnessvoiceai-accounts-i5e4zx/30min?token=${token}&email=${email}`
        : `https://cal.com/wellnessvoiceai-accounts-i5e4zx/30min?token=${token}`
      : "https://cal.com/wellnessvoiceai-accounts-i5e4zx/30min?token=default_token"; 
  
      // kashif-wnru1x

    return (
      <div className="h-screen flex flex-col bg-[#eeeff2] items-center justify-center relative">
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute left-10 top-4 p-2"
        >
          <MdOutlineArrowBackIos size={24} />Back
        </button>
  
        <img
          src="/images/wellness-voice-ai.png"
          alt="Company Logo"
          className="my-2 max-w-24 mx-auto"
        />
  
        <iframe
          src={calLink}
          width="100%"
          height="100%"
          className="border-none overflow-hidden"
          title="Book a Meeting"
        />
      </div>
    );
  }
  
