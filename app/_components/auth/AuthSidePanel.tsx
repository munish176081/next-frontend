import { LogoIcon } from "@/_components/icons";
import React from "react";

interface AuthSidePanelProps {
  title: string;
  subtitle: string;
  smallText: React.ReactNode;
  highlight?: string;
}

const AuthSidePanel: React.FC<AuthSidePanelProps> = ({
  title,
  subtitle,
  smallText,
  highlight = title,
}) => {
  return (
    <div className="w-1/2 min-h-full bg-[#F5F5F5] rounded-40 flex flex-col items-center py-8 min-h-[810px] max-md:hidden">
      <span className="w-44 flex">
        <LogoIcon width="100%" height="100%" />
      </span>
      <span className="text-[45px] mt-8 relative">
        <img
          alt="Paws decoration"
          className="absolute -left-14 -top-7 w-[68px] h-[63px]"
          src="/images/home/paws-indigo.svg"
        />
        <img
          alt="Paws decoration"
          className="absolute -right-10 -top-8 w-[51px] h-[48px]"
          src="/images/home/paws-green.svg"
        />
        Welcome to <strong className="font-semibold">Pups4Sale</strong>
      </span>
      <span className="text-lg mt-1">
        Join the <strong className="font-semibold">largest community</strong> of responsible <strong className="font-semibold">pet lovers.</strong>
      </span>
      <img className="mt-6" src="/images/vectors/signUp.png" />
      <div className="flex flex-col w-full items-start px-8 gap-4">
        <span className="text-[17px] font-medium px-6 py-1 border border-[#00000033] bg-[#F0EBF4] rounded-full">
          Find your perfect furry companion
        </span>
        <span className="text-[17px] font-medium px-6 py-1 border border-[#00000033] bg-[#E7F5F7] rounded-full ml-auto">
          Connect with trusted breeders & adopters
        </span>
        <span className="text-[17px] font-medium px-6 py-1 border border-[#00000033] bg-[#FCF4DC] rounded-full">
          List puppies safely and easily
        </span>
      </div>
      <span className="text-5xl font-normal text-center mt-auto">
        <strong className="relative font-semibold">
          {highlight}
          <img
            className="absolute right-0 -bottom-1 w-full"
            src="/images/vectors/line-8.svg"
          />
        </strong>{" "}
        <strong className="font-medium">{subtitle}</strong>
        <br />
        <small className="text-[32px]">
          {smallText}
        </small>
      </span>
    </div>
  );
};

export default AuthSidePanel; 