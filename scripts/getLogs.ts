import { ethers } from "ethers";
import { MongoClient, Db, Collection } from "mongodb";

const uri = "mongodb+srv://admin:LzANCduPyrfqJscZ@db.xis5ws1.mongodb.net/?retryWrites=true&w=majority";

interface ParsedTransaction {
  hash: string;
  from: string;
  to: string | undefined;
  value: string;
  gasPrice: ethers.BigNumber;
  isRecipientContract?: boolean;
  gasLimit: string;
  nonce: number;
  inputData: string;
}

async function isContract(provider: ethers.providers.Provider, address: string): Promise<boolean> {
  if(address) {
    const contractCode = await provider.getCode(address);
    return contractCode !== "0x";
  } else {
    return false;
  }

}

async function main(): Promise<void> {
  const provider = new ethers.providers.JsonRpcProvider("http://44.211.145.54:8545");
  console.log({provider})

  const client = new MongoClient(uri);
  await client.connect();
  const db: Db = client.db("blockchain");
  const transactionsCollection: Collection = db.collection("transactions");

  // Listen to new blocks
  provider.on("block", async (blockNumber: number) => {
    console.log(`New block: ${blockNumber}`);
    const block = await provider.getBlockWithTransactions(blockNumber);

    for (const transaction of block.transactions) {
      const parsedTransaction: ParsedTransaction = {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: ethers.utils.formatEther(transaction.value),
        gasPrice: ethers.BigNumber.from(transaction.gasPrice),
        isRecipientContract: false,
        gasLimit: transaction.gasLimit.toString(),
        nonce: transaction.nonce,
        inputData: transaction.data,
      };

      // Check if the transaction is interacting with a contract
      if (await isContract(provider, transaction.to as string)) {
        console.log(`Contract address: ${transaction.to}`);
        parsedTransaction.isRecipientContract = true; 
      }

      console.log("Parsed transaction:", parsedTransaction);

      // Store the parsed transaction in the MongoDB collection
      await transactionsCollection.insertOne(parsedTransaction);
    }
  });
}

main();
