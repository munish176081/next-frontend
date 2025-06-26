import clsx from "clsx";

const classes = {
  p: "font-inter text-2xl text black font-[400]",
  i: "",
  b: "",
  q: "text-quote",
  em: "",
  strong: "",
  small: "",
  span: "",
  del: "",
  mark: "",
  abbr: "cursor-help",
  pre: "border-2 border-gray-300 py-3 px-4 rounded-xl bg-gray-100",
  code: "border border-gray-300 py-2 px-3 rounded-md shadow",
  kbd: "bg-gray-100 border border-gray-300 text-gray-900 rounded-lg leading-none inline-flex items-center justify-center text-sm py-1.5 px-2",
  blockquote: "border-l-4 border-gray-300 text-quote py-3 px-4",
  sub: "",
  sup: "",
};

export interface TextProps {
  tag?: keyof typeof classes;
  title?: string;
  className?: string;
  isHtml?: boolean; // ✨ NEW
  htmlContent?: string; // ✨ NEW for html
}

export function Text({
  tag = "p",
  title,
  children,
  className,
  isHtml = false,
  htmlContent,
}: React.PropsWithChildren<TextProps>) {
  const Component = tag;

  if (tag === "abbr" && title === undefined) {
    console.warn("title attribute is missing for abbr tag.");
  }

  if (isHtml && htmlContent) {
    return (
      <Component
        {...(title && { title })}
        // className={clsx(classes[tag], className)}
        className="font-inter text-2xl text black font-[400]"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      // <p className="font-inter text-2xl text black font-[400]">Find your <strong> perfect puppy </strong> by exploring different <strong>breeds.</strong> Click on a breed to view available <strong>puppies</strong> and bring home your <strong>new best friend!</strong></p>
    );
  }

  return (
    <Component {...(title && { title })} className={clsx(classes[tag], className)}>
      {children}
    </Component>
  );
}
