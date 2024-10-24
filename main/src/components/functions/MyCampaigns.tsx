import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import Image from "next/image";
import { Lens } from "@/components/ui/lens";
import { motion } from "framer-motion";
import { ProgressDemo } from "@/components/functions/ProgressBar";
import abi from "app/abi";

interface Campaign {
  owner: string;
  id: number;
  name: string;
  description: string;
  goal: number;
  deadline: number;
  raised: number;
  image: string;
  funders: { funder: string; amount: number }[];
}

export function MyCampaigns(props: { data: Campaign[] }) {
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined
  );
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  console.log("props:", props.data);
  const myCamps = props.data;
  const contractABI = abi;
  const contractAddress = "0xcd6797834d00fc0Abd1E1B6c647983C38e69D3F4";

  async function withdrawFunds(idx: number) {
    console.log("Withdraw funds", idx);

    try {
      // Call the smart contract function with form data using writeContractAsync
      const tx = await writeContractAsync(
        {
          address: contractAddress,
          abi: contractABI,
          functionName: "withdrawFunds",
          args: [idx],
        },
        {
          onSuccess(data: any) {
            console.log("Transaction successful!", data);
            // setTransactionStatus("Transaction submitted!");
            // setTransactionHash(data);
          },
          onSettled(data: any, error: any) {
            if (error) {
              setTransactionStatus("Transaction failed.");
              console.error("Error on settlement:", error);
            } else {
              console.log("Transaction settled:", data);
              setTransactionStatus("Transaction confirmed!");
              setTransactionHash(data);
            }
          },
          onError(error: any) {
            if (error.message.includes("Nebula__GoalNotReached")) {
              console.error("Goal not reached. Cannot withdraw funds.");
              alert("Goal not reached. Cannot withdraw funds.");
            }
            console.error("Transaction error:", error);
            setTransactionStatus("Transaction failed. Please try again.");
          },
        }
      );
    } catch (err) {
      console.error("Error submitting transaction:", err);
      setTransactionStatus("Transaction failed. Please try again.");
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">My Campaigns</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {address ? (
          myCamps.length > 0 ? (
            myCamps.map((camp, index) => (
              <div
                className="w-96 relative rounded-3xl overflow-hidden max-w-full bg-gradient-to-r from-[#1D2235] to-[#121318] my-10"
                key={index}
              >
                <div className="relative z-10">
                  <Lens hovering={false}>
                    <Image
                      src={camp.image}
                      alt={camp.name}
                      width={350}
                      height={350}
                      className="rounded-2xl w-full"
                    />
                  </Lens>
                  <motion.div className="py-4 relative z-20 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-8">
                    <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold text-left">
                      {camp.name}
                    </h2>
                    <p className="text-neutral-200 text-left my-4 text-sm sm:text-base md:text-base font-fredoka">
                      {camp.description}
                    </p>
                    <button className="shadow-[0_0_0_3px_#000000_inset] px-2 w-32 text-base py-2 bg-transparent border border-black dark:border-white dark:text-white text-black rounded-lg font-bold transform hover:-translate-y-1 transition duration-400 mt-2 disabled">
                      Goal: {Number(camp.goal) / 10 ** 18} ETH
                    </button>
                    <div className="flex justify-evenly items-center mt-4 w-[90%] gap-10 text-base">
                      <ProgressDemo
                        raised={Number(camp.raised)}
                        goal={Number(camp.goal)}
                      />
                      <button
                        className="px-3 py-4 w-[40%] rounded-full bg-[#1ED760] font-bold text-white text-xs tracking-widest uppercase transform hover:scale-105 hover:bg-[#21e065] transition-colors duration-200"
                        onClick={() => withdrawFunds(Number(camp.id))}
                      >
                        Withdraw
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            ))
          ) : (
            <p>No campaigns available.</p>
          )
        ) : (
          <p>Please connect your wallet to view your campaigns.</p>
        )}
      </div>
    </div>
  );
}
