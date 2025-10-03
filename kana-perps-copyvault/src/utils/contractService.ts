import { Aptos, AptosConfig, Network, InputViewFunctionData } from "@aptos-labs/ts-sdk";

const MODULE_ADDRESS = "0x71940f0f7409ef0324c67cca8c9c191682118b19df6b7e2852ffcd23a0d407a1";
const MODULE_NAME = "perps_vault";

// Initialize Aptos client with proper config
const config = new AptosConfig({ network: Network.TESTNET });
export const aptosClient = new Aptos(config);

// Contract function interfaces
export interface VaultInfo {
  trader_following: string;
  collateral: string;
  max_leverage: string;
  is_active: boolean;
}

export interface TraderStats {
  total_followers: string;
  total_positions: string;
  win_rate: string;
}

/**
 * Create a new vault
 */
export const createVault = async (
  signAndSubmitTransaction: any,
  traderAddress: string,
  initialCollateral: number, // in APT (e.g., 10 = 10 APT)
  maxLeverage: number // 1-20
) => {
  try {
    const response = await signAndSubmitTransaction({
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_vault`,
        typeArguments: [],
        functionArguments: [
          traderAddress,
          (initialCollateral * 100000000).toString(), // Convert APT to octas
          maxLeverage.toString(),
        ],
      },
    });

    // Wait for transaction
    await aptosClient.waitForTransaction({
      transactionHash: response.hash,
    });

    return response;
  } catch (error) {
    console.error("Error creating vault:", error);
    throw error;
  }
};

/**
 * Add collateral to existing vault
 */
export const addCollateral = async (
  signAndSubmitTransaction: any,
  amount: number // in APT
) => {
  try {
    const response = await signAndSubmitTransaction({
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::add_collateral`,
        typeArguments: [],
        functionArguments: [(amount * 100000000).toString()],
      },
    });

    await aptosClient.waitForTransaction({
      transactionHash: response.hash,
    });

    return response;
  } catch (error) {
    console.error("Error adding collateral:", error);
    throw error;
  }
};

/**
 * Withdraw collateral from vault
 */
export const withdrawCollateral = async (
  signAndSubmitTransaction: any,
  amount: number // in APT
) => {
  try {
    const response = await signAndSubmitTransaction({
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::withdraw_collateral`,
        typeArguments: [],
        functionArguments: [(amount * 100000000).toString()],
      },
    });

    await aptosClient.waitForTransaction({
      transactionHash: response.hash,
    });

    return response;
  } catch (error) {
    console.error("Error withdrawing collateral:", error);
    throw error;
  }
};

/**
 * Toggle vault active status
 */
export const toggleVaultStatus = async (signAndSubmitTransaction: any) => {
  try {
    const response = await signAndSubmitTransaction({
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::toggle_vault_status`,
        typeArguments: [],
        functionArguments: [],
      },
    });

    await aptosClient.waitForTransaction({
      transactionHash: response.hash,
    });

    return response;
  } catch (error) {
    console.error("Error toggling vault status:", error);
    throw error;
  }
};

/**
 * Check if a vault exists for an address
 */
export const checkVaultExists = async (address: string): Promise<boolean> => {
  try {
    console.log('Checking if vault exists for:', address);
    
    // Try to fetch the PerpsVault resource directly
    const resource = await aptosClient.getAccountResource({
      accountAddress: address,
      resourceType: `${MODULE_ADDRESS}::${MODULE_NAME}::PerpsVault`
    });
    
    console.log('Vault resource found:', resource);
    return true;
  } catch (error: any) {
    console.log('Vault resource check failed:', error?.message || error);
    return false;
  }
};

/**
 * Get vault info (view function)
 */
export const getVaultInfo = async (vaultOwner: string): Promise<VaultInfo | null> => {
  try {
    console.log('Fetching vault info for:', vaultOwner);
    
    const payload: InputViewFunctionData = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_vault_info`,
      typeArguments: [],
      functionArguments: [vaultOwner],
    };

    const result = await aptosClient.view({ payload });
    console.log('Raw vault info result:', result);
    
    if (!result || result.length === 0) {
      console.log('No vault data returned');
      return null;
    }
    
    return {
      trader_following: result[0] as string,
      collateral: result[1] as string,
      max_leverage: result[2] as string,
      is_active: result[3] as boolean,
    };
  } catch (error: any) {
    console.error("Error getting vault info:", error);
    console.error("Error details:", error?.message || error);
    // If the error is "resource not found" or similar, the vault doesn't exist
    if (error?.message?.includes('not found') || error?.status === 404) {
      console.log('Vault does not exist for this address');
      return null;
    }
    return null;
  }
};

/**
 * Get trader stats (view function)
 */
export const getTraderStats = async (traderAddress: string): Promise<TraderStats | null> => {
  try {
    const payload: InputViewFunctionData = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_trader_stats`,
      typeArguments: [],
      functionArguments: [traderAddress],
    };

    const result = await aptosClient.view({ payload });
    
    return {
      total_followers: result[0] as string,
      total_positions: result[1] as string,
      win_rate: result[2] as string,
    };
  } catch (error) {
    console.error("Error getting trader stats:", error);
    return null;
  }
};

/**
 * Get position count (view function)
 */
export const getPositionCount = async (vaultOwner: string): Promise<number> => {
  try {
    const payload: InputViewFunctionData = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_position_count`,
      typeArguments: [],
      functionArguments: [vaultOwner],
    };

    const result = await aptosClient.view({ payload });
    return Number(result[0]);
  } catch (error) {
    console.error("Error getting position count:", error);
    return 0;
  }
};

/**
 * Helper: Convert octas to APT
 */
export const octasToAPT = (octas: string | number): number => {
  return Number(octas) / 100000000;
};

/**
 * Helper: Convert APT to octas
 */
export const aptToOctas = (apt: number): string => {
  return (apt * 100000000).toString();
};

/**
 * Helper: Format win rate from basis points
 */
export const formatWinRate = (basisPoints: string | number): string => {
  return (Number(basisPoints) / 100).toFixed(2) + "%";
};