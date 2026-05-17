import { Attribution } from "ox/erc8021";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { baseAccount, injected, walletConnect } from "wagmi/connectors";

const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE;
const suffixOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX as
  | `0x${string}`
  | undefined;

let dataSuffix: `0x${string}` | undefined;
if (builderCode) {
  dataSuffix = Attribution.toDataSuffix({ codes: [builderCode] });
} else if (suffixOverride) {
  dataSuffix = suffixOverride;
}

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

export function getCheckInDataSuffix(): `0x${string}` | undefined {
  return dataSuffix;
}
