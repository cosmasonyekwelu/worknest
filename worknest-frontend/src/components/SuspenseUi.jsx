export default function SuspenseUi() {
  return (
    <div className="flex items-center justify-center h-screen">
      {/* i removed the loading because it was causing an overlay with the text and the loader */}
      <div className="loader" />
    </div>
  );
}
