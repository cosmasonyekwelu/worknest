import React, { useState } from "react";
import hero from "/hero-img.png";
import {
  Search,
  Play,
  BarChart,
  MoveRight,
  LayoutGrid,
  PanelsLeftBottom,
  Megaphone,
  PenLine,
  MapPin,
  BellRing,
  FileDown,
  FileSymlink,
} from "lucide-react";

import office from "/icomoon-free_office.png";
import location from "/mdi_location.png";
import money from "/temaki_money-hand.png";
import frame2 from "/Frame 2.png";
import { useNavigate, Link } from "react-router";
import { useJobs } from "@/hooks/useJobs";
import useMetaArgs from "@/hooks/UseMeta";
import Avatar from "@/components/Avatar";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [category, setCategory] = useState("");

  const handleCategoryClick = (industry) => {
    setCategory(industry);
    navigate(`/jobs?industry=${encodeURIComponent(industry)}`);
  };

  const { data: jobResponse } = useJobs({
    search: searchTerm,
    location: locationTerm,
    industry: category,
    limit: 3,
  });

  const jobs = jobResponse?.data || [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (locationTerm) params.set("location", locationTerm);
    navigate(`/jobs?${params.toString()}`);
  };

  console.log(jobs);

  useMetaArgs({
    title: "Home - Worknest",
    description:
      "Home to your Worknest account to start looking for your dream job.",
    keywords: "Worknest, Home, account",
  });

  return (
    <div className="container sm:mt-[91px] mt-[40px]">
      <div className=" grid lg:grid-cols-2 items-center sm:justify-between sm:gap-10 xl:gap-20 gap-10 ">
        <div className="w-full lg:w-[549px] xl:w-[549px] flex flex-col gap-12">
          <div className="flex flex-col items-start gap-5 sm:gap-[42px]">
            <p className="bg-[#FEEEEA] text-[14px] py-2.5 px-5 w-[227px] rounded-[15px] text-[#000000] font-medium">
              OVER 5,O00+ ACTIVE JOBS
            </p>
            <h1 className="sm:text-[65px] xl:text-[60px] text-[38px] font-extrabold sm:leading-[70px]  leading-[50px] text-[#000000]">
              Unlock your next
              <span className="text-[#F86021]"> career milestone</span>
            </h1>
            <p className="sm:text-[20px] xl:text-[19px] text-[16px] font-medium text-[#555859] leading-[30px]">
              Skip the noise. Every listing on WorkNest is hand-picked,
              verified, and posted directly by our platform administrators to
              ensure high-quality career matches.
            </p>

            <div className="flex flex-col sm:flex-row  border border-[#00000036] rounded-[20px] p-5 sm:justify-between lg:gap-[8px] gap-4 lg:w-[487px] w-full">
              <div className="flex items-center gap-[11px] flex-1">
                <Search className="w-[16px] h-[16px] text-[#292D32]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search roles or skills..."
                  className="text-[18px] font-medium text-[#6B7280] outline-none flex-1"
                />
              </div>

              <div className="border border-[#000000] sm:h-[35px]  "></div>

              <div className="flex items-center gap-[7px] flex-1 text-end">
                <MapPin className="w-[14px] lg:w-[14px] sm:w-[20px] h-5 text-[#6B7280]" />

                <input
                  type="text"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  placeholder=" City or remote"
                  className="text-[18px] font-medium text-[#6B7280] outline-none flex-1"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="lg:w-[505px] w-full bg-[#F86021] py-5 sm:py-[30px] px-5 text-[24px] font-medium leading-[22px] rounded-[15px] text-white cursor-pointer"
          >
            Search Job
          </button>
        </div>
        <div>
          <img
            src={hero}
            alt=""
            className="rounded-[20px] w-full max-w-[100%] sm:w-[100%] lg:w-[641px]"
          />{" "}
        </div>
      </div>
      {/*  */}

      <div className="flex flex-col gap-[80px] mt-[89px]">
        <div className="bg-white flex flex-col gap-[63px] py-12 px-[64px]">
          <div className="items-center mx-auto flex flex-col gap-[14px] sm:w-[438px] w-full">
            <h4 className="sm:text-[40px] text-[26px] font-semibold whitespace-nowrap">
              How it works for job seekers
            </h4>
            <p className="sm:text-[24px] text-[16px] font-medium text-[#6B7280] whitespace-nowrap">
              The journey to a better career starts here
            </p>
          </div>
          <div
            className="grid sm:grid-cols-3 gap-12 md:gap-10 items-center  "
          >
            <div className="gap-[29px] items-center flex flex-col min-w-[90%] sm:min-w-auto ">
              <div className="bg-[#D1DDF4] rounded-[10px] p-[15px] gap-[10px] w-[48px] h-[48px] flex items-center">
                <Search className="text-[#1C3FCB]  w-[18px] h-[18px]" />
              </div>
              <h6 className="font-bold text-[22px] whitespace-nowrap ">
                {" "}
                1. Search
              </h6>
              <p className="text-[18px] font-medium leading-[25px] text-center text-[#6B7280]">
                Filter by role, salary, and tech stack to find your fit.
              </p>
            </div>

            <div className="gap-[29px] items-center flex flex-col min-w-[90%] sm:min-w-auto">
              <div className="bg-[#CCC5F0] rounded-[10px] p-[15px] gap-[10px] w-[48px] h-[48px] flex items-center">
                <Play className="text-[#3A20BC] w-5 h-5 " />
              </div>

              <h6 className="font-bold text-[22px] whitespace-nowrap  ">
                {" "}
                2. Apply
              </h6>
              <p className="text-[18px] font-medium leading-[25px] text-center text-[#6B7280]">
                Apply with one click using your saved profile and portfolio.
              </p>
            </div>

            <div className="gap-[29px] items-center flex flex-col min-w-[90%] sm:min-w-auto ">
              <div className="bg-[#EBD9D5] rounded-[10px] p-[15px] gap-[10px] w-[48px] h-[48px] flex items-center">
                <BarChart className="text-[#F86021]  w-5 h-5" />
              </div>

              <h6 className="font-bold text-[22px] whitespace-nowrap ">
                {" "}
                3. Track
              </h6>
              <p className="text-[18px] font-medium leading-[25px] text-center text-[#6B7280]">
                Monitor your application status in real-time on your dashboard.
              </p>
            </div>
          </div>

       
        </div>

        <div className="flex flex-col gap-[50px]">
          <div className="flex justify-between items-center">
            <h4 className="sm:text-[36px] text-[20px] font-semibold ">
              Explore Categories
            </h4>
            <div className="flex items-center gap-[6px] ">
              <Link
                to={"/jobs"}
                className="sm:text-[20px] text-[16px] font-medium text-[#F86021] leading-[33px]"
              >
                All Job Roles
              </Link>

              <MoveRight className="text-[#F86021]  w-3 h-3" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[19px]">
            <div
              onClick={() => handleCategoryClick("Development")}
              className="group border border-[#0000002B] rounded-[15px] flex flex-col gap-[34px] px-5 py-[30px] cursor-pointer bg-white hover:bg-[#F9DFD5] transition"
            >
              <div className="rounded-[15px] py-5 px-[15px] w-[54px] h-[64px] flex items-center bg-[#FABBA8] group-hover:bg-[#FEEEEA] transition">
                <LayoutGrid className="text-[#000000] w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h6 className="text-[22px] font-bold">Development</h6>
                <p className="text-[#6B7280] text-[18px] font-medium">
                  Software & Apps
                </p>
              </div>
            </div>

            <div
              onClick={() => handleCategoryClick("Design")}
              className="group border border-[#0000002B] rounded-[15px] flex flex-col gap-[34px] px-5 py-[30px] cursor-pointer bg-white hover:bg-[#F9DFD5] transition"
            >
              <div className="rounded-[15px] py-5 px-[15px] w-[54px] h-[64px] flex items-center bg-[#FABBA8] group-hover:bg-[#FEEEEA] transition">
                <PanelsLeftBottom className="text-[#000000] w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h6 className="text-[22px] font-bold">Design</h6>
                <p className="text-[#6B7280] text-[18px] font-medium">
                  UI/UX & Graphics
                </p>
              </div>
            </div>

            <div
              onClick={() => handleCategoryClick("Writing")}
              className="group border border-[#0000002B] rounded-[15px] flex flex-col gap-[34px] px-5 py-[30px] cursor-pointer bg-white hover:bg-[#F9DFD5] transition"
            >
              <div className="rounded-[15px] py-5 px-[15px] w-[54px] h-[64px] flex items-center bg-[#FABBA8] group-hover:bg-[#FEEEEA] transition">
                <PenLine className="text-[#000000] w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h6 className="text-[22px] font-bold">Writing</h6>
                <p className="text-[#6B7280] text-[18px] font-medium">
                  Copy & Content
                </p>
              </div>
            </div>

            <div
              onClick={() => handleCategoryClick("Marketing")}
              className="group border border-[#0000002B] rounded-[15px] flex flex-col gap-[34px] px-5 py-[30px] cursor-pointer bg-white hover:bg-[#F9DFD5] transition"
            >
              <div className="rounded-[15px] py-5 px-[15px] w-[54px] h-[64px] flex items-center bg-[#FABBA8] group-hover:bg-[#FEEEEA] transition">
                <Megaphone className="text-[#000000] w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h6 className="text-[22px] font-bold">Marketing</h6>
                <p className="text-[#6B7280] text-[18px] font-medium">
                  Growth & SEO
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*  */}

      <hr className=" sm:hidden block border mt-15 border-[#d7d7d7]" />
      <div className="sm:mt-[132px]  mt-[60px] space-y-[55px]">
        <div className="space-y-[45px]">
          <div className="flex flex-col gap-[21px]  text-center ">
            <h4 className="sm:text-[40px] text-[30px] font-bold">
              Recently Posted Jobs
            </h4>
            <p className="sm:text-[24px] text-[18px] font-medium text-[#636E7C]">
              Fresh opportunities updated every hour
            </p>
          </div>

          {jobs.map((job, index) => (
            <Link
              to={`/jobs/${job._id || job.id}`}
              key={index}
              className="border border-[#B0B6BE] p-5 sm:p-[20px] lg:p-[30px] flex flex-col sm:flex-row gap-5 sm:gap-6 lg:gap-[55px] items-center rounded-[15px] hover:shadow-lg transition-shadow bg-white"
            >
              <Avatar
                src={job.companyLogo?.url || job.companyLogo}
                name={job.companyName}
                alt={job.companyName}
                size={64}
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />

              <div className="flex flex-col lg:flex-row gap-10 justify-between flex-1 items-center sm:items-stretch ">
                <div className="flex flex-col sm:gap-[11px] gap-5">
                  <div className="flex flex-wrap sm:flex-nowrap sm:gap-[34px] gap-3 items-center">
                    <h4 className=" lg:text-[32px] sm:text-[25px] text-[28px] font-semibold leading-[100%] ">
                      {job.title}
                    </h4>
                    <div className="bg-[#FFDACF] px-4 py-1.5 rounded-[20px] flex justify-center">
                      <p className="lg:text-[20px] text-[16px] font-semibold whitespace-nowrap">
                        {job.jobType}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col sm:items-center items-start gap-[27px] whitespace-nowrap">
                    <div className="flex items-center gap-3 ">
                      <img src={office} alt="" className="w-6 h-6" />
                      <p className="lg:text-[24px] text-[20px] font-medium leading-[24px] text-[#636E7C]">
                        {job.companyName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 ">
                      <img src={location} alt="" className="w-6 h-6" />
                      <p className="lg:text-[24px] text-[20px] font-medium leading-[24px] text-[#636E7C]">
                        {job.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 ">
                      <img src={money} alt="" className="w-6 h-6" />
                      <p className="lg:text-[24px] text-[18px] font-medium leading-[24px] text-[#636E7C]">
                        ₦{job.salaryRange?.min / 1000}k - ₦
                        {job.salaryRange?.max / 1000}k
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-end lg:self-end ">
                  <button className="bg-[#F85E1E] py-[15px] px-[34px] rounded-[10px] text-[22px] font-semibold whitespace-nowrap shrink-0 cursor-pointer sm:w-auto  w-full md:w-full lg:w-auto text-white ">
                    View Details
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link to={"/jobs"} className="mx-auto flex justify-center ">
          <button className="border-2 border-[#0000001A] py-[17px] px-[22px] rounded-[20px] sm:text-[22px] text-[18px] font-semibold cursor-pointer text-[#636E7C] ">
            View all curated jobs
          </button>
        </Link>
      </div>
      {/*  */}

      <div className="flex lg:flex-row flex-col sm:items-start items-center sm:gap-[153px] gap-[40px] sm:mt-[146px] mt-[100px]">
        <div className="lg:w-[557px] w-full gap-[39px] flex flex-col">
          <h4 className="sm:text-[40px] lg:text-start sm:text-center text-[25px] font-bold leading-[100%] ">
            Empowering tools for the modern job hunter
          </h4>

          <div className="flex items-center gap-[18px] ">
            <div className="bg-[#F89E85] py-[15px] px-[18px] rounded-[30px]">
              <FileDown className="w-4 h-5" />
            </div>
            <div className="flex flex-col gap-2 w-full lg:w-[429px]">
              <h6 className=" lg:text-[24px] sm:text-[32px] text-[20px] font-semibold leading-[100%] ">
                Smart CV Upload
              </h6>
              <p className="lg:text-[16px] sm:text-[20px] text-[14px] lg:leading-[22px] text-[#636E7C]">
                Your CV is instantly transformed into a searchable profile that
                attracts recruiter attention.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[18px] ">
            <div className="bg-[#F89E85] py-[15px] px-[18px] rounded-[30px]">
              <FileSymlink className="w-4 h-5" />
            </div>
            <div className="flex flex-col gap-2 w-full lg:w-[429px] ">
              <h6 className=" lg:text-[24px] sm:text-[32px] text-[20px] font-semibold leading-[100%] ">
                Portfolio Integration
              </h6>
              <p className="lg:text-[16px] sm:text-[20px] text-[14px] leading-[22px] text-[#636E7C]">
                Showcase your best work. Link your external portfolios for a
                faster review .
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[18px] ">
            <div className="bg-[#F89E85] py-[15px] px-[18px] rounded-[30px]">
              <BellRing className="w-4 h-5" />
            </div>
            <div className="flex flex-col gap-2 w-full lg:w-[429px] ">
              <h6 className="lg:text-[24px] sm:text-[32px] text-[20px] font-semibold leading-[100%] ">
                Real-time Tracking
              </h6>
              <p className="lg:text-[16px] sm:text-[20px] text-[14px] leading-[22px] text-[#636E7C]">
                Receive instants alerts when a recruiter checks your application
                or reaches out for an interview.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <img
            src={frame2}
            alt=""
            className="lg:w-[520px] md:w-[900px] sm:w-[800px]"
          />
          <div className="absolute sm:bottom-[-20px] bottom-[-50px] sm:left-[-10px] sm:w-[316.57px] rounded-[9.23px] border-[0.92px] border-[#F89E85] bg-white py-[23.07px] px-[15.69px] flex flex-col gap-[18.46px] shadow-xl">
            <div className="flex items-center gap-[18px]">
              <p className="bg-[#009E2A] rounded-full w-[9.23px] h-[9.23px]"></p>
              <p className="text-[13.84px] font-semibold text-[#636E7C] leading-[100%]">
                {" "}
                UPDATE
              </p>
            </div>
            <p className="text-[14.77px] font-semibold leading-[100%] ">
              “A recruiter just viewed your profile!”
            </p>
          </div>
        </div>
      </div>

      {/*  */}

      <div className="mt-[124px] bg-[#000000]  py-[67px] rounded-[30px]">
        <div className="lg:w-[854px]  mx-auto  flex flex-col gap-[48px]">
          <div className=" text-center space-y-5">
            <h4 className=" lg:text-[48px] sm:text-[35px] text-[35px] font-extrabold text-white leding-[100%] sm:whitespace-nowrap">
              Ready to find your{" "}
              <span className="text-[#F85E1E]">next career</span> step?
            </h4>
            <p className="text-[#FFFDFD] text-center sm:text-[23px] text-[18px] leading-[38px] px-2 md:px-15 lg:px-[30px]  ">
              Create your profile and let our platform curators match you with
              verified, high-quality opportunities
            </p>
          </div>

          <Link to={"/jobs"} className="mx-auto cursor-pointer flex">
            <button className="sm:text-[24px] text-[18px] font-semibold leading-[100%] bg-[#F85E1E] py-[17px] px-[34px] rounded-[10px] text-white cursor-pointer ">
              Explore All Jobs
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
