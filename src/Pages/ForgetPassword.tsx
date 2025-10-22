import { useState, FormEvent } from "react";
import { Input } from "../Components/Input";
import { Button } from "../Components/Button";
import { Anchor } from "../Components/Anchor";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { useNavigate } from "react-router-dom";

export function ForgetPassword() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'enter_email' | 'enter_code'>('enter_email');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    async function sendResetCode(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const data = new FormData(e.currentTarget);
        setEmail(
            data.get('email')!.toString()
        );

        const response = await backendRequest("POST", "/send-reset-code", data);
        notifyResponse(response);
        if (response.success)
            setStep('enter_code');

        setLoading(false);
    }

    async function resetPassword(e: FormEvent<HTMLFormElement>) {
        setLoading(true);

        e.preventDefault();
        const data = new FormData(e.currentTarget);
        data.append("email", email);

        const response = await backendRequest("POST", "/reset-password", data);
        notifyResponse(response);

        if (response.success) navigate("/login");

        setLoading(false);
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <div className="w-full md:w-1/2 px-10 py-12 bg-white">

                <div className="mb-8">
                    <img src="/images/wellness-voice-ai-horizontal.png" alt="wellness Voice AI Logo" className="h-14" />
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">Forget Password?</h2>

                <p className="text-gray-500 mb-8">Dont't worry. Enter email below.</p>

                {
                    step === "enter_email" &&
                    <form onSubmit={sendResetCode}>
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="mb-6"
                        />

                        <Button fullWidth
                            type="submit"
                            className={`w-full bg-primary text-white p-4 rounded-lg font-medium ${loading ? 'cursor-not-allowed' : 'hover:bg-primary'}`}
                            disabled={loading}
                        >
                            {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
                        </Button>
                    </form>
                }

                {
                    step === "enter_code" &&
                    <form onSubmit={resetPassword}>
                        <Input
                            type="number"
                            name="code"
                            placeholder="Reset Code"
                            className="mb-6"
                        />

                        <Input
                            type="password"
                            name="password"
                            placeholder="New Password"
                            autoComplete="new-password"
                            className="mb-6"
                        />

                        <Button fullWidth
                            type="submit"
                            className={`w-full bg-primary text-white p-4 rounded-lg font-medium ${loading ? 'cursor-not-allowed' : 'hover:bg-primary'}`}
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                }

                <p className="mt-6">
                    <Anchor to="/login">Back to Login</Anchor>
                </p>
            </div>

            <div className="hidden w-auto md:block md:w-1/2 rounded-tl-[100px] rounded-bl-[100px] h-full bg-gray-200 fixed right-0">
                <img
                    src="/images/login-background.png"
                    alt="Dashboard"
                    className="h-full w-auto ml-auto"
                />
            </div>
        </div>
    );
}