import { Ban } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

export default function ErrorAlert({ error }) {
  const navigate = useNavigate();
  const msgs = useMemo(
    () => ["jwt expired", "your token has expired! Please login again"],
    []
  );
  useEffect(() => {
    if (msgs.includes(error)) {
      navigate(0);
    }
  }, [error, msgs, navigate]);
  //note our access token is saved in memory not in state  we are using useEffect to automatically load the page we checking the type of error if it a jwt, then it automatically refresh the access token
  return (
    <>
      {msgs.includes(error) && (
        <div role="alert" className="alert bg-red-400 text-white">
        <Ban className="text-white"/>
          <span className="text-sm">Error! {error}</span>
        </div>
      )}
    </>
  );
}
