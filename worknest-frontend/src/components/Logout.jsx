import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/store";
import { LogOut, X } from "lucide-react";
import { adminLogout } from "@/api/admin";
import { logoutUser } from "@/api/api";
import Modal from "./Modal";

export default function Logout({ children, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();
  const { accessToken, setAccessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin =
    location.pathname.startsWith("/admin") || user?.role === "admin";

  const mutation = useMutation({
    mutationFn: isAdmin ? adminLogout : logoutUser,
    onSuccess: (response) => {
      toast.success(response?.data?.message);
      queryClient.clear(); // to clear all queries rather than just the user
      setIsOpen(false);
      logout(); // clears user + token in context
      setAccessToken(null); // ensure access token is cleared
      navigate(isAdmin ? "/auth/admin/login" : "/auth/login", {
        replace: true,
      });
    },
    onError: (error) => {
      import.meta.env.DEV && console.log(error);

      toast.error(error?.response?.data?.message, { id: "logout" }); //the id is to prevent duplicate toasts
    },
  });

  const onLogout = async () => {
    mutation.mutate(accessToken);
  };

  return (
    <>
      {children ? (
        <div onClick={() => setIsOpen(true)} className={className}>
          {children}
        </div>
      ) : (
        <button
          className="p-4 flex gap-2 items-center text-base cursor-pointer text-red-500"
          onClick={() => setIsOpen(true)}
        >
          <LogOut /> Logout
          {/* using the useLocation for conditional rendering by tracking the path */}
        </button>
      )}
      {/* when dealing with daisyUi you must make sure to pass an id and it must be a diff id anything you are using the modal, mx-auto is to center items */}
      <Modal
        id="logoutModal"
        isOpen={isOpen}
        classname="bg-white p-4 rounded-xl shadow w-[90%] max-w-100 mx-auto"
      >
        <div className="flex flex-col items-center gap-2 w-full text-black">
          <X size={40} className="text-red-500" />
          <h1 className="text-2xl font-bold">Logout</h1>
          <p>are you sure you want to be logout?</p>
          <div className="mt-4 mb-2 flex gap-2">
            <button
              type="button"
              className="btn btn-outline w-37.5 border-[0.2px] border-gray-500"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn bg-red-500 hover:bg-red-600 text-white w-37.5"
              type="button"
              disabled={mutation.isPending}
              onClick={onLogout}
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
