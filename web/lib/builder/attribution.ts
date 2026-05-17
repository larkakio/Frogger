import { Attribution } from "ox/erc8021";

/** From base.dev → Settings → Builder Code (ERC-8021). */
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BUILDER_CODE ?? "bc_2lsx81gv";

const suffixOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX as
  | `0x${string}`
  | undefined;

/**
 * ERC-8021 data suffix for wagmi / viem transactions.
 * @see https://docs.base.org/apps/builder-codes/app-developers
 */
export function getBuilderDataSuffix(): `0x${string}` | undefined {
  if (BUILDER_CODE && BUILDER_CODE.startsWith("bc_")) {
    return Attribution.toDataSuffix({ codes: [BUILDER_CODE] });
  }
  if (suffixOverride) {
    return suffixOverride;
  }
  return undefined;
}
