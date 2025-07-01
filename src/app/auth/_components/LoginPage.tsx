"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { LoginSchema } from "@/schemas/schema";
import { api } from "@/lib/api";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormError from "@/components/form/FormError";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const LoginPage = () => {
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  });

  const [otpReceived, setOtpReceived] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();

  async function onSubmit(data: z.infer<typeof LoginSchema>) {
    if (!otpReceived) {
      // Request OTP
      startTransition(async () => {
        toast.loading("Getting OTP...");
        try {
          const res = await api.get("/otp", {
            params: { email: data.email },
          });

          toast.dismiss();

          if (res.status === 200) {
            setOtpReceived(true);
            setError(undefined);
            toast.success("Login OTP sent to your email!");
          }
        } catch (error: any) {
          toast.dismiss();
          setOtpReceived(false);

          if (error?.response?.status === 403) {
            setError("Please verify your email before logging in.");
            toast.error("Verify your Email to Login!");
          } else if (error?.response?.status === 400) {
            setError("Invalid email or user does not exist.");
            toast.error("Invalid email or user does not exist.");
          } else {
            setError("Something went wrong. Please try again.");
            toast.error("Something went wrong.");
          }
        }
      });
    } else {
      // Submit OTP
      startTransition(async () => {
        toast.loading("Logging in...");
        try {
          const response = await api.post("/login", {
            email: data.email,
            otp: parseInt(data.otp || "0"),
          });

          toast.dismiss();

          if (response.status === 200) {
            toast.success("Logged in successfully!");
            router.replace("/user/drive");
          }
        } catch (error: any) {
          toast.dismiss();
          if (error?.response?.status === 403) {
            setError("Invalid OTP or session expired.");
            toast.error("Invalid OTP or session expired.");
          } else {
            setError("Login failed. Please try again.");
            toast.error("Login failed.");
          }
        }
      });
    }
  }

  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="flex flex-col justify-between items-center w-full h-full">
        <header className="h-14 flex items-center mt-4 w-full px-6">
          <nav className="flex w-full justify-between">
            <Link href="/" className="flex items-center gap-x-2" prefetch={false}>
              <GraduationCap />
              <span className="font-bold text-lg">Placement Portal</span>
            </Link>
            <Link href="/auth/register" className="flex items-center gap-x-1">
              <span className="font-light underline text-base">
                Create an account
              </span>
            </Link>
          </nav>
        </header>

        <Form {...form}>
          <div className="pb-24 w-full max-w-sm">
            <span className="text-4xl text-center w-full flex justify-center">
              Welcome back
            </span>
            <p className="text-center text-lg mb-6 mt-2 text-slate-600">
              Enter your account details below.
            </p>
            <hr className="my-4" />

            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {otpReceived && !error && (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP required maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the one-time password sent to your college email.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {error && <FormError message={error} />}

              <Button
                disabled={isLoading}
                className="w-full font-bold mt-2"
                type="submit"
              >
                {otpReceived ? "Login" : "Get OTP"}
              </Button>
            </form>
          </div>
        </Form>

        <div></div>
      </div>
      <div></div>
    </div>
  );
};

export default LoginPage;
