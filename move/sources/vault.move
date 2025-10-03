module copyvault::perps_vault {
    use std::signer;
    use std::vector;
    use aptos_framework::coin::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;

    /// Errors
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_VAULT_NOT_FOUND: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_ALREADY_FOLLOWING: u64 = 4;
    const E_INVALID_LEVERAGE: u64 = 5;

    /// Vault structure - holds collateral and follows a trader
    struct PerpsVault has key {
        owner: address,
        trader_following: address,
        collateral: u64, // APT collateral
        max_leverage: u64, // Maximum leverage (1-20x)
        created_at: u64,
        total_positions_copied: u64,
        is_active: bool,
    }

    /// Trader profile with performance metrics
    struct TraderProfile has key {
        total_followers: u64,
        total_volume: u64,
        realized_pnl: u64,
        total_positions: u64,
        win_rate: u64, // Basis points (7250 = 72.50%)
    }

    /// Position tracking (mirror of Kana positions)
    struct Position has store, drop {
        market: vector<u8>, // e.g., "BTC-PERP"
        side: bool, // true = long, false = short
        size: u64,
        entry_price: u64,
        leverage: u64,
        timestamp: u64,
    }

    /// Vault positions store
    struct VaultPositions has key {
        positions: vector<Position>,
    }

    /// Global tracker for trader follower counts (since we can't modify trader's account)
    struct GlobalTraderStats has key {
        trader_address: address,
        follower_count: u64,
    }

    /// Events (kept for backward compatibility)
    struct VaultCreatedEvent has drop, store {
        owner: address,
        trader: address,
        collateral: u64,
    }

    struct PositionCopiedEvent has drop, store {
        vault_owner: address,
        market: vector<u8>,
        side: bool,
        size: u64,
    }

    /// Create vault - simplified version
    public entry fun create_vault(
        user: &signer,
        trader_address: address,
        initial_collateral: u64,
        max_leverage: u64,
    ) {
        let user_addr = signer::address_of(user);
        
        // Validate
        assert!(!exists<PerpsVault>(user_addr), E_ALREADY_FOLLOWING);
        assert!(max_leverage >= 1 && max_leverage <= 20, E_INVALID_LEVERAGE);

        // Transfer collateral
        let coins = coin::withdraw<AptosCoin>(user, initial_collateral);
        coin::deposit(user_addr, coins);

        // Create vault
        move_to(user, PerpsVault {
            owner: user_addr,
            trader_following: trader_address,
            collateral: initial_collateral,
            max_leverage,
            created_at: timestamp::now_seconds(),
            total_positions_copied: 0,
            is_active: true,
        });

        // Initialize positions store
        move_to(user, VaultPositions {
            positions: vector::empty<Position>(),
        });

        // Note: Trader stats will be tracked globally or traders need to register themselves
    }

    /// Traders can register themselves to track their stats
    public entry fun register_as_trader(trader: &signer) {
        let trader_addr = signer::address_of(trader);
        if (!exists<TraderProfile>(trader_addr)) {
            move_to(trader, TraderProfile {
                total_followers: 0,
                total_volume: 0,
                realized_pnl: 0,
                total_positions: 0,
                win_rate: 0,
            });
        };
    }

    /// Add collateral to vault
    public entry fun add_collateral(
        user: &signer,
        amount: u64,
    ) acquires PerpsVault {
        let user_addr = signer::address_of(user);
        assert!(exists<PerpsVault>(user_addr), E_VAULT_NOT_FOUND);

        let vault = borrow_global_mut<PerpsVault>(user_addr);
        let coins = coin::withdraw<AptosCoin>(user, amount);
        coin::deposit(user_addr, coins);
        
        vault.collateral = vault.collateral + amount;
    }

    /// Withdraw collateral from vault (only if no open positions)
    public entry fun withdraw_collateral(
        user: &signer,
        amount: u64,
    ) acquires PerpsVault, VaultPositions {
        let user_addr = signer::address_of(user);
        assert!(exists<PerpsVault>(user_addr), E_VAULT_NOT_FOUND);

        let vault = borrow_global_mut<PerpsVault>(user_addr);
        let positions = borrow_global<VaultPositions>(user_addr);
        
        // Ensure no open positions
        assert!(vector::is_empty(&positions.positions), E_NOT_AUTHORIZED);
        assert!(vault.collateral >= amount, E_INSUFFICIENT_BALANCE);

        vault.collateral = vault.collateral - amount;

        let coins = coin::withdraw<AptosCoin>(user, amount);
        coin::deposit(user_addr, coins);
    }

    /// Record a position copy (called by keeper/backend)
    public entry fun record_position_copy(
        vault_owner: address,
        market: vector<u8>,
        side: bool,
        size: u64,
        entry_price: u64,
        leverage: u64,
    ) acquires PerpsVault, VaultPositions, TraderProfile {
        assert!(exists<PerpsVault>(vault_owner), E_VAULT_NOT_FOUND);
        
        let vault = borrow_global_mut<PerpsVault>(vault_owner);
        vault.total_positions_copied = vault.total_positions_copied + 1;

        let positions = borrow_global_mut<VaultPositions>(vault_owner);
        let position = Position {
            market,
            side,
            size,
            entry_price,
            leverage,
            timestamp: timestamp::now_seconds(),
        };
        vector::push_back(&mut positions.positions, position);

        // Update trader stats if they're registered
        if (exists<TraderProfile>(vault.trader_following)) {
            let trader_profile = borrow_global_mut<TraderProfile>(vault.trader_following);
            trader_profile.total_positions = trader_profile.total_positions + 1;
        };
    }

    /// Close a position
    public entry fun close_position(
        vault_owner: address,
        position_index: u64,
    ) acquires VaultPositions {
        let positions = borrow_global_mut<VaultPositions>(vault_owner);
        vector::remove(&mut positions.positions, position_index);
    }

    /// Pause/unpause vault
    public entry fun toggle_vault_status(
        user: &signer,
    ) acquires PerpsVault {
        let user_addr = signer::address_of(user);
        let vault = borrow_global_mut<PerpsVault>(user_addr);
        vault.is_active = !vault.is_active;
    }

    #[view]
    public fun get_vault_info(vault_owner: address): (address, u64, u64, bool) acquires PerpsVault {
        assert!(exists<PerpsVault>(vault_owner), E_VAULT_NOT_FOUND);
        let vault = borrow_global<PerpsVault>(vault_owner);
        (
            vault.trader_following,
            vault.collateral,
            vault.max_leverage,
            vault.is_active
        )
    }

    #[view]
    public fun get_trader_stats(trader: address): (u64, u64, u64) acquires TraderProfile {
        if (!exists<TraderProfile>(trader)) {
            return (0, 0, 0)
        };
        let profile = borrow_global<TraderProfile>(trader);
        (
            profile.total_followers,
            profile.total_positions,
            profile.win_rate
        )
    }

    #[view]
    public fun get_position_count(vault_owner: address): u64 acquires VaultPositions {
        if (!exists<VaultPositions>(vault_owner)) {
            return 0
        };
        let positions = borrow_global<VaultPositions>(vault_owner);
        vector::length(&positions.positions)
    }
}