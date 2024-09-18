import Footer from "../components/common/footer";
import Navbar from "../components/common/navbar";
import { cn } from "../lib/tailwind-utils";
import PropTypes from "prop-types";

export default function AppLayout({ children, className }) {
  return (
    <main className={cn(" ", className)}>
      <Navbar />
      <div className="pt-[64px] min-h-screen">{children}</div>
      <Footer />
    </main>
  );
}

AppLayout.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
