"use client"

import { HistoryRow } from "@/lib/documents"
import { useState } from "react"

const DocHistory = ({ history }: { history: HistoryRow[] }) => {
  const [showHistory, setShowHistory] = useState(false)
  return (
    <div>
      <button onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? "Hide History" : "Show History"}
      </button>
      {showHistory && (
        <div className="flex flex-col gap-2 absolute top-10 right-0 mx-auto w-fit h-fit bg-white z-50 p-4 rounded-md shadow-md">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">History</h2>
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="text-sm text-neutral-500">{new Date(item.created_at).toLocaleString()}</div>
                <div className="text-sm text-neutral-500">{item.user_id}</div>
                <div className="text-sm text-neutral-500">
  {item.update ? `${item.update.length} bytes` : "No changes"}
</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocHistory