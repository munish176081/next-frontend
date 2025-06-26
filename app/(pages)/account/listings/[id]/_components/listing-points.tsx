import { cn } from "@/_lib/utils";

interface ListingPointsProps {
  points: { name: string; value?: string | number }[];
  className?: string;
}

export const ListingPoints = ({ points, className }: ListingPointsProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 leading-4 text-gray-dark",
        className
      )}
    >
      {points.map(({ name, value }) => (
        <>
          {value ? (
            <>
              <span className="block h-1.5 w-1.5 rounded-full bg-gray-dark"></span>
              <p>
                {name} : {value}{" "}
              </p>
            </>
          ) : null}
        </>
      ))}
    </div>
  );
};
