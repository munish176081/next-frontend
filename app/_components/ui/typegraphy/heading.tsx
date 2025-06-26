import clsx from "clsx";

const classes = {
  h1: "text-h1 md:text-h1 text-gray-dark",
  h2: "text-h2 md:text-h2 text-gray-dark",
  h3: "text-h3 md:text-h3 text-gray-dark",
  h4: "text-h4 md:text-h4 text-gray-dark",
  h5: "text-h5 md:text-h5 text-gray-dark",
  h6: "text-h6 md:text-h6 text-gray-dark",
  p: "font-inter font-[500] text-[40px] leading-[21px] text-black text-center",
};

export interface HeadingProps {
  /**  */
  tag?: keyof typeof classes;

  /** Add custom classes for extra style */
  className?: string;
}

export function Heading({
  tag = "h1",
  children,
  className,
}: React.PropsWithChildren<HeadingProps>) {
  const Component = tag;

  return (
    <Component className={clsx(classes[tag], className)}>{children}</Component>
  );
}
