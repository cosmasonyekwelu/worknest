import { useRef, useState } from "react";

export default function Email() {
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [email, setEmail] = useState("");
  const formRef = useRef(null);
  const iframeRef = useRef(null);

  const handleSubmit = (e) => {
    // Prevent default only to control UI – the form still submits via iframe
    e.preventDefault();

    if (!email) return;

    // Set loading state
    setStatus("loading");

    // Submit the form programmatically
    formRef.current.submit();

    // Set a timeout in case iframe onload doesn't fire (fallback)
    const timeout = setTimeout(() => {
      if (status === "loading") {
        setStatus("error");
      }
    }, 5000);

    // Remove timeout if component unmounts or iframe loads
    const onLoad = () => {
      clearTimeout(timeout);
      // Assume success – Brevo doesn't return error details via iframe
      setStatus("success");
      setEmail("");
      // Remove the onload listener
      if (iframeRef.current) {
        iframeRef.current.removeEventListener("load", onLoad);
      }
    };

    // Attach load event to the iframe
    if (iframeRef.current) {
      iframeRef.current.addEventListener("load", onLoad);
    }
  };

  return (
    <div>
      <form
        action="https://6895434f.sibforms.com/serve/MUIFANRku4PN0KMxKahwWGO1ORB5zOu67COxJ3rr1Bso5Cs7c_JIGOSCAXZB2UNaqJ1nZSD2ieGixCGzBQr851TjxVYZ-i9Fn5bEhlSizAyEQ1xvWYXd943LhmM9ihJJc3uP4cMaStT653nVB4I4A6kM-HbIRhBjhin86M5W_uGzT_4vgJsO1z9V2FkW2u1JYjSMt5XgASPL9cL57g=="
        method="POST"
        onSubmit={handleSubmit}
        
        
      >
        <input
          type="email"
          name="Email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="mt-5 w-full rounded-[13px] border border-[#727171] p-3 placeholder:text-[18px] text-[#6B7280] font-semibold disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-3 w-full rounded-[13px] bg-[#F85E1E] p-3 text-[#FFFFFF] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <p className="text-[18px] font-semibold">
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </p>
        </button>
      </form>

      {/* Status messages */}
      {status === "success" && (
        <p className="mt-3 text-green-600 text-sm font-medium">
        Thanks for subscribing! Check your inbox to confirm.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-red-500 text-sm font-medium">
          Something went wrong. Please try again or contact support.
        </p>
      )}

      <iframe
        name="hidden_iframe"
        ref={iframeRef}
        style={{ display: "none" }}
        title="hidden"
      ></iframe>
    </div>
  );
}