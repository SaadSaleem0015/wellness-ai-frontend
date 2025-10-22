import { AlertTriangle, Phone, Users, Clock, Lock, Info, ChevronDown, ChevronUp } from "lucide-react"

interface RequirementsCardProps {
  setShowRequirements: (show: boolean) => void
  showRequirements: boolean
}

interface Requirement {
  id: string
  title: string
  description: string
  icon: typeof Users
  status?: "completed" | "pending" | "warning"
}

const RequirementsCard = ({ setShowRequirements, showRequirements }: RequirementsCardProps) => {
  const requirements: Requirement[] = [
    {
      id: "assistant",
      title: "Active Assistant",
      description: "You need an active assistant configured and enabled",
      icon: Users,
      status: "completed",
    },
    {
      id: "phone",
      title: "Phone Number",
      description: "Assistant must have a phone number or shared pool access",
      icon: Phone,
      status: "pending",
    },
    {
      id: "leads",
      title: "Assigned Leads",
      description: "Assistant needs leads assigned to make calls",
      icon: Users,
      status: "completed",
    },
    {
      id: "schedule",
      title: "Business Hours",
      description: "Set up your availability schedule below",
      icon: Clock,
      status: "warning",
    },
    {
      id: "trial",
      title: "Call Limits (Trial Users)",
      description: "Ensure you haven't exceeded your trial call limits",
      icon: Lock,
      status: "pending",
    },
  ]

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "warning":
        return "text-amber-600"
      case "pending":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusBg = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50"
      case "warning":
        return "bg-amber-50"
      case "pending":
        return "bg-gray-50"
      default:
        return "bg-gray-50"
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-md">
            <Info className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Requirements to Run Scheduler</h2>
            <p className="text-sm text-gray-600">Ensure all requirements are met before scheduling calls</p>
          </div>
        </div>
        <button
          onClick={() => setShowRequirements(!showRequirements)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
        >
          {showRequirements ? "Hide" : "Show"} Requirements
          {showRequirements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {showRequirements && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className={`${getStatusBg(req.status)} p-2 rounded-md`}>
                    <req.icon className={`w-4 h-4 ${getStatusColor(req.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 mb-1">{req.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{req.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-amber-600 w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">Important Note</p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  For trial users: You must have an active assistant with a phone number (or shared pool access) and
                  assigned leads. Make sure you haven't exceeded your call limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequirementsCard
