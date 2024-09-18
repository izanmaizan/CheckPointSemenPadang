import { cn } from "../../lib/tailwind-utils";
import PropTypes from "prop-types";

export default function SectionWrapper({ className, children }) {
  return (
    <div className={cn("max-w-screen-xl mx-auto px-4 md:px-6", className)}>
      {children}
    </div>
  );
}

SectionWrapper.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
