# 📊 ZenStats Explorer

ZenStats Explorer is a **Decentralized Application (Dapp)** that allows users to connect their MetaMask wallet and explore on-chain statistics. The app focuses on providing a clear and interactive interface to view **levels, XP, achievements, and blockchain-related data** from the ZenChain ecosystem.

---

## 🚀 Features

* 🔗 **MetaMask Wallet Connection**: Supports login using Ethereum accounts (Sign-In With Ethereum - SIWE).
* 📈 **Track Stats**: Display user information such as level, XP, and progress towards the next level.
* 🎨 **Modern UI**: Clean and responsive design for a smooth user experience.
* ⚡ **Realtime Updates**: Automatically refresh profile data on reload.

---

## 🛠️ Tech Stack

* **React + Vite** → Fast and optimized frontend framework with hot reload.
* **TailwindCSS** → Utility-first CSS for easy styling.
* **Ethers.js / Wagmi** → Wallet connection and Ethereum interactions.
* **ZenChain API** → Fetch user profile data (level, XP, achievements).

---

## 📂 Project Structure

```bash
zenstats-explorer/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Main pages (Dashboard, Explorer, ...)
│   ├── App.jsx         # Root component
│   └── main.jsx        # Application entry point
├── public/             # Static assets
├── package.json
└── README.md
```

---

## ⚙️ Installation & Running

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/zenstats-explorer.git
cd zenstats-explorer
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the app (development mode)

```bash
npm run dev
```

The application will be available at: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Requirements

* Node.js **>= 18**
* npm **>= 9**
* A browser with MetaMask extension installed

---

## 📸 Demo Screenshot

*(Add screenshots of your app here if available)*

---

## 📌 Notes

* The Dapp requires MetaMask to be connected to **Ethereum Mainnet or a supported testnet**.
* ZenChain APIs may require a session cookie (`web3session`). For production use, consider implementing a backend proxy for enhanced security.

---

## 📜 License

MIT License © 2025 ZenStats Explorer
