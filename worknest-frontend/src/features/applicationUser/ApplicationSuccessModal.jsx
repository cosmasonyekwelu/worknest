import { useEffect, useId, useRef } from "react";
import { Circle, X } from "lucide-react";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function SuccessIllustration() {
  return (
    <svg
      className="mt-6 w-[min(220px,52vw)] sm:mt-8 sm:w-[min(250px,42vw)] lg:mt-10 lg:w-[280px]"
      viewBox="0 0 280 200"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="72" y="44" width="110" height="105" rx="12" fill="#EFF2FB" />
      <rect x="72" y="54" width="110" height="10" rx="5" fill="#D7DEF3" />
      <rect x="90" y="84" width="82" height="10" rx="5" fill="#D2D9EE" />
      <rect x="90" y="102" width="62" height="8" rx="4" fill="#D8DEEF" />

      <path d="M36 92h28l16 20h120l-40 76H36z" fill="#FF5F17" />
      <path d="M36 92h24l16 20-40 76z" fill="#FF7C3C" />
      <rect x="144" y="122" width="38" height="12" rx="6" fill="#FFB26F" />

      <circle cx="160" cy="54" r="30" fill="#47D7A4" />
      <path
        d="m145 54 10 10 20-23"
        fill="none"
        stroke="#fff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M24 30c8 0 8-12 8-12s0 12 8 12c-8 0-8 12-8 12s0-12-8-12Z"
        fill="#F8C11C"
      />
      <path
        d="M204 92c6 0 6-9 6-9s0 9 6 9c-6 0-6 9-6 9s0-9-6-9Z"
        fill="#F8C11C"
      />
      <circle cx="219" cy="106" r="5" fill="none" stroke="#F8C11C" strokeWidth="4" />
      <circle cx="58" cy="60" r="4" fill="#F8C11C" />
      <path
        d="M198 26l14-8m-4 20 16-10"
        stroke="#fff"
        strokeOpacity=".45"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ApplicationSuccessModal({
  isOpen,
  onClose,
  onExploreMoreJobs,
  onTrackApplication,
  companyName = "XYZ Company",
  position = "UI/UX Designer",
}) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const headingId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;
    const modalElement = modalRef.current;

    const focusables = modalElement?.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusables?.length) closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      }

      if (event.key !== "Tab" || !modalElement) return;

      const elements = Array.from(modalElement.querySelectorAll(FOCUSABLE_SELECTOR));
      if (!elements.length) {
        event.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-[1200] flex items-center justify-center
        bg-[rgba(24,24,26,0.78)]
        p-4 sm:p-6 lg:p-8
      "
      onClick={onClose}
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-label="Application submitted successfully"
        onClick={(e) => e.stopPropagation()}
        className="
          relative flex max-h-[min(92vh,780px)] w-full max-w-[760px] flex-col items-center overflow-y-auto
          bg-[#f8f8f8]
          rounded-[24px] sm:rounded-[28px] lg:rounded-[32px]
          shadow-[0_26px_60px_rgba(0,0,0,0.18)]
          px-4 pb-6 pt-14 sm:px-8 sm:pb-8 sm:pt-16 lg:px-12 lg:pb-10 lg:pt-[72px]
        "
      >
        <p
          className="
            absolute left-4 top-5
            sm:left-8 sm:top-6 lg:left-12 lg:top-8
            m-0 text-[11px] sm:text-[12px] lg:text-[13px]
            tracking-[0.08em] font-medium text-[#8f9198]
          "
        >
          SUCCESSFULLY DONE
        </p>

        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close success modal"
          onClick={onClose}
          className="
            absolute right-4 top-4
            sm:right-5 sm:top-5 lg:right-6 lg:top-6
            h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14
            rounded-full bg-[#ff5f17] text-white
            grid place-items-center
            cursor-pointer
            transition
            hover:bg-[#e45210]
            active:scale-[0.96]
            focus-visible:outline focus-visible:outline-[3px]
            focus-visible:outline-[#ff9d6e]
            focus-visible:outline-offset-[3px]
          "
        >
          <X aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" strokeWidth={2.5} />
        </button>

        <SuccessIllustration />

        <h2
          id={headingId}
          className="
            mt-5 mb-3 sm:mt-6
            text-center text-[#14151a] font-bold leading-[1.15]
            text-[clamp(1.85rem,5.5vw,3.25rem)]
          "
        >
          Application Submitted Successfully!
        </h2>

        <p
          className="
            m-0 max-w-[42rem]
            text-center text-[#1a1b20] font-[450]
            leading-[1.4]
            text-[clamp(0.98rem,3.3vw,1.4rem)]
          "
        >
          You applied for {position} at {companyName}. You can track your
          application&apos;s progress in the profile section
        </p>

        <div className="mt-6 w-full max-w-[620px]">
          <Circle
            aria-hidden="true"
            className="mx-auto mb-3 h-4 w-4 text-[#1f1f1f] fill-current sm:h-5 sm:w-5"
            strokeWidth={1.5}
          />
          <div className="border-t-2 border-[#f5cbb4]" />
        </div>

        <div
          className="
            mt-7 grid w-full max-w-[620px] grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-2
          "
        >
          <button
            type="button"
            onClick={onExploreMoreJobs}
            className="
              min-h-[56px] sm:min-h-[64px]
              rounded-[16px] sm:rounded-[18px]
              border-[3px] border-[#ff5f17]
              bg-transparent
              text-[#ff5f17]
              font-medium leading-none
              px-5 text-[clamp(1rem,3.4vw,1.45rem)]
              transition
              hover:border-[#e45210] hover:text-[#e45210] hover:bg-[rgba(255,95,23,0.08)]
              active:translate-y-[1px]
              focus-visible:outline focus-visible:outline-[3px]
              focus-visible:outline-[#ff9d6e]
              focus-visible:outline-offset-[3px]
            "
          >
            Explore More Jobs
          </button>

          <button
            type="button"
            onClick={onTrackApplication}
            className="
              min-h-[56px] sm:min-h-[64px]
              rounded-[16px] sm:rounded-[18px]
              border-[3px] border-transparent
              bg-[#ff5f17]
              text-[#191919]
              font-medium leading-none
              px-5 text-[clamp(1rem,3.4vw,1.45rem)]
              transition
              hover:bg-[#e45210]
              active:translate-y-[1px]
              focus-visible:outline focus-visible:outline-[3px]
              focus-visible:outline-[#ff9d6e]
              focus-visible:outline-offset-[3px]
            "
          >
            Track My Application
          </button>
        </div>
      </section>
    </div>
  );
}

