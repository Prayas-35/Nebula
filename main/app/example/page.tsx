"use client";
import Navbar from "@/components/functions/Navbar";
import type Campaign from "@/types";
import { useAccount, useReadContract } from "wagmi";
import { address } from "app/abi";
import abi from "app/abi";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ProgressDemo } from "@/components/functions/ProgressBar";
import { motion } from "framer-motion";
import { Lens } from "@/components/ui/lens";
import { any } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const contractABI = abi;
const contractAddress = address;

export default function Contribution() {
  let userAddress;
  const [contriCamps, setContriCamps] = useState<any[]>([]);

  const account = useAccount();
  if (account) {
    userAddress = account.address;
  }

  const { data, refetch } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getContributedCampaigns",
    args: [userAddress],
  });

  useEffect(() => {
    console.log("Setting up refetch interval");

    const interval = setInterval(() => {
      refetch()
        .then((result: any) => {
          console.log("My Contributions refetched: ", result);
          setContriCamps(result.data);
        })
        .catch((error: any) => {
          console.error("Error during refetch: ", error);
        });
    }, 5000);
    return () => {
      console.log("Clearing refetch interval");
      clearInterval(interval);
    };
  }, [refetch]);

  return (
    <>
      <Navbar />
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10 pl-10">
        {address ? (
          contriCamps.length > 0 ? (
            contriCamps.map((camp, index) => {
              const raisedInAIA = Number(camp.raised) / 10 ** 18;
              const goalInAIA = Number(camp.goal) / 10 ** 18;
              const progressPercentage = Math.round(
                (raisedInAIA / goalInAIA) * 100
              );

              return (
                <Card key={index} className="w-full max-w-sm overflow-hidden">
                  <CardHeader className="p-0">
                    <img
                      src={camp.image}
                      alt={camp.name}
                      className="w-full h-48 object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{camp.name}</h2>
                    <p className="text-muted-foreground mb-4">
                      {camp.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="w-full" />
                      <div className="flex justify-between text-sm">
                        <span>Raised: {raisedInAIA.toFixed(2)} AIA</span>
                        <span>Goal: {goalInAIA.toFixed(2)} AIA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p>No campaigns available.</p>
          )
        ) : (
          <p>Please connect wallet.</p>
        )}
      </div>
    </>
  );
}

// {address ? (
//   contriCamps.length > 0 ? (
//     contriCamps.map((camp, index) => (
//       <div
//         className="w-30  relative rounded-3xl overflow-hidden max-w-full bg-gradient-to-r from-[#1D2235] to-[#121318] my-10 pb-5"
//         key={index}
//       >
//         <Image
//           src={camp.image}
//           alt={camp.name}
//           width={50}
//           height={50}
//           className="rounded-xl w-[40%]"
//         />
//         <motion.div className="py-4 relative z-20 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-8">
//           <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold text-left">
//             {camp.name}
//           </h2>
//           <p className="text-neutral-200 text-left my-4 text-sm sm:text-base md:text-base font-fredoka">
//             {camp.description}
//           </p>
//           <button className="shadow-[0_0_0_3px_#000000_inset] px-2 w-32 text-base py-2 bg-transparent border border-black dark:border-white dark:text-white text-black rounded-lg font-bold transform hover:-translate-y-1 transition duration-400 mt-2 disabled">
//             Goal: {Number(camp.goal) / 10 ** 18} AIA
//           </button>

//           <div className="flex justify-between items-center mt-4 w-full gap-10 text-base">
//             <ProgressDemo
//               raised={Number(camp.raised)}
//               goal={Number(camp.goal)}
//             />
//           </div>
//         </motion.div>
//       </div>
//     ))
//   ) : (
//     <p>No campaigns available.</p>
//   )
// ) : (
//   <p>Please connect your wallet to view your campaigns.</p>
// )}
