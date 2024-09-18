import { cn } from "@/lib/tailwind-utils"
import PropTypes from "prop-types"

export default function GuestLayout({ children, className }) {
  return <main className={cn(className)}>{children}</main>
}

GuestLayout.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}
