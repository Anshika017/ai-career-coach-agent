"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { aiToolsList } from "./AiToolsList";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

function History() {
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [loading,setLoading]=useState(false);

  useEffect(() => {
    GetHistory();
  }, []);

  const GetHistory = async () => {
    setLoading(true)
    try {
      const result = await axios.get("/api/history");
      const data = Array.isArray(result.data)
        ? result.data
        : result.data.history || [];
      setUserHistory(data);
    } catch (err) {
      console.error("❌ Error fetching history:", err);
      setUserHistory([]);
    }
    setLoading(false);
  };

  const GetAgentName = (path: string) => {
    return aiToolsList.find((item) => item.path === path);
  };

  return (
    <div className="mt-5 p-5 border rounded-xl">
      <h2 className="font-bold text-lg">Previous History</h2>
      <p>What you previously worked on can be found here.</p>

      {loading&&
      <div>
        {[1,2,3,4,5].map((item,index)=>(
          <div key={index}>
            <Skeleton className="h-[50px] mt-4 w-full rounded-md"/>
          </div>
        ))}
      </div>
      }

      {userHistory.length === 0 && !loading ? (
        <div className="flex items-center justify-center mt-6 flex-col">
          <Image src="/bulb.png" alt="bulb" width={50} height={50} />
          <h2 className="mt-3">You do not have any history</h2>
          <Button className="mt-5">Explore AI Tools</Button>
        </div>
      ) : (
        <div className="mt-5">
          {userHistory.map((history: any, index: number) => {
            const agent = GetAgentName(history?.aiAgentType);
            const formattedDate = new Date(history.createdAt).toLocaleString();

            // Clean up aiAgentType to remove leading slashes and duplicated ai-tools
            const cleanedAgentType = history?.aiAgentType
              ?.replace(/^\/?ai-tools\//, "") // remove leading /ai-tools/
              ?.replace(/^\/+/, ""); // remove any extra leading slashes

            const finalPath = `/ai-tools/${cleanedAgentType}/${history?.recordId}`;

            return (
              <Link
                href={finalPath}
                key={index}
                className="flex justify-between items-center my-3 border p-3 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex gap-5 items-center">
                  {agent?.icon ? (
                    <Image
                      src={agent.icon}
                      alt={`${agent.name} icon`}
                      width={20}
                      height={20}
                    />
                  ) : (
                    <div className="w-5 h-5 bg-gray-300 rounded-full" />
                  )}
                  <h2>{agent?.name || history?.aiAgentType}</h2>
                </div>
                <h2 className="text-sm text-gray-500">{formattedDate}</h2>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
