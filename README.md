# ⚡ NitroLink

**NitroLink: Zap funds from any chain, stream them instantly, and settle globally. Trust Solved!**

NitroLink is an **Intent-Based Liquidity Engine** built for HackMoney 2026. We abstract away the complexity of bridges, gas, and networks, allowing users to interact with crypto at the speed of the internet.

### 🎥 [Watch the Demo Video](LINK_HERE)

---

## The Problem
Crypto UX is stuck in 2018. To pay someone, you have to ask: *"Which chain? Which token? Do I have gas there? Which bridge is safest?"*

It’s exhausting. We believe users shouldn't care about the infrastructure, they just want the **outcome**.

## The Solution
We built two core "Intent Engines":

### 1. Rapid Zap (Powered by LI.FI)
A cross-chain teleporter.
* **What it does:** Instantly moves assets from **Net 1** to **Net 2**.
* **The Tech:** We integrated the **LI.FI Core SDK** (not the pre-built widget) to build a fully custom interface.
* **How it works:** It aggregates routes, finds the most efficient path, and executes the bridge transaction in a single "Zap". No manual bridging, no switching apps.

### 2. Flash Stream (Yellow Network Architecture)
High-frequency, real-time value transfer.
* **What it does:** Streams value to a recipient at **sub-second intervals** (e.g., $0.0001 per tick).
* **The Tech:** A custom **NestJS WebSocket Gateway** that acts as an off-chain "State Channel."
* **How it works:**
    1.  **Open Channel:** User connects to the WebSocket node.
    2.  **Stream:** Value accrues off-chain in real-time (0 gas cost).
    3.  **Settlement:** User clicks "Settle," and the final accumulated balance is pushed on-chain (Base Sepolia) in one atomic transaction.

---

## Tech Stack

| Component | Technology | Why we used it |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14**, Tailwind, Shadcn/UI | Fast, reactive UI with a aesthetic dark theme look. |
| **Cross-Chain** | **LI.FI SDK** (`@lifi/sdk`) | To programmatically find and execute bridge routes without using their generic UI. |
| **State Channels** | **NestJS**, **Socket.io** | To simulate Yellow Network's off-chain "Broker" nodes for high-frequency streaming. |
| **Blockchain** | **Wagmi**, **Viem** | For wallet connection and interacting with Sepolia/Base testnets. |
| **Database** | **MongoDB** | To store transaction history and settlement records. |
| **Naming Service** | **ENS** | For ease of finding names instead of typing addresses |
---

## How to Run Locally

### Prerequisites
* Node.js 18+
* MongoDB (Local or Atlas)
* MetaMask (With Sepolia & Base Sepolia Testnet ETH)

### 1. Backend (The "Node")
The backend acts as the State Channel Coordinator.
```bash
cd apps/api
# Create a .env file with: MONGODB_URI=your_mongo_uri
npm install
npm run start:dev
# Server runs on http://localhost:5001
```

### 2. Frontend (The Interface)
```bash
cd apps/web
# Create .env.local with: NEXT_PUBLIC_WALLETCONNECT_ID=your_id
npm install
npm run dev
# App runs on http://localhost:3000
```

---

## 🧪 Testing the Flow

**Connect Wallet:** Ensure you are on Sepolia (Ethereum Testnet), make sure you have sufficient balence if not try using the faucet to get some.
Here's the link for getting faucet https://cloud.google.com/application/web3/faucet/ethereum/sepolia

**Try a Zap:**
1. Enter 0.01 ETH.
2. Click "Zap Money Instantly".
3. Watch the LI.FI SDK find the route and trigger your wallet.

**Try a Stream:**
1. Go to the Flash Stream card.
2. Enter a recipient address.
3. Click Start Stream → Watch the $$$ tick up via WebSockets.
4. Click Settle → Confirm the transaction to pay out on Base Sepolia.

---

## 🔮 What's Next?

* **Smart Triggers:** "Zap 50% of my portfolio to Stablecoins if ETH drops 10%."
* **Yellow Network Mainnet:** Replacing our WebSocket "Mock Node" with real Yellow Network broker nodes once they launch.
* **Multi-Hop Streams:** Streaming from Polygon → Optimism using LI.FI x Yellow together.

---