import { SendHorizontal } from "lucide-react";
import facebook from "/facebook.png";
import instagram from "/instagram.png";
import whatsapp from "/whatsapp.png";
import location from "/location.png";
import call from "/call.png";
import mail from "/mail.png";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

const ContactUs = () => {
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSending(true);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          fullName: formData.fullName,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );

      toast.success("Message sent successfully ✅");

      setFormData({
        fullName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container">
      <div className="flex flex-col gap-4">
        <h4 className="sm:text-[56px] text-[40px] font-black tracking-tighter leading-[120%] ">
          Get In Touch
        </h4>
        <p className="sm:text-[20px] text-[16px] font-medium sm:leading-8 text-[#8F8F8F] leading-6">
          We are here to help you find your next great opportunity. Reach out to
          our team for support or inquiries
        </p>
      </div>

      <div className="flex lg:flex-row flex-col mt-9 lg:gap-5 gap-10">
        <form
          onSubmit={handleSubmit}
          action=""
          className="bg-white lg:w-174 w-full py-8 sm:px-9 px-5 gap-9 flex flex-col border shadow-xl rounded-[10px] "
        >
          <div className="flex sm:flex-row flex-col gap-[15.35px] items-center">
            <div className="w-full flex flex-col gap-[10.74px]">
              <label
                htmlFor="fullName"
                className="sm:text-[20px] text-[18px] font-bold "
              >
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Said Money"
                onChange={handleChange}
                value={formData.fullName}
                required
                className="sm:text-[16px] text-[14px]  font-medium border shadow-xl rounded-[5.12px]  pl-[13.57px] h-13"
              />
            </div>

            <div className=" w-full flex flex-col gap-[10.74px]">
              <label
                htmlFor="email"
                className="sm:text-[20px] text-[18px] font-bold "
              >
                Work Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Said@worknest.com"
                onChange={handleChange}
                value={formData.email}
                required
                className="sm:text-[16px] text-[14px] font-medium  border shadow-xl rounded-[5.12px]  pl-[13.57px] h-13"
              />
            </div>
          </div>

          <div className=" flex flex-col gap-[10.74px]">
            <label
              htmlFor="subject"
              className="sm:text-[20px] text-[18px] font-bold "
            >
              Subject
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Select Type"
              onChange={handleChange}
              value={formData.subject}
              required
              className="sm:text-[16px] text-[14px] font-medium  border shadow-xl rounded-[5.12px]  pl-[13.57px] h-13 w-full"
            />
          </div>

          <div className=" flex flex-col gap-[10.74px]">
            <label
              htmlFor="email"
              className="sm:text-[20px] text-[18px] font-bold "
            >
              Message
            </label>

            <textarea
              name="message"
              id="message"
              onChange={handleChange}
              value={formData.message}
              required
              placeholder=" Tell us more about your inquiry..."
              className="sm:text-[16px] text-[14px] font-medium  border shadow-xl rounded-[5.12px] h-37 w-full resize-none p-3"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className={`flex items-center gap-2.5 py-4 px-9 rounded-[10px] self-start text-white sm:text-[20px] font-bold bg-[#F3582C] ${
              isSending ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isSending ? "Sending..." : "Send Message"}
            <SendHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </form>

        <div className="bg-white py-10 sm:px-9 px-4 rounded-[10px] space-y-8 shadow-xl border lg:w-131">
          <h5 className="text-[24px] font-bold tracking-tight">
            Contact Information
          </h5>

          <div className="flex gap-4 items-start ">
            <div className="rounded-[10px]  bg-[#F3582C1A] shadow-xl flex justify-center items-center w-11 h-11">
              <img src={location} alt="" className="w-6 h-6" />
            </div>
            <div className="w-62 space-y-1">
              <p className="sm:text-[20px] text-[18px] font-semibold">
                Office Address
              </p>
              <p className="sm:text-[18px] text-[16px] font-medium sm:leading-6 text-[#6B6B6B]">
                No. 1 Ogunlesi Street, Off Awoyokun Street, Onipanu, Lagos, Nigeria
              </p>
            </div>
          </div>

          <a
            href="mailto:worknestnig@gmail.com"
            className="flex gap-4 items-start "
          >
            <div
              href="mailto:worknestnig@gmail.com"
              className="rounded-[10px]  bg-[#F3582C1A] shadow-xl flex justify-center items-center w-11 h-11"
            >
              <img src={mail} alt="" className="w-6 h-6" />
            </div>
            <div className="w-62 space-y-1">
              <p className="sm:text-[20px] text-[18px]  font-semibold">
                Support Email
              </p>
              <p className="sm:text-[18px] text-[16px] font-medium leading-6 text-[#6B6B6B]">
                worknestnig@gmail.com
              </p>
            </div>
          </a>

          <a href="tel:+2348012345678" className="flex gap-4 items-start ">
            <div className="rounded-[10px]  bg-[#F3582C1A] shadow-xl flex justify-center items-center w-11 h-11">
              <img src={call} alt="" className="w-6 h-6" />
            </div>
            <div className="sm:w-62 space-y-1">
              <p className="sm:text-[20px] text-[18px]  font-semibold">
                Phone Number{" "}
              </p>
              <p className="sm:text-[18px] text-[16px] font-medium leading-6 text-[#6B6B6B]">
                +234 (806)398-NEST
              </p>
            </div>
          </a>

          <hr className="w-full border shadow-xl" />
          <div className="space-y-5">
            <h6 className="text-[20px] font-bold leading-6">Follow Us</h6>
            <div className="flex  space-x-4">
              <a
                href="https://instagram.com/worknest"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[10px] border border-[#00000033] shadow-xl flex justify-center items-center w-11 h-11"
              >
                <img src={instagram} alt="" className="w-7 h-7" />
              </a>

              <a
                href="https://facebook.com/worknest"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[10px] border border-[#00000033] shadow-xl flex justify-center items-center w-11 h-11"
              >
                <img src={facebook} alt="" className="w-7 h-7" />
              </a>

              <a
                href="https://wa.me/2349023141764"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[10px] border border-[#00000033] shadow-xl flex justify-center items-center w-11 h-11"
              >
                <img src={whatsapp} alt="" className="w-7 h-7" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="w-full h-100 bg-gray-200 rounded-xl overflow-hidden mt-7">
        <iframe
          title="Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.889869751431!2d3.3634445739928114!3d6.535590423024778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8dba7bad97cb%3A0xae0bc176821041e5!2sTech%20Studio%20Academy!5e0!3m2!1sen!2sng!4v1770788632836!5m2!1sen!2sng"
          width="100%"
          height="100%"
          allowFullScreen=""
          style={{
            border: 0,
            filter:
              "invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)",
          }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactUs;
