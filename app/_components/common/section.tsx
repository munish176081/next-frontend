import { Text } from "@/_components/ui/typegraphy/text";
import clsx from "clsx";
import { Heading } from "../ui/typegraphy";

type SectionProps = {
  className?: string;
  id?: string;
  children: React.ReactNode;
  tag?: "section" | "div";
  headerClassName?: string;
  headerIcon?: React.ReactNode;
  showHeaderIcon?: boolean;
  title?: string;
  titleClassName?: string;
  description?: string;
  descriptionClassName?: string;
  rightElement?: React.ReactNode;
  iscontainer?: boolean;
};
export default function Section({
  children,
  className,
  id,
  tag = "section",
  title,
  titleClassName = "font-inter font-[500]",
  descriptionClassName = "font-normal capitalize leading-6 text-secondary 4xl:text-lg",
  description,
  headerClassName,
  rightElement,
  headerIcon,
  iscontainer = true,
  showHeaderIcon = false,
}: SectionProps) {
  const Component = tag;
  return (
    <div className={iscontainer ? "container mx-auto" : " mx-auto"}>
      <Component className={className} id={id}>
        {showHeaderIcon && (
          <div className="flex justify-center mb-8">
            {headerIcon && <div>{headerIcon}</div>}
          </div>
        )}
        {title && (
          <div className={clsx("flex justify-center", headerClassName)}>
            <div className="flex flex-col gap-6">
              <Heading tag="h1" className={titleClassName}>
                {title}
              </Heading>
              {description && (
                <Text
                  className={descriptionClassName}
                  isHtml={true}
                  htmlContent={description}
                />
              )}
            </div>
            {rightElement && <div>{rightElement}</div>}
          </div>
        )}
        {children}
      </Component>
    </div>
  );
}
