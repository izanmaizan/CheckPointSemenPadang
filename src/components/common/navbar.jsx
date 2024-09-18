import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import useScroll from '../../hooks/useScroll'
import useUrl from '../../hooks/useUrl'
import { cn } from '../../lib/tailwind-utils'
import { Menu, Package2 } from 'lucide-react'
import { FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import SectionWrapper from './section-wrapper'

const navLinks = [
  {
    id: 1,
    name: 'Beranda',
    href: '/',
  },
  {
    id: 2,
    name: 'Dashboard',
    href: '/dashboard',
  },
  {
    id: 3,
    name: 'Konsultasi',
    href: '/konsultasi',
  },
  {
    id: 4,
    name: 'Teman Sehat',
    href: '/teman-sehat',
  },
  // {
  //   id: 5,
  //   name: 'Artikel',
  //   href: '/artikel',
  // },
]

const detectActiveLink = (pathname, link) => {
  if (link === '/' && pathname === '/') {
    return true
  }

  // Ensure the link and pathname are normalized
  const normalizedLink = link.replace(/\/$/, '') // Remove trailing slash
  const normalizedPathname = pathname.replace(/\/$/, '') // Remove trailing slash

  const linkWithoutSlash = normalizedLink.replace('/', '')
  const pathSegments = normalizedPathname
    .split('/')
    .filter((segment) => segment)

  return pathSegments.includes(linkWithoutSlash)
}
export default function Navbar() {
  const { pathname } = useUrl()
  const { isScrolled } = useScroll()

  return (
    <div
      className={cn('w-full fixed z-20 top-0 h-16  ', {
        'border-b': isScrolled,
      })}
    >
      <SectionWrapper className=" flex   items-center justify-between md:justify-normal  h-full  gap-4  bg-background ">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-x-[50px]">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <img
              src="/images/Logo.svg"
              alt=""
              className="w-[100px] h-[30px] object-cover"
            />
            <span className="sr-only">Nicfit</span>
          </Link>
          <div className="flex items-center gap-x-[50px]">
            {navLinks.map((navlink) => {
              return (
                <Link
                  key={navlink.id}
                  to={navlink.href}
                  className={cn(
                    'text-muted-foreground text-text16_24 px-[16px] py-[4px] transition-colors hover:text-foreground',
                    {
                      'bg-color-1 text-white rounded-full': detectActiveLink(
                        pathname,
                        navlink.href,
                      ),
                    },
                  )}
                >
                  {navlink.name}
                </Link>
              )
            })}
          </div>
        </nav>
        <div className="flex   w-max items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-x-5">
                <span className="text-text16_24 font-medium hidden lg:inline">
                  Yoga Agatha!
                </span>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <FaUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </div>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Acme Inc</span>
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Customers
              </Link>
              <Link href="#" className="hover:text-foreground">
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </SectionWrapper>
    </div>
  )
}

// import { useState, useEffect } from "react";
// import { hamburger, logoNicFit } from "../../assets/icons";
// import { navLinks } from "../../constants";
// import "../../index.css";

// const Nav = () => {
//   const [activeLink, setActiveLink] = useState("");

//   useEffect(() => {
//     const currentPath = window.location.pathname;
//     setActiveLink(currentPath);
//   }, []);

//   return (
//     <header className="padding-x pt-3 pb-4 absolute z-10 w-full">
//       <nav className="flex justify-between items-center max-container">
//         <a href="/">
//           <img
//             src={logoNicFit}
//             alt="logo"
//             width={130}
//             height={45}
//             className="m-0 w-[130px] h-[45px]"
//           />
//         </a>
//         <ul className="flex-1 flex justify-center items-center gap-16 max-lg:hidden font-Poppins">
//           {navLinks.map((item) => (
//             <li key={item.label} className="relative">
//               <a
//                 href={item.href}
//                 className={`nav-link font-Poppins leading-normal text-lg text-black relative p-2 ${
//                   activeLink === item.href ? "active" : ""
//                 }`}
//                 onClick={() => setActiveLink(item.href)}>
//                 {item.label}
//               </a>
//             </li>
//           ))}
//         </ul>
//         <div className="flex gap-8 text-xl leading-normal font-bold font-Poppins max-lg:hidden ">
//           <a href="/" className="p-2 hover:text-primary-text">
//             Masuk
//           </a>
//           <a
//             href="/"
//             className="bg-primary-text text-white p-2 px-5 rounded-lg hover:bg-primary-text-hover">
//             Daftar
//           </a>
//         </div>
//         <div className="hidden max-lg:block">
//           <img src={hamburger} alt="hamburger icon" width={25} height={25} />
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Nav;
