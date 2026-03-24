import { uploadAvatar } from "@/api/user";
import Avatar from "@/components/Avatar";
import ErrorAlert from "@/components/ErrorAlert";
import { useFile } from "@/hooks/useFile";
import { useAuth } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

export default function UploadImage({ variant = "default" }) {
  const { user, accessToken } = useAuth();
  const { selectedFile, handleFile, error, setError, preview, resetFile } =
    useFile();
  const fileRef = useRef(null);
  const queryClient = useQueryClient();
  const previewSource = preview || user?.avatar;
  const displayName = user?.fullname || user?.name || "User";

  const mutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (response) => {
      if (response.status === 200) {
        toast.success(response?.data?.message);
        queryClient.invalidateQueries({ queryKey: ["auth_user"] });
        resetFile();
      }
    },
    onError: (error) => {
        import.meta.env.DEV && console.log(error); //this error will show only when we are in dev mode its not going to show when we host or in production mode
      setError(error?.response?.data?.message || "Error uploading image");
    },
  });

  

  const handleImageClick = () => {
    if (fileRef.current) {
      fileRef.current.value = "";
      fileRef.current.click();
    }
  };

  const clearSelection = () => {
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    resetFile();
  };

  const onFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);
        mutation.mutate({ formData, accessToken });
      }
    },
    [accessToken, mutation, selectedFile]
  );

  if (variant === "settings") {
    return (
      <>
        {error && <ErrorAlert error={error} />}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="flex h-[136px] w-[136px] items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-[#FFF6F2] p-2">
              <Avatar
                src={previewSource}
                name={displayName}
                alt={`${displayName} avatar`}
                size={112}
                className="h-28 w-28 rounded-full object-cover"
              />
            </div>
            {selectedFile && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-red-500"
                title="Remove selected image"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-lg font-medium text-gray-900">
                {selectedFile ? "Ready to upload" : "Change"}
              </p>
              <p className="text-sm leading-6 text-gray-500">
                JPG, PNG, GIF up to 5MB.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectedFile ? (
                <>
                  <form onSubmit={onFormSubmit}>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-xl bg-[#F75D1F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e0561b] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Uploading..." : "Upload image"}
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="inline-flex items-center gap-2 text-lg font-medium text-gray-900 transition hover:text-[#F75D1F]"
                >
                  <Camera size={18} />
                  Change
                </button>
              )}
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            id="avatar"
            className="hidden"
            ref={fileRef}
            onChange={(e) => {
              handleFile(e);
            }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {error && <ErrorAlert error={error} />}
      <div className="mt-2 flex gap-4 items-center justify-center">
        <div className="avatar avatar-placeholder relative">
          <div className="w-20 rounded-full bg-gray-300 text-gray-600">
            {previewSource ? (
              <img
                src={previewSource}
                alt={displayName}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl">
                {displayName
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()}
              </span>
            )}
          </div>
          {selectedFile && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute top-0 right-0 p-2 rounded-full bg-gray-300 text-gray-600 cursor-pointer"
              title="Remove image"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col items-center gap-2">
            {selectedFile ? (
              <form onSubmit={onFormSubmit}>
                <button
                  type="submit"
                  className="bg-orange-500 text-white font-bold border-[0.2px] border-gray-500 p-2 rounded-md cursor-pointer"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Uploading..." : "Upload"}
                </button>
              </form>
            ) : (
              <label htmlFor="avatar">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="font-bold text-xs border-[0.2px] border-gray-500 p-2 rounded-md cursor-pointer"
                >
                  Change image
                </button>
              </label>
            )}
            <p className="font-bold text-xs">JPG, PNG, GIF (max 5MB)</p>
          </div>
          <input
            type="file"
            accept="image/*"
            id="avatar"
            className="hidden"
            ref={fileRef}
            onChange={(e) => {
              handleFile(e);
            }}
          />
        </div>
      </div>
    </>
  );
}
