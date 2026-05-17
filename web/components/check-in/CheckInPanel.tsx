"use client";

import { checkInAbi } from "@/lib/contracts/checkInAbi";
import { getCheckInDataSuffix } from "@/lib/wagmi/config";
import { useAccount, useChainId, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";

const CONTRACT = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

export function CheckInPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const { data: streak } = useReadContract({
    address: CONTRACT,
    abi: checkInAbi,
    functionName: "streak",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(CONTRACT && address) },
  });

  const disabled =
    !isConnected ||
    !CONTRACT ||
    isWriting ||
    isSwitching;

  async function handleCheckIn() {
    if (!CONTRACT || !isConnected) return;
    const baseId = base.id;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    const dataSuffix = getCheckInDataSuffix();
    await writeContractAsync({
      address: CONTRACT,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: baseId,
      ...(dataSuffix ? { dataSuffix } : {}),
    });
  }

  return (
    <section className="neon-card mx-2 mb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0 p-3 sm:mx-3">
      <h2 className="font-display mb-2 text-xs tracking-[0.2em] text-fuchsia-300">
        DAILY CHECK-IN
      </h2>
      {!CONTRACT ? (
        <p className="font-mono text-[10px] text-white/40">
          Set NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS after deploy.
        </p>
      ) : (
        <>
          {streak != null && isConnected && (
            <p className="mb-2 font-mono text-[10px] text-lime-300">
              Streak: {streak.toString()} day{streak === BigInt(1) ? "" : "s"}
            </p>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={handleCheckIn}
            className="w-full rounded border border-lime-400/50 bg-lime-500/15 py-2 font-mono text-[10px] uppercase tracking-wider text-lime-200 disabled:opacity-40"
          >
            {isWriting || isSwitching ? "Confirm in wallet…" : "Check in on Base"}
          </button>
          <p className="mt-1 font-mono text-[9px] text-white/30">
            Gas only — no ETH sent with check-in.
          </p>
        </>
      )}
    </section>
  );
}
