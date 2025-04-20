# NFT Game Rental - Unlock Game Access with Time-Limited NFTs on Polkadot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Elevator Pitch

NFT Rental Game revolutionizes game access by transforming playtime into **secure, time-limited NFTs** on the Polkadot Asset Hub. Players gain true ownership and flexible access, while developers unlock innovative monetization models and enhanced security, all powered by our custom smart contract.

---

## The Problem

The current digital game market faces challenges for both players and developers:

**For Gamers:**
*   💰 **High Upfront Costs:** Expensive full-game purchases create barriers to entry.
*   🔒 **Lack of Ownership:** Digital licenses typically cannot be resold or traded.
*   ⏳ **Inflexible Access:** Subscriptions often mean paying for unused time; no easy short-term options exist.

**For Developers:**
*   💸 **Limited Monetization:** Difficulty offering flexible paid trials, event passes, or granular access tiers.
*   📈 **Player Acquisition Hurdles:** Converting hesitant players requires lower-friction entry points.
*   🛡️ **Piracy & Access Control:** Ensuring legitimate, time-bound access is complex and costly.

---

## Our Solution: Time-Bound NFT Game Keys

NFT Rental Game provides a **one-stop solution** leveraging Polkadot's Asset Hub:

1.  **NFTs as Access Keys:** We utilize NFTs (`pallet-nfts` standard) on Asset Hub to represent **time-limited access rights** to a game.
2.  **Custom Smart Contract:** Our unique `ink!` (or `Solang`, if applicable) smart contract deployed on Asset Hub manages the core **time-lock verification logic**. It checks if an NFT is currently valid for access based on its mint time and duration.
3.  **On-Chain Verification:** Game clients (or backend servers) query our smart contract directly to verify a player's NFT access pass, ensuring secure, transparent, and decentralized validation.

**This creates a WIN-WIN:**
*   **Players:** Buy exactly the playtime they need (e.g., weekend pass, 10-hour trial), truly own their access, and can potentially trade/sell unused time on secondary markets.
*   **Developers:** Gain new revenue streams, offer secure paid trials, reduce friction for new players, and leverage blockchain security against unauthorized access.

---

## Key Features

*   🔑 **Time-Limited NFTs:** Granular control over access duration (hours, days, events).
*   ✅ **On-Chain Verification:** Secure and trustless access validation via smart contract.
*   🔄 **Tradable Access:** Players can potentially resell or trade their NFT passes.
*   💡 **Flexible Monetization:** Enables paid demos, weekend passes, event tickets, etc.
*   🛡️ **Enhanced Security:** Leverages blockchain immutability and transparency.
*   🌐 **Built on Polkadot:** Utilizes the efficiency and low fees of Asset Hub.

---

## Technology Stack

*   **Blockchain:** Polkadot Asset Hub
*   **Smart Contract Language:** `ink!` (Rust-based WASM) / `Solang` (Solidity for WASM) - *Specify which one you used!*
*   **NFT Standard:** `pallet-nfts` (Native on Asset Hub)
*   **Frontend:** React, Javascript, TailwindCSS
*   **Wallet Integration:** Polkadot

---

## Demo

**(Highly Recommended: Embed an animated GIF or link to a short video showcasing the workflow: e.g., user connects wallet -> game checks NFT via contract -> access granted/denied with timer)**

[Link to Demo Video/GIF]

Watch how a user connects their Polkadot wallet, and our system verifies their time-limited NFT access pass against the on-chain smart contract to grant game access.

---

## How It Works (Conceptual Flow)

1.  **Minting:** A game developer (or the platform) mints an NFT on Asset Hub using our defined collection, embedding the access duration metadata.
2.  **Acquisition:** A player acquires the NFT (purchase, reward, etc.).
3.  **Verification Request:** Player attempts to launch the game and connects their Polkadot wallet.
4.  **Smart Contract Call:** The game client (or an intermediary service) calls the `check_access(nft_id)` function on our deployed smart contract, providing the player's NFT details.
5.  **Logic Execution:** The smart contract reads the NFT's mint time and duration, compares it with the current blockchain time, and returns `true` (access granted) or `false` (access denied/expired).
6.  **Access Granted/Denied:** The game client enforces the access based on the smart contract's response.

---

## Smart Contract Details

Our custom smart contract is the core logic engine.

*   **Location:** Deployed on Polkadot Asset Hub ([Link to contract on Subscan/PolkadotJS Apps if available - Testnet link is fine!])
*   **Language:** Written in [`ink!`/`Solang`] - *Choose one*.
*   **Key Functions:**
    *   `mint_access_nft(duration, owner)`: Creates a new time-locked NFT. (May be restricted)
    *   `check_access(nft_id)`: Verifies if the NFT grants access *at the current time*. This is the primary function called by games.
    *   `get_expiry_time(nft_id)`: Returns the calculated expiration time for an NFT.
*   **Source Code:** [Link to the `/contracts` or relevant directory in your repository]

**Note:** This contract goes beyond standard NFT minting by implementing specific time-verification logic crucial for the use case.

---

## Business Potential & Impact

*   **Market Opportunity:** Taps into the growing demand for flexible game access models and digital ownership ($X Billion gaming market).
*   **Developer Benefits:** Unlocks new revenue streams, improves player conversion funnels, offers enhanced anti-piracy compared to traditional methods.
*   **Gamer Benefits:** Provides affordable entry points, true ownership, and potential resale value for game access.
*   **Scalability:** Polkadot's architecture offers scalability and future interoperability (XCM) potential for cross-game or cross-chain passes.
*   **Innovation:** A novel application of NFTs beyond simple collectibles, creating tangible utility.

---

## Future Roadmap (Next 6 Months)

*   **Month 1:** Refine & Test MVP | Initiate Partner Outreach
*   **Month 3:** Begin Pilot Integration with 1+ game | Build Basic Developer Tools
*   **Month 6:** Launch Audited V1 Platform (Mainnet/Testnet) | Enable Basic NFT Trading

See our presentation slides or project documentation for the extended roadmap (1-3 years).

---

## The Team

*   Soong En Wong - Imperial 2nd year
*   Ruben Vorster - Imperial 3rd year
*   Valdis Lenkevics - Data Engineer (Trading)
*   Rayn Lakha - Incoming @ Oxford
*   Giorgaki Potsi - Data Analyst (Insurance)


**Presentation Slides**
https://www.canva.com/design/DAGlGmT2YxU/Yjc9Ar6ehF0LTls6HYeb-Q/edit#

---

## Getting Started (Development)

**(Optional: Include if others can easily run your project locally)**

1.  Clone the repository: `git clone [your-repo-url]`
2.  Navigate to the project directory: `cd [project-name]`
3.  Install dependencies:
    *   Frontend: `cd frontend && npm install` (or yarn)
    *   Contracts: Follow `ink!` / `Solang` setup guides.
4.  [Add specific build/run commands for frontend and contract deployment/testing]

---

## Contributing

We welcome contributions! Please see our `CONTRIBUTING.md` file for guidelines. (Optional: Create this file if you want contributions).

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
