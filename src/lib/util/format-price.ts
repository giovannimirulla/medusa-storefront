export function formatAmount(
  amount: number | null | undefined,
  currencyCode: string,
  locale: string = "it-IT"
): string {
  if (amount == null) return ""
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currencyCode.toUpperCase()}`
  }
}
