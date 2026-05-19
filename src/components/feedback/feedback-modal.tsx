"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const feedbackSchema = z.object({
  category: z.enum(["Bug Report", "Feature Request", "Question"], {
    required_error: "Please select a category",
  }),
  title: z
    .string()
    .min(1, "Title is required")
    .max(150, "Title must be 150 characters or fewer"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be 2000 characters or fewer"),
  attachment: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "File must be under 10MB"
    ),
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: undefined,
      title: "",
      description: "",
      attachment: undefined,
    },
  })

  async function onSubmit(values: FeedbackFormValues) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("category", values.category)
      formData.append("title", values.title)
      formData.append("description", values.description)
      if (values.attachment) {
        formData.append("attachment", values.attachment)
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to submit feedback")
      }

      toast({
        title: "Your feedback has been received",
        duration: 3000,
      })
      form.reset()
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Failed to submit feedback",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Bug Report">Bug Report</SelectItem>
                      <SelectItem value="Feature Request">Feature Request</SelectItem>
                      <SelectItem value="Question">Question</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary" maxLength={150} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your feedback in detail"
                      maxLength={2000}
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachment */}
            <FormField
              control={form.control}
              name="attachment"
              render={({ field: { onChange, value: _value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Attachment (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        onChange(file ?? undefined)
                      }}
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
