// import React from "react"
// import { BsApple, BsWindows } from "react-icons/bs"
// import { DiAndroid } from "react-icons/di"
// import { FaCheckCircle, FaChrome, FaLinux } from "react-icons/fa"
// import { Button } from "../ui/button"
// import { Separator } from "../ui/separator"
// import SectionWrapper from "./section-wrapper"

// export default function Footer() {
//   return (
//     <div className="bg-[#F8FCF8ff]">
//       <SectionWrapper className="max-w-[1200px] py-[40px]">
//         <div className="flex justify-between items-center">
//           <div className="space-y-3">
//             <img
//               src="/images/No-Smoke.svg"
//               className="w-[58] h-[74px] object-cover"
//               alt=""
//             />
//             <p className="font-bold text-text24_44">NicFit</p>
//             <p className="text-text14_20 text-color-4">
//               NicFit, langkah pertama menuju bebas rokok dengan panduan,
//               dukungan, dan komunitas yang <br /> kuat.
//             </p>
//             <div className="flex items-center gap-x-8 text-text14_20">
//               <div>
//                 <p className="font-bold">Email</p>
//                 <p>hello@maxwell.com</p>
//               </div>
//               <div>
//                 <p className="font-bold">Phone Number</p>
//                 <p>+1 {"(201)"} 895-3801</p>
//               </div>
//             </div>
//           </div>
//           <div className="space-y-6">
//             <p className="text-text24_44 font-bold">
//               Langkah Pertama <br /> ke{" "}
//               <span className="text-color-1">Bebas Rokok</span>
//             </p>
//             <Button className="rounded-full bg-color-1 text-white">
//               Download Mobile Apps
//             </Button>
//           </div>
//         </div>
//         <Separator className="my-7 bg-slate-400" />
//         <div className="text-text14_20 flex items-center justify-between">
//           <div className="flex items-center gap-x-2 ">
//             <FaCheckCircle />
//             <span>Available on all platforms</span>
//           </div>
//           <div className="flex items-center gap-x-3">
//             <div className="flex items-center gap-x-2  border rounded-full px-[16px] py-[10px]">
//               <BsWindows />
//               <span>Windows</span>
//             </div>
//             <div className="flex items-center gap-x-2  border rounded-full px-[16px] py-[10px]">
//               <BsApple />
//               <span>macOS</span>
//             </div>
//             <div className="flex items-center gap-x-2  border rounded-full px-[16px] py-[10px]">
//               <FaLinux />
//               <span>Linux</span>
//             </div>
//             <div className="flex items-center gap-x-2  border rounded-full px-[16px] py-[10px]">
//               <FaChrome />
//               <span>Chrome</span>
//             </div>
//             <div className="flex items-center gap-x-2  border rounded-full px-[16px] py-[10px]">
//               <BsApple />
//               <span>iOS</span>
//             </div>
//             <div className="flex items-center gap-x-2  border rounded-full px-[16px] py-[10px]">
//               <DiAndroid />
//               <span>Android</span>
//             </div>
//           </div>
//         </div>
//       </SectionWrapper>
//     </div>
//   )
// }

import {
  android,
  apple,
  check,
  chrome,
  linux,
  nicfit,
  windows,
} from "../../assets/icons";
import { Button, PlatformsList } from "../../components";

const Footer = () => {
  return (
    <footer className="max-container flex flex-col">
      <div className=" flex flex-row justify-around pb-7">
        <div className="flex flex-col">
          <img src={nicfit} alt="icon nicfit" className="w-20 h-20 pb-2" />
          <h3 className="font-Poppins text-2xl font-semibold">NicFit</h3>
          <p className="info-text font-Poppins text-sm w-w-paragraph">
            NicFit, langkah pertama menuju bebas rokok dengan panduan, dukungan,
            dan komunitas yang kuat.
          </p>
          <div className="flex flex-row">
            <div className="pr-4 gap-2  font-Poppins">
              <span className="font-bold text-sm">Email</span>
              <p className="text-base">hello@maxwell.com</p>
            </div>
            <div className="pl-4 gap-2">
              <span className="font-bold text-sm">Phone Number</span>
              <p className="text-base">+1 (201) 895-3801 </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-start gap-6">
          <div className="font-bold font-Poppins text-2xl">
            <h1>Langkah Pertama ke</h1>
            <h1 className="text-primary-text">Bebas Rokok</h1>
          </div>
          <Button label="Download Mobile Apps" />
        </div>
      </div>

      <div className="h-1 w-full bg-gray-400"></div>
      <div className="flex justify-around pt-10">
        <div className="flex justify-center items-center font-Poppins gap-2">
          <img
            src={check}
            alt="icon check"
            className="text-black bg-black w-5 h-5 rounded-full p-1"
          />
          <p>Available on all platforms</p>
        </div>
        <div className="flex flex-row gap-3">
          <PlatformsList iconPlatforms={windows} label="Windows" />
          <PlatformsList iconPlatforms={apple} label="macOS" />
          <PlatformsList iconPlatforms={linux} label="Linux" />
          <PlatformsList iconPlatforms={chrome} label="Chrome" />
          <PlatformsList iconPlatforms={apple} label="iOS" />
          <PlatformsList iconPlatforms={android} label="Android" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
