"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedbackModal } from "@/components/feedback/feedback-modal"

export function FeedbackButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button variant="default" onClick={() => setOpen(true)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Button>
      </div>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  )
}
