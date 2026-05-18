"use client"

import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeedbackButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button asChild variant="default">
        <Link href="/feedback/new">
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Link>
      </Button>
    </div>
  )
}
