import { UploadCloud } from "lucide-react";
import { Text } from "@/_components/ui/typegraphy";

interface FileUploaderProps {
  label?: string;
  description?: string;
  onChange: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
}

export const FileUploader = ({
  label,
  description,
  onChange,
  accept,
  multiple = false,
}: FileUploaderProps) => {
  return (
    <label className="block mb-4 cursor-pointer">
      {label && (
        <span className="block text-base font-bold leading-7 mb-2">
          {label}
        </span>
      )}

      <div className="border rounded-md flex flex-col items-center justify-center h-60">
        <UploadCloud size={40} />
        <Text className="mt-4 text-xl md:text-2xl font-medium">
          {description || "Click or drag images here to upload"}
        </Text>

        <input
          className="hidden"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            const files = e.target.files;
            if (!files) return;

            onChange(files);
          }}
        />
      </div>
    </label>
  );
};
