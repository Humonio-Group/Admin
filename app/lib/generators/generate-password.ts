const LOWERCASE = "abcdefghijklmnopqrstuvwxyz" as const;
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" as const;
const NUMBERS = "0123456789" as const;
const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?" as const;

export function generatePassword(length: number = 16): string {
  const allChars = LOWERCASE + UPPERCASE + NUMBERS + SPECIAL;

  const mandatory = [
    LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)],
    UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)],
    NUMBERS[Math.floor(Math.random() * NUMBERS.length)],
    SPECIAL[Math.floor(Math.random() * SPECIAL.length)],
  ];

  for (let i = mandatory.length; i < length; i++) {
    mandatory.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  for (let i = mandatory.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mandatory[i], mandatory[j]] = [mandatory[j], mandatory[i]];
  }

  return mandatory.join("");
}
