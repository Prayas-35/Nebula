import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import Image from "next/image";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProgressDemo } from "@/components/functions/ProgressBar";
import abi, { address } from "app/abi";
import type Campaign from "@/types";

const contractABI = abi;
const contractAddress = address;

export function ThreeDCardDemo(props: {
  camp: Campaign;
  idx: number;
  sidebarOpen: boolean;
}) {
  const { camp, idx, sidebarOpen } = props;

  const [open, setOpen] = useState(false); // State to control fund dialog visibility
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false); // State to control owner dialog visibility
  const [fund, setFund] = useState<string>(""); // State to store fund input as a string
  const { address } = useAccount();
  console.log("Campaign data:", camp);
  const { writeContractAsync } = useWriteContract();

  async function handleFund() {
    if (address && Number(fund) > 0) {
      try {
        console.log("Funding campaign...");
        console.log("Index: ", idx);
        console.log("Funding amount: ", fund);

        const tx = await writeContractAsync(
          {
            address: contractAddress,
            abi: contractABI,
            functionName: "fundCampaign",
            args: [camp.id],
            value: BigInt(Number(fund) * 10 ** 18),
          },
          {
            onSuccess(data) {
              console.log("Transaction successful!", data);
            },
            onSettled(data, error) {
              if (error) {
                console.error("Error on settlement:", error);
              } else {
                console.log("Transaction settled:", data);
              }
            },
            onError(error) {
              console.error("Transaction error:", error);
            },
          }
        );
      } catch (error) {
        console.error("Error funding campaign:", error);
      }
    } else {
      console.error("Fund amount must be greater than 0");
    }
  }

  const timestamp = new Date(Number(camp.deadline) * 1000).toLocaleDateString();

  return (
    <CardContainer
      className={`inter-var ${
        sidebarOpen ? "w-[50vh]" : "w-[60vh]"
      } transition-all`}
      containerClassName={`${
        sidebarOpen ? "w-[50vh]" : "w-[60vh]"
      } w-full py-4 relative flex flex-col flex-grow justify-between`}
    >
      <CardBody className="flex flex-col bg-gray-50 min-h-full relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white font-fredoka"
        >
          {camp.name}
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300 font-fredoka"
        >
          {camp.description}
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-white-500 text-sm max-w-sm mt-2 dark:text-neutral-300 flex items-center font-fredoka space-x-5"
        >
          <button className="shadow-[0_0_0_3px_#000000_inset] px-6 py-2 cursor-auto bg-transparent border border-black dark:border-white dark:text-white text-black rounded-lg font-bold transform hover:-translate-y-1 transition duration-400 mt-2 disabled">
            Goal: {Number(camp.goal) / 10 ** 18} AIA
          </button>
          <p className="font-bold font-fredoka uppercase mt-2">
            Deadline: {timestamp}
          </p>
        </CardItem>
        <CardItem
          translateZ="100"
          rotateX={0}
          rotateZ={0}
          className="w-full mt-4"
        >
          <Image
            src={camp.image}
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl mb-10"
            alt="thumbnail"
          />
        </CardItem>
        <div className="flex-grow" />
        <div className="flex justify-between mt-auto items-end">
          <CardItem
            translateZ={20}
            translateX={-40}
            as="button"
            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
          >
            <ProgressDemo
              raised={Number(camp.raised)}
              goal={Number(camp.goal)}
            />
          </CardItem>
          <CardItem
            translateZ={20}
            translateX={40}
            as="button"
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
            onClick={() => {
              // Check if the user is the campaign owner
              if (address === camp.owner) {
                setOwnerDialogOpen(true); // Open owner dialog
              } else {
                setOpen(true); // Open fund dialog for other users
              }
            }}
          >
            Fund
          </CardItem>
        </div>
      </CardBody>

      <Dialog open={open} onOpenChange={setOpen}>
        {address ? (
          <DialogContent className="w-68">
            <Input
              placeholder="Enter amount in AITD"
              type="number"
              value={fund}
              onChange={(e) => setFund(e.target.value)} // Update fund value
              style={{
                appearance: "none", // Remove spinner arrows
              }}
              className="w-52 mt-4"
            />
            <button
              className="px-8 py-2 rounded-md bg-teal-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500"
              onClick={() => {
                handleFund();
                setOpen(false); // Close the dialog after funding
              }}
            >
              Fund
            </button>
          </DialogContent>
        ) : (
          <DialogContent className="w-68">
            <p>Please connect your wallet to fund this campaign.</p>
          </DialogContent>
        )}
      </Dialog>

      {/* Dialog for campaign owner */}
      <Dialog open={ownerDialogOpen} onOpenChange={setOwnerDialogOpen}>
        <DialogContent className="w-68">
          <p className="text-center font-bold py-3">
            You are the owner of the Campaign.
          </p>
        </DialogContent>
      </Dialog>
    </CardContainer>
  );
}
