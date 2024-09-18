import { useCallback, useEffect, useState } from "react"

const useScroll = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  // with useCallback
  const handleColorNav = useCallback(() => {
    if (typeof window !== "undefined") {
      if (
        window?.scrollY >= 100 ||
        document?.body?.scrollTop >= 100 ||
        document?.documentElement?.scrollTop >= 100
      ) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleColorNav, false)
    return () => {
      window.removeEventListener("scroll", handleColorNav, false)
    }
  })
  return { isScrolled }
}

export default useScroll
