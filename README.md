# ZenStats Explorer

ZenStats Explorer is a decentralized application (Dapp) that allows users to explore and visualize blockchain statistics on the ZenChain ecosystem. It provides an intuitive interface to connect wallets, fetch data, and display user profiles, levels, and achievements.

---

## Features

* 🌐 Connect with MetaMask wallet
* 📊 Explore ZenChain statistics
* 🏆 View user profile and achievements (via ZenQuest APIs)
* ⚡ Fast and modern React + Vite frontend
* 🎨 Styled with TailwindCSS for a clean UI

---

## Prerequisites

Before running the project, make sure you have:

* **Node.js** (>= 16.x recommended)
* **npm** (comes with Node.js)
* A web3 wallet (e.g., MetaMask) installed in your browser

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ngh1105/zenstats-explorer.git
cd zenstats-explorer
npm install
```

---

## Development

To start the development server:

```bash
npm run dev
```

By default, the app will run on [http://localhost:5173](http://localhost:5173).

---

## Usage

1. Open the app in your browser
2. Click **Connect Wallet** to link your MetaMask account
3. Explore ZenChain statistics and your ZenQuest profile data
4. Track your achievements and XP in real-time

---

## API Integration

ZenStats Explorer integrates with **ZenQuest APIs** to fetch:

* User profile data (`/api/get-profile-data`)
* Level and XP information

Make sure to include your session cookie (`web3session`) for authenticated requests.

---

## Build for Production

To build an optimized version:

```bash
npm run build
```

This will generate the production-ready files inside the `dist/` directory.

---

## License

This project is licensed under the MIT License. Feel free to use and modify it for your own purposes.
