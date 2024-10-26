"use client";
import Navbar from "@/components/functions/Navbar";
import type Campaign from "@/types";
import { useAccount, useReadContract } from "wagmi";
import { address } from "app/abi";
import abi from "app/abi";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IconBell } from "@tabler/icons-react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

const contractABI = abi;
const contractAddress = address;

interface Funder {
  funder: string;
  amount: number;
  votingPower: number;
}

function Loader() {
  return (
    <div className="flex justify-center items-center w-[90vw] h-[65vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function Contribution() {
  let userAddress: any;
  const [contriCamps, setContriCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<[]>([]);

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

  function handleActivity() {
    alert("Activity clicked");
  }

  const resapat = data;
  console.log("Data: ", resapat);

  return (
    <>
      <Navbar />
      <div className="h-[100%] min-h-screen rounded-md bg-neutral-900 flex flex-col items-center justify-center relative w-full">
        {/* <IconBell
          className="absolute top-8 right-4 mt-20"
          size={24}
          onClick={() => handleActivity()}
        /> */}
        <div className={`${contriCamps && contriCamps.length > 0
          ? "mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-10 gap-6"
          : "flex items-center justify-center w-full h-full"
          }`}>
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
                  <Card
                    key={index}
                    className="w-full max-w-sm overflow-hidden border-none"
                  >
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
                        <Progress
                          value={progressPercentage}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm">
                          <span>Raised: {raisedInAIA.toFixed(2)} AIA</span>
                          <span>Goal: {goalInAIA.toFixed(2)} AIA</span>
                        </div>

                        {camp.funders.map((funder: Funder, index: number) => {
                          return (
                            funder.funder === userAddress && (
                              <p>
                                Your Voting Power is:{" "}
                                <strong>{Number(funder.votingPower)}%</strong>
                              </p>
                            )
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="text-center">No Contributions yet. Start Contributing!</p>
            )
          ) : (
            <p>Please connect wallet.</p>
          )}
        </div>
        <ShootingStars />
        <StarsBackground className="min-h-screen"></StarsBackground>
      </div>
    </>
  );
}
