"use client";

import type React from "react";

import { loginAction } from "@/app/action/auth-actions";
import { Icons } from "@/components/common/Icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";
import { setError, setLoading, setUser } from "@/store/slices/user-slice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ForgotPassword } from "../common/user/forgot-password";
import { useApiCall } from "../previsit/ApiCall";

export default function LoginForm() {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loginApi, getBasePath, getLoginMasterData } = useApiCall();
    const router = useRouter();
    const { error } = useToast();
    const { dispatch } = useRedux();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        dispatch(setLoading(true));
        const loginPromise = new Promise<void>(async (resolve, reject) => {
            try {
                const formData = new FormData();
                formData.append("email", email);
                formData.append("password", password);

                const response = await loginAction(formData);
                if (response?.message && response?.message !== "Login successful") {
                    error({ message: response.message });
                }

                if (response.success) {
                    dispatch(
                        setUser({
                            userType: response.userType || "",
                            userRoles: response.userRoles || [],
                            token: response.token,
                            email: email
                        })
                    );
                    setTimeout(() => {
                        loginApi("Login", response.userType as "Analyst" | "Provider");
                    });
                    router.push(getBasePath(response.userType as string));
                    setTimeout(() => {
                        resolve();
                        getLoginMasterData();
                    }, 500);
                } else {
                    dispatch(setError(response.error || "Login failed"));
                    reject(new Error(response.error || "Invalid email or password. Please try again."));
                }
            } catch (e) {
                console.error("Login error:", e);
                dispatch(setError("An error occurred during login"));
                reject(new Error("An error occurred during login. Please try again later."));
            } finally {
                setIsSubmitting(false);
                dispatch(setLoading(false));
            }
        });
        console.info(loginPromise, "loginPromise");

        /*  showPromiseToast({
             promise: loginPromise,
             loading: "Logging in...",
             error: "Login failed. Please try again.",
         }); */
    }


    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    placeholder="Enter email"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isSubmitting}
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                    placeholder="Password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
            </div>
            <div className="flex justify-end">
                <ForgotPassword />
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
            </Button>
        </form>
    );
}

