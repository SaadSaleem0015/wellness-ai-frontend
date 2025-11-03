import { useState, FormEvent } from "react";
import { Input } from "../Components/Input";
import { backendRequest } from "../Helpers/backendRequest";
import { useNavigate } from "react-router-dom";
import { notifyResponse } from "../Helpers/notyf";
import { Checkbox } from "../Components/Checkbox";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";

type LoginResponse = {
  success: boolean;
  token: string;
  verified: boolean;
  showPopup: boolean;
  user_role?: string;
  email?: string;
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const response = await backendRequest<LoginResponse>("POST", "/signin", data);

    if (response.success) {
        localStorage.setItem("role", response.user_role || "");
        localStorage.setItem("email", response.email || "");
        localStorage.setItem("token", response.token);
        localStorage.setItem("showPopup", String(response.showPopup));

        navigate("/dashboard");
    } else {
      notifyResponse(response);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="hidden lg:flex bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-8 relative overflow-hidden">
          <div className="relative z-10 text-center text-white max-w-sm">
            <div className="mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"></div>
              <h2 className="text-2xl font-bold mb-3">Welcome Back</h2>
              <p className="text-blue-100 text-base leading-relaxed">
                Secure access to your voice AI dashboard. Continue your journey with
                enterprise-grade security.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Secure authentication",
                "Real-time voice analytics",
                "AI-powered insights",
                "24/7 customer support",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-blue-100">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <FaArrowRight className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-8 right-8 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-8 left-8 w-20 h-20 bg-white/5 rounded-full blur-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-lg font-bold text-gray-800">Wellness Voice AI</span>
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-500 text-base">
                Sign in to continue your voice wellness journey
              </p>
            </div>

            <form onSubmit={login} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  className="pl-10 pr-4 py-2.5 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all text-sm"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  className="pl-10 pr-12 py-2.5 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember_me"
                    name="remember_me"
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remember_me" className="text-xs text-gray-600">
                    Keep me logged in
                  </label>
                </div>
              
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Signing In...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">Sign In</span>
                    <FaArrowRight className="h-3 w-3" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                By signing in, you agree to our{" "}
                <button className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Privacy Policy
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
