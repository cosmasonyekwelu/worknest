import { isRouteErrorResponse, useRouteError } from "react-router";

export default function ErrorBoundary() {
  const error = useRouteError();

  if (import.meta.env.DEV) {
    console.error(error);
  }

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error?.response?.data?.message || error.message;
    stack = error.stack;
    console.log(stack);
  }

  const authErrors = ["jwt expired", "jwt malformed"];

  // const redirect = () => {
  //   window.location.reload();
  // };
const redirect = () => {
  if (authErrors.includes(details)) {
    window.location.href = "/login";
  } else {
    window.history.back();
  }
};

  const isAuthError = authErrors.includes(String(details));

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      {error?.status === 404 ? (
        <img src="/404.gif" alt="404" className="h-auto w-full max-w-xs sm:max-w-sm" />
      ) : (
        <img src="/Error.jpg" alt="Error" className="h-auto w-full max-w-sm sm:max-w-md" />
      )}

      <h1 className="text-2xl font-bold sm:text-3xl">Something went wrong</h1>
      <p className="text-red-600 font-bold text-xl">{message}</p>
      <p className="max-w-xl text-gray-600">
        {isAuthError ? "Session expired" : details}
      </p>

      <button
        onClick={redirect}
        type="button"
        className="my-4 py-2 px-4 rounded bg-orange-500 hover:bg-orange-700 text-white cursor-pointer"
      >
        {isAuthError ? "Refresh" : "Go back"}
      </button>
    </div>
  );
}
