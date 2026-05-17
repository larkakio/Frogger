"use client";

import {
  useConnect,
  useAccount,
  useChainId,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function WalletBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const wrongNetwork = isConnected && chainId !== base.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const short = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  const sheet =
    sheetOpen && mounted ? (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect wallet"
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm"
        onClick={() => setSheetOpen(false)}
      >
        <div
          className="w-full max-w-lg rounded-t-2xl border border-cyan-500/40 bg-[#0a0a12] p-4 shadow-[0_0_40px_rgba(0,245,255,0.2)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm tracking-widest text-cyan-300">
              CONNECT WALLET
            </h2>
            <button
              type="button"
              aria-label="Close"
              className="rounded border border-white/20 px-2 py-1 text-xs text-white/70"
              onClick={() => setSheetOpen(false)}
            >
              ✕
            </button>
          </div>
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {connectors.length === 0 ? (
              <li className="py-4 text-center text-sm text-white/50">
                No wallets available. Open in a wallet browser or install an
                extension.
              </li>
            ) : (
              connectors.map((connector) => (
                <li key={connector.uid}>
                  <button
                    type="button"
                    disabled={isPending}
                    className="w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-left text-sm text-cyan-100 transition hover:bg-cyan-500/20 disabled:opacity-50"
                    onClick={() => {
                      connect({ connector, chainId: base.id });
                      setSheetOpen(false);
                    }}
                  >
                    {connector.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    ) : null;

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 px-3 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <span className="font-display text-sm tracking-[0.2em] text-cyan-400 sm:text-xs sm:tracking-[0.25em]">
        NEON FROGGER
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {wrongNetwork && (
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: base.id })}
            className="rounded border border-fuchsia-500/60 bg-fuchsia-500/20 px-2 py-1 font-mono text-[10px] uppercase text-fuchsia-200"
          >
            Wrong network — Switch to Base
          </button>
        )}
        {isConnected ? (
          <>
            <span className="font-mono text-[10px] text-lime-300">{short}</span>
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded border border-white/20 px-2 py-1 text-[10px] text-white/70"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="rounded border border-cyan-400/50 bg-cyan-500/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan-200"
          >
            Connect wallet
          </button>
        )}
      </div>
      {mounted && sheet ? createPortal(sheet, document.body) : null}
    </header>
  );
}
