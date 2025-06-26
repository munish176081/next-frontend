import React from 'react';

interface SearchFormProps {}

const SearchForm: React.FC<SearchFormProps> = () => {
  return (
    <div className="absolute top-[347px] right-[34px] w-[542px] backdrop-blur bg-[#FAFAFA]/15 border border-black/20 rounded-[40px] p-10">
      <div className="flex flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-text-tertiary text-base">Buy & Sell with Confidence</p>
          
          <div className="flex flex-col gap-5">
            <h2 className="text-[34px] font-medium leading-[41px] tracking-tighter">
              Australia&apos;s #1 Puppy Marketplace
            </h2>
            
            <div className="flex flex-col gap-4">
              {/* Location input */}
              <div className="flex items-center gap-4 w-full h-[68px] border border-black rounded-[51px] px-8 form-control ">
                {/* <FiMapPin className="w-6 h-6 text-[#4B4A4A]" /> */}
                <span className="text-[#4B4A4A] text-base">Location</span>
              </div>
              
              {/* Breed selection */}
              <div className="flex items-center gap-4 w-full h-[68px] border border-black rounded-[51px] px-8">
                {/* <FiSearch className="w-6 h-6 text-[#4B4A4A]" /> */}
                <span className="text-[#4B4A4A] text-base">Select breed</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit button */}
        <button className="w-full h-[78px] bg-black text-white rounded-[45px] text-[22px] font-semibold">
          Submit
        </button>
      </div>
    </div>
  );
};

export default SearchForm;