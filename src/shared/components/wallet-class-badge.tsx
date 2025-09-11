"use client";

import { Address } from "viem";
import { getWalletBirthYear, getWalletClassBadge } from "@/shared/utils/wallet-birth";

interface WalletClassBadgeProps {
  address: Address;
}

export function WalletClassBadge({ address }: WalletClassBadgeProps) {
  const birthYear = getWalletBirthYear(address);
  const badge = getWalletClassBadge(birthYear);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bgColor} ${badge.color}`}>
      {badge.text}
    </span>
  );
}
