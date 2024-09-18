export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const formatDotString = (string, longOfString) => {
  return string.length < longOfString
    ? string
    : string.substring(0, longOfString) + "..."
}
