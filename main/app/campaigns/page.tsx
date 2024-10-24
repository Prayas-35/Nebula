"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/functions/Navbar";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  useDisconnect,
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
import { IoMdWallet } from "react-icons/io";
import { Lens } from "@/components/ui/lens";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconUserBolt,
} from "@tabler/icons-react";
import AddCampaign from "@/components/functions/AddCampaign";
import abi from "app/abi";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProgressDemo } from "@/components/functions/ProgressBar";
import { MyCampaigns } from "@/components/functions/MyCampaigns";
import { ThreeDCardDemo } from "@/components/functions/ThreeDCardDemo";
import type Campaign from "@/types";
import { address } from "app/abi";

const contractABI = abi;
const contractAddress = address;

function SidebarDemo() {
  const account = useAccount();
  // const [hovering, setHovering] = useState(false);
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // Added state for active tab
  const router = useRouter(); // Initialize useRouter
  const [campaigns, setCampaigns] = useState<any[]>([]);
  // const [myCampaigns, setMyCampaigns] = useState<any[]>([]);

  const { data, refetch } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getCampaigns",
  });

  useEffect(() => {
    console.log("Setting up refetch interval");

    const interval = setInterval(() => {
      refetch()
        .then((result: any) => {
          console.log("Data refetched: ", result);
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

  // console.log(data);

  const myData = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getMyCampaigns",
    args: [account?.address],
  });

  const { refetch: refetchMyCampaigns } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getMyCampaigns",
    args: [account?.address],
  });

  useEffect(() => {
    console.log("Setting up refetch interval for getMyCampaigns");

    const interval = setInterval(() => {
      refetchMyCampaigns()
        .then((result: any) => {
          console.log("MyCampaigns data refetched: ", result);
        })
        .catch((error: any) => {
          console.error("Error during refetch of MyCampaigns: ", error);
        });
    }, 5000);

    return () => {
      console.log("Clearing refetch interval for getMyCampaigns");
      clearInterval(interval);
    };
  }, [refetchMyCampaigns]);

  console.log("My data:", myData.data);

  useEffect(() => {
    // Log active tab for debugging purposes
    console.log(`Active tab changed to: ${activeTab}`);
    if (activeTab === "back") {
      disconnect(); // Disconnect the user
      router.push("/"); // Navigate to the root route
    } else if (activeTab === "dashboard") {
      ViewData(); // Call the ViewData function
    } else if (activeTab === "my-campaigns") {
      ViewMyData(); // Call the ViewMyData function
    }
  }, [myData.data, data, activeTab, router, disconnect]);

  function ViewData() {
    if (Array.isArray(data)) {
      if (data.length === 0) {
        console.log("No data found for this address.");
        return;
      } else {
        console.log("Data found for this address.");
        setCampaigns(data);
      }
    }
  }

  function ViewMyData() {
    if (Array.isArray(myData.data)) {
      if (myData.data.length === 0) {
        console.log("No data found for this address.");
        return;
      } else {
        console.log("Data found for this address.", myData.data);
        // setMyCampaigns(myData.data);
      }
    }
  }

  const tabs = [
    {
      label: "Dashboard",
      id: "dashboard",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "My Campaigns",
      id: "my-campaigns",
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Log Out",
      id: "back",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-10xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-[88vh] overflow-y-auto"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {tabs.map((tab) => (
                <div key={tab.id} onClick={() => setActiveTab(tab.id)}>
                  <SidebarLink
                    link={{
                      label: tab.label,
                      href: "",
                      icon: tab.icon,
                    }}
                    className={activeTab === tab.id ? "text-blue-600" : ""}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: `${
                  account?.address
                    ? `${account?.address.slice(
                        0,
                        7
                      )}...${account?.address.slice(-5)}`
                    : "Wallet not connected"
                }`,
                href: "",
                icon: (
                  <IoMdWallet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Conditionally render content based on activeTab */}
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full relative overflow-y-auto">
        {activeTab === "dashboard" && <Dashboard camps={campaigns} />}
        {activeTab === "my-campaigns" && (
          <MyCampaigns data={myData.data as Campaign[]} />
        )}
      </div>
    </div>
  );
}

function Dashboard(props: { camps: Campaign[] }) {
  const campaigns = props.camps;
  console.log(campaigns);

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <AddCampaign />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {campaigns.length > 0 ? (
          campaigns.map((campaign, index) => (
            <ThreeDCardDemo camp={campaign} idx={index} key={index} />
          ))
        ) : (
          <p>No campaigns available.</p>
        )}
      </div>
    </div>
  );
}

const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex items-center text-sm text-black py-1 relative z-20 ml-0 pl-0"
    >
      <Image src="/logo1.png" width={30} height={40} alt="logo" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Nebula
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src="/logo1.png" width={30} height={40} alt="logo" />
    </Link>
  );
};

export default function Campaign() {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        <SidebarDemo />
      </div>
    </>
  );
}
