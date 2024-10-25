import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import Image from "next/image";
import { Lens } from "@/components/ui/lens";
import { motion } from "framer-motion";
import { ProgressDemo } from "@/components/functions/ProgressBar";
import abi, { address } from "app/abi";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z, isValid } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type Campaign from "@/types";

const contractABI = abi;
const contractAddress = address;

const formSchema = z.object({
  proposal: z.string().min(10),
});

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
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proposal: "",
    },
  });

  async function withdrawFunds(idx: number, proposal: string) {
    console.log("Withdraw funds", idx);
    try {
      // Call the smart contract function with form data using writeContractAsync
      const tx = await writeContractAsync(
        {
          address: contractAddress,
          abi: contractABI,
          functionName: "withdrawFunds",
          args: [idx, proposal],
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
                    <div className="flex justify-between items-center mt-4 w-full gap-10 text-base">
                      <ProgressDemo
                        raised={Number(camp.raised)}
                        goal={Number(camp.goal)}
                      />
                      <button
                        className={`px-3 py-4 w-[45%] rounded-full ${
                          camp.isWithdrawn ? `bg-zinc-800` : `bg-[#1ED760] `
                        } font-bold text-white text-xs tracking-widest uppercase transform hover:scale-105  transition-colors duration-200`}
                        onClick={() => {
                          if (camp.isWithdrawn) {
                            alert("Funds already withdrawn.");
                          } else if (camp.raised >= camp.goal) {
                            setOpen(true);
                          } else {
                            alert("Goal not reached. Cannot withdraw funds.");
                          }
                        }}
                      >
                        {camp.isWithdrawn ? "Withdrawn" : "Withdraw"}
                      </button>
                    </div>
                  </motion.div>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  {address ? (
                    <DialogContent className="w-full border-none">
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(async (data) => {
                            // Validate the form data
                            const result = formSchema.safeParse(data);
                            if (result.success) {
                              // Call withdrawFunds with the campaign id and close dialog if valid
                              console.log("Proposal:", data.proposal);
                              await withdrawFunds(
                                Number(camp.id),
                                data.proposal
                              );
                              setOpen(false);
                            }
                          })}
                          className="space-y-4"
                        >
                          <FormField
                            control={form.control}
                            name="proposal"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Write a Proposal For Withdrawal"
                                    className="mt-5"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-between w-[100%] font-fredoka items-center">
                            <span>
                              Check out this{" "}
                              <a
                                href="https://jmp.sh/s/eZBvzt1GGs68cvbOdMAk"
                                className="text-text font-bold text-yellow-400 underline"
                                target="_blank"
                              >
                                Example
                              </a>{" "}
                              for inspiration
                            </span>
                            <Button type="submit">
                              <span>Withdraw</span>
                            </Button>
                          </div>
                        </form>
                      </Form>
                      <p className="text-white text-center mt-4">
                        {camp.proposal}
                      </p>
                    </DialogContent>
                  ) : (
                    <DialogContent className="w-68">
                      <p>Please connect your wallet to fund this campaign.</p>
                    </DialogContent>
                  )}
                </Dialog>
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
