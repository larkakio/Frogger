import { CheckInPanel } from "@/components/check-in/CheckInPanel";
import { FroggerGame } from "@/components/game/FroggerGame";
import { WalletBar } from "@/components/wallet/WalletBar";

export default function Home() {
  return (
    <>
      <WalletBar />
      <main className="game-shell flex min-h-0 flex-1 flex-col overflow-hidden">
        <FroggerGame />
        <CheckInPanel />
      </main>
    </>
  );
}
