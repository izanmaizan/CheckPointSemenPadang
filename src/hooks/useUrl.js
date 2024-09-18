import { useLocation } from "react-router-dom"

export default function useUrl() {
  const location = useLocation()

  const { pathname, search, state, hash, key } = location

  return {
    pathname,
    search,
    state,
    hash,
    key,
  }
}
