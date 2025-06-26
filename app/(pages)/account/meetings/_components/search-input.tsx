import { Search } from "lucide-react";

const SearchInput: React.FC = () => {
  return (
    <>
      <div className="relative">
        <input
          type="text"
          placeholder="Search by Listing Name"
          className="p-2 pl-10 border rounded-lg"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          size={16}
        />
      </div>
    </>
  );
};

export default SearchInput;
