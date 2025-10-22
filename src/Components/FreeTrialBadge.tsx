import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiX } from 'react-icons/fi';
import { useState } from 'react';

export function FreeTrialBadge() {
  const navigate = useNavigate();
  const [showBadge, setShowBadge] = useState(true);

  const handleClick = () => navigate('/dashboard');
  const handleClose = (e:any) => {
    e.stopPropagation();
    setShowBadge(false);
  };

  if (!showBadge || localStorage.getItem('adminLogin') === 'true') return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        onClick={handleClick}
        className="relative w-72 p-4 rounded-xl bg-primary border border-gray-200 shadow-lg cursor-pointer group transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
      >
        <button 
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          onClick={handleClose}
        >
          <FiX className="text-gray-50 text-lg hover:text-gray-900" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-white">
            <FiCalendar className="text-xl" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800">
                LIMITED TIME
              </span>
              <span className="text-xs text-gray-50">
                7 days 
              </span>
            </div>
            
            <h3 className="font-bold text-white mb-1">
              Start Your Free Trial
            </h3>
            
            <p className="text-sm text-white leading-tight mb-2">
              Complete your profile to start your free trial within 7 days.
            </p>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}