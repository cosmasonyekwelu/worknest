import { uploadAvatar } from "@/api/user";
import ErrorAlert from "@/components/ErrorAlert";
import { useFile } from "@/hooks/useFile";
import { useAuth } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

export default function UploadImage() {
  const { user, accessToken } = useAuth();
  const { selectedFile, setSelectedFile, handleFile, error, setError, preview } =
    useFile();
  const fileRef = useRef(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (response) => {
      if (response.status === 200) {
        toast.success(response?.data?.message);
        queryClient.invalidateQueries({ queryKey: ["auth_user"] });
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

  return (
    <>
      {error && <ErrorAlert error={error} />}
      <div className="mt-2 flex gap-4 items-center justify-center">
        <div className="avatar avatar-placeholder relative">
          <div className="w-20 rounded-full bg-gray-300 text-gray-600">
            {user?.avatar || selectedFile ? (
              <img
                src={preview || user?.avatar}
                alt={user?.fullname.split(" ")[0].charAt(0)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl">
                {user?.fullname
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
              onClick={() => setSelectedFile(null)}
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