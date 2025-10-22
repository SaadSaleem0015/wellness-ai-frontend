import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendRequest } from "../Helpers/backendRequest";

export interface LoginCheckerProps {
    children: ReactNode,
    allowedUser: 'logged-in' | 'not-logged-in'
}

export function LoginChecker({ children, allowedUser }: LoginCheckerProps) {
    const [allowed, setAllowed] = useState(false);
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate();
    



    useEffect(() => {
        const checkTokenValidity = async () => {
            const token = localStorage.getItem('token');

            if (allowedUser === 'logged-in') {
                if (token) {
                    try {
                        const validationResponse = await backendRequest('GET', '/validate-token');
                        if (validationResponse.success) {
                            setAllowed(true);
                        } else {
                            localStorage.removeItem('token');
                            navigate("/login");
                        }
                    } catch (error) {
                        console.error("Token validation failed:", error);
                        navigate("/login");
                    }
                } else {
                    navigate("/login");
                }
            } else if (allowedUser === 'not-logged-in') {
                if (!token) {
                    setAllowed(true);
                } else {
                    navigate("/dashboard");
                }
            }
            setLoading(false);
        };

        checkTokenValidity();
    }, [allowedUser, navigate]);


    if (allowed) {
        return <>{children}</>;
    }

    return null; 
}
