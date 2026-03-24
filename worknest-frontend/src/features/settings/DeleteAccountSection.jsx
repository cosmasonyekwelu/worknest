import { deleteAccount } from "@/api/user";
import Modal from "@/components/Modal";
import { useAuth } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function DeleteAccountSection({
  title = "Delete account",
  description = "Delete your account and all associated data. This action cannot be undone.",
  buttonLabel = "Delete account",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { accessToken, logout, setAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => deleteAccount(accessToken),
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Account deleted successfully");
      queryClient.clear();
      setIsOpen(false);
      logout();
      setAccessToken(null);
      navigate("/auth/signup", { replace: true });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Unable to delete account right now";
      toast.error(message);
    },
  });

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="max-w-2xl text-sm leading-6 text-gray-600">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Trash2 size={16} />
            {buttonLabel}
          </button>
        </div>
      </div>

      <Modal
        id="deleteAccountModal"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classname="bg-white p-6 rounded-2xl shadow w-[92%] max-w-[460px] mx-auto"
      >
        <div className="space-y-5 text-center text-gray-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Delete account</h2>
            <p className="text-sm leading-6 text-gray-600">
              This permanently removes your WorkNest account, saved jobs,
              applications, and profile data.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="btn border-none bg-red-500 text-white hover:bg-red-600 disabled:opacity-70"
            >
              {mutation.isPending ? "Deleting..." : "Yes, delete account"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
