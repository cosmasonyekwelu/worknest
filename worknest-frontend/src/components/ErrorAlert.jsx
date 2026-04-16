import { Ban } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

export default function ErrorAlert({ error }) {
  const navigate = useNavigate();
  const tokenExpiryMessages = useMemo(
    () => ["jwt expired", "your token has expired! Please login again"],
    [],
  );
  useEffect(() => {
    if (tokenExpiryMessages.includes(error)) {
      navigate(0);
    }
  }, [error, navigate, tokenExpiryMessages]);
  return (
    <div role="alert" className="alert bg-red-400 text-white">
      <Ban className="text-white" />
      <span className="text-sm">Error! {error}</span>
    </div>
  );
}
