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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const contractABI = abi;
const contractAddress = address;

function Loader() {
  return (
    <div className="flex justify-center items-center w-[90vw] h-[65vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function Contribution() {
  let userAddress;
  const [contriCamps, setContriCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          setLoading(false); // Stop loading once data is fetched
        })
        .catch((error: any) => {
          console.error("Error during refetch: ", error);
          setLoading(false); // Stop loading even if there's an error
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
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-10 border-t-2 border-secondary gap-6">
        {loading ? (
          <Loader />
        ) : address ? (
          contriCamps && contriCamps.length > 0 ? (
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
