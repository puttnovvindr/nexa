export function useDuplicateValidator() {
  function isDuplicate<T>(
    data: T[],
    value: string,
    key: keyof T
  ): boolean {
    return data.some((item) => {
      const itemValue = String(item[key] || "").toLowerCase().trim()
      return itemValue === value.toLowerCase().trim()
    })
  }

  return { isDuplicate }
}