import { useEffect, useState } from "react";
import PinField from "react-pin-field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import useMetaArgs from "@/hooks/UseMeta";
import { resendVerificationCode, verifyAccount } from "@/api/api";
import ErrorAlert from "@/components/ErrorAlert";
import { useAuth } from "@/store";

export default function Verify() {
  useMetaArgs({
    title: "Verify Account - Worknest",
    description: "Verify your Worknest account.",
    keywords: "Worknest, verify account, account",
  });
  const [verificationToken, setVerificationToken] = useState("");
  const [timer, setTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const TIMER_STORAGE_KEY = "verification_time_end";

  useEffect(() => {
    const savedEndTime = localStorage.getItem(TIMER_STORAGE_KEY);
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime, 10);
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, endTime - now);

      if (remaining > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTimer(remaining);
        setIsResendDisabled(true);
      } else {
        localStorage.removeItem(TIMER_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    let interval;
    // Stop the timer if verification was successful
    if (timer > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsResendDisabled(true);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1 && interval !== null) {
            setIsResendDisabled(false);
            clearInterval(interval);
            localStorage.removeItem(TIMER_STORAGE_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  const mutation = useMutation({
    mutationFn: verifyAccount,
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Account verified");
      queryClient.invalidateQueries({ queryKey: ["auth_user"] });
      setSuccess(true);
    },
    onError: (error) => {
      import.meta.env.DEV && console.log(error);
      setError(error?.response?.data?.message || "Account verifcation failed");
    },
  });

  const sendResendToken = useMutation({
    mutationFn: resendVerificationCode,
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Verification token sent");
    },
    onError: (error) => {
      import.meta.env.DEV && console.log(error);
      setError(error?.response?.data?.message || "Verification code failed");
    },
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    mutation.mutate({ verificationToken, accessToken });
  };

  const handleResendCode = async (e) => {
    e.preventDefault();
    setError(null);
    const newTimer = 30;
    setTimer(newTimer);
    const endTime = Math.floor(Date.now() / 1000) + newTimer;
    localStorage.setItem(TIMER_STORAGE_KEY, endTime.toString());
    if (!accessToken) {
      toast.error("Session expired. Please refresh the page and try again.");
      return;
    }
    sendResendToken.mutate(accessToken);
  };
  const redirect = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full flex items-center justify-center gap-2">
      {success || user?.isVerified ? (
        <>
          {" "}
          <div className="p-4 max-w-200 mx-auto text-center">
            <img src="/Success.svg" alt="success" className="w-full h-full" />
            <h1 className="text-2xl font-bold">Congratulations!</h1>
            <p className="text-gray-600">
              Your account has been verified successfully
            </p>
            <button
              className="btn my-4 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
              size="lg"
              onClick={redirect}
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <div className="w-full max-w-md lg:max-w-lg mx-auto bg-[#FFF6F2] p-6 rounded-xl shadow">
          <form
            className="flex flex-col items-center gap-2 w-full"
            onSubmit={onSubmit}
          >
            <h1 className="text-2xl font-bold">Enter the 6-digit Code</h1>
            <p className="text-gray-600 text-md">
              We have sent a verification code to your email.
            </p>
            <div className="my-4 w-full md:w-[350px] text-center">
              {error && <ErrorAlert error={error} />}
              <PinField
                length={6}
                autoComplete="one-time-code"
                autoCorrect="off"
                dir="ltr"
                pattern="[0-9]"
                type="text"
                value={verificationToken}
                onChange={(value) => {
                  setVerificationToken(value);
                }}
                className="w-12 sm:w-14 text-center border border-gray-300 rounded-md p-2 font-bold bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#F86122] hover:bg-[#F86122]/50 text-white rounded-lg h-11 transition disabled:opacity-50"
              disabled={verificationToken.length !== 6 || mutation.isPending}
            >
              {mutation.isPending ? "Verifying..." : "Verify"}
            </button>
          </form>
          <div>
            <form
              onSubmit={handleResendCode}
              className="mt-6 flex flex-col items-center gap-2"
            >
              <p className="text-gray-600 text-md">
                Didn't receive the code?{" "}
                <button
                  className={` ${
                    isResendDisabled
                      ? " text-gray-600 cursor-pointer"
                      : "text-[#F75F20] hover:text-[#F75F20] cursor-pointer"
                  }`}
                  disabled={isResendDisabled}
                >
                  {isResendDisabled ? `Resend in ${timer}s` : "Resend Code"}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
