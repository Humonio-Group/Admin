const TIERS = [
  { threshold: 1e12, divisor: 1e12, suffix: "T" },
  { threshold: 1e9,  divisor: 1e9,  suffix: "B" },
  { threshold: 1e6,  divisor: 1e6,  suffix: "M" },
  { threshold: 1e3,  divisor: 1e3,  suffix: "k" },
];

export function useNumberFormat(decimals: number = 1) {
  function format(value: number): string {
    const tier = TIERS.find(t => Math.abs(value) >= t.threshold);
    if (!tier) return Number.isInteger(value) ? value.toString() : value.toFixed(decimals);
    const sign = value < 0 ? "-" : "";
    return `${sign}${(Math.floor(Math.abs(value) / (tier.divisor / 10)) / 10).toFixed(decimals)}${tier.suffix}`;
  }

  function separate(value: number, separator: string = " "): string {
    const [integer, decimal] = value.toString().split(".");
    const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decimal ? `${formatted}.${decimal}` : formatted;
  }

  return { format, separate };
}
