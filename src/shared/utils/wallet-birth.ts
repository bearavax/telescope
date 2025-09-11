import { Address } from "viem";

/**
 * Get the wallet's birth year based on the address
 * This is a simplified approach - in a real implementation, you'd query the blockchain
 * to find the first transaction for this address
 */
export function getWalletBirthYear(address: Address): number {
  // For now, we'll use a simple hash-based approach to determine birth year
  // In a real implementation, you'd query the blockchain for the first transaction
  
  // Convert address to a number and use it to determine birth year
  const addressNum = parseInt(address.slice(2, 10), 16);
  
  // Map to years between 2020-2025 based on address value
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const yearIndex = addressNum % years.length;
  
  return years[yearIndex];
}

/**
 * Get the class badge for a wallet based on its birth year
 */
export function getWalletClassBadge(birthYear: number): {
  text: string;
  color: string;
  bgColor: string;
} {
  return {
    text: `Class of ${birthYear}`,
    color: "text-gray-700",
    bgColor: "bg-gray-100"
  };
}
