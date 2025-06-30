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
import FormError from "@/components/form/FormError";
import toast from "react-hot-toast";
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

  const [otpReceived, setotpReceived] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();

  async function onSubmit(data: z.infer<typeof LoginSchema>) {
    if (otpReceived) {
      startTransition(async () => {
        toast.loading("Logging in...");
        try {
          const response = await api.post("/login", {
            email: data.email,
            otp: parseInt(data.otp || "0"),
          });
          if (response.status === 200) {
            toast.dismiss();
            toast.success("Logged in successfully!");
            router.replace("/user/drive");
          }
        } catch (error: any) {
          toast.dismiss();
          if (error?.response?.status === 403) {
            setError(error.response.data.error);
            toast.error("Verify your Email to Login!");
          } else {
            toast.error("Something went wrong. Please try again.");
          }
        }
      });
    } else {
      startTransition(async () => {
        toast.loading("Getting OTP...");
        try {
          const res = await api.get("/otp", {
            params: { email: data.email },
          });
          toast.dismiss();
          if (res.status === 200) {
            setotpReceived(true);
            toast.success("Login OTP sent to your email!");
          }
        } catch (error: any) {
          toast.dismiss();
          //! FOR TESTING
          setotpReceived(true);
          if (error?.response?.status === 403) {
            setError(error.response.data.error);
            toast.error("Verify your Email to Login!");
          } else {
            toast.error("Something went wrong. Please try again.");
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
            <Link
              href="/"
              className="flex items-center gap-x-2 justify-center"
              prefetch={false}
            >
              <GraduationCap />
              <span className="font-bold text-lg">Placement Portal</span>
            </Link>
            <Link
              className="flex items-center gap-x-1 justify-center"
              href={"/auth/register"}
            >
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
            <hr className="my-4 " />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-2"
            >
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
              {otpReceived && (
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
                        Please enter the one-time password sent to your college
                        email.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {error && <FormError message={error} />}
              {!otpReceived ? (
                <Button
                  variant={"default"}
                  disabled={isLoading}
                  className="w-full mt-2 font-bold"
                  type="submit"
                >
                  Get OTP
                </Button>
              ) : (
                <Button
                  disabled={isLoading}
                  className="w-full font-bold"
                  type="submit"
                >
                  Login
                </Button>
              )}
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
