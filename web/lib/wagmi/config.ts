import { getBuilderDataSuffix } from "@/lib/builder/attribution";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { baseAccount, injected, walletConnect } from "wagmi/connectors";

const dataSuffix = getBuilderDataSuffix();

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    baseAccount({ appName: "Neon Frogger" }),
    ...(wcProjectId
      ? [
          walletConnect({
            projectId: wcProjectId,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  ...(dataSuffix ? { dataSuffix } : {}),
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export { getBuilderDataSuffix as getCheckInDataSuffix };
