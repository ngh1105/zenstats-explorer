import { ethers } from "ethers";
import abi from "../abi/SimpleStorageABI.json";
import bytecodeJson from "../abi/SimpleStorageBytecode.json";

/**
 * Sanitize bytecode to ensure proper format
 * @param {string|object} raw - Raw bytecode from artifact
 * @returns {string} Properly formatted bytecode
 */
function sanitizeBytecode(raw) {
  let bytecode;
  
  if (typeof raw === "string") {
    bytecode = raw.startsWith("0x") ? raw : "0x" + raw;
  } else if (typeof raw === "object" && raw.bytecode) {
    bytecode = raw.bytecode.startsWith("0x") ? raw.bytecode : "0x" + raw.bytecode;
  } else if (typeof raw === "object" && raw.object) {
    bytecode = raw.object.startsWith("0x") ? raw.object : "0x" + raw.object;
  } else {
    throw new Error("Bytecode phải là chuỗi hoặc object có trường bytecode/object");
  }
  
  // Validate hex format
  if (!/^0x[0-9a-fA-F]*$/.test(bytecode) || bytecode.length % 2 !== 0) {
    throw new Error("Bytecode không phải hex hợp lệ");
  }
  
  return bytecode;
}

/**
 * Deploy SimpleStorage contract
 * @param {ethers.BrowserProvider} provider - Ethers provider
 * @returns {Promise<{address: string, txHash: string}>}
 */
export async function deploySimpleStorage(provider) {
  try {
    console.log("Starting contract deployment...");
    
    // Get signer
    const signer = await provider.getSigner();
    
    // Sanitize bytecode
    const bytecode = sanitizeBytecode(bytecodeJson);
    console.log("Bytecode length:", bytecode.length);
    
    // KHỞI TẠO Factory với ABI + BYTECODE (đúng chỗ)
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    console.log("ContractFactory created successfully");
    
    // SimpleStorage không có constructor arg → gọi deploy() trống
    console.log("Deploying contract...");
    const contract = await factory.deploy();
    console.log("Deploy transaction sent:", contract.deploymentTransaction().hash);
    
    // Wait for deployment
    const receipt = await contract.deploymentTransaction().wait();
    console.log("Contract deployed successfully");
    
    const result = {
      address: await contract.getAddress(),                 // địa chỉ contract
      txHash: contract.deploymentTransaction().hash,        // hash deploy
    };
    
    console.log("Deployment result:", result);

    // Lưu lịch sử TX để user copy
    const key = "zenstats:txHistory";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.unshift({ 
      type: "deploy", 
      hash: result.txHash,
      contractAddress: result.address,
      contractName: "SimpleStorage",
      ts: Date.now() 
    });
    localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));

    return result;
    
  } catch (error) {
    console.error("Deployment failed:", error);
    
    // Enhanced error messages
    let errorMessage = error.message || String(error);
    
    if (errorMessage.includes("invalid BytesLike value")) {
      errorMessage = "Bytecode format error. Please check the bytecode format.";
    } else if (errorMessage.includes("insufficient funds")) {
      errorMessage = "Insufficient funds for gas fees. Please add more ZTC to your wallet.";
    } else if (errorMessage.includes("user rejected")) {
      errorMessage = "Transaction was rejected by user.";
    } else if (errorMessage.includes("execution reverted")) {
      errorMessage = "Contract deployment failed. Check your bytecode and constructor parameters.";
    }
    
    throw new Error(errorMessage);
  }
}
