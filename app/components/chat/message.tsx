import { Message as MessageType } from "@ai-sdk/react"
import React, { useState } from "react"
import { MessageAssistant } from "./message-assistant"
import { MessageUser } from "./message-user"

type MessageProps = {
  variant: MessageType["role"]
  children: string
  id: string
  attachments?: MessageType["experimental_attachments"]
  isLast?: boolean
  onDelete: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onReload: () => void
  hasScrollAnchor?: boolean
  parts?: MessageType["parts"]
  status?: "streaming" | "ready" | "submitted" | "error"
  className?: string
  agent_id?: string | null
  agent?: {
    id: string
    name: string
    avatar_url: string | null
  } | null
}

export function Message({
  variant,
  children,
  id,
  attachments,
  isLast,
  onDelete,
  onEdit,
  onReload,
  hasScrollAnchor,
  parts,
  status,
  className,
  agent_id,
  agent,
}: MessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
  }

  if (variant === "user") {
    return (
      <MessageUser
        copied={copied}
        copyToClipboard={copyToClipboard}
        onReload={onReload}
        onEdit={onEdit}
        onDelete={onDelete}
        id={id}
        hasScrollAnchor={hasScrollAnchor}
        attachments={attachments}
        className={className}
      >
        {children}
      </MessageUser>
    )
  }

  if (variant === "assistant") {
    return (
      <MessageAssistant
        copied={copied}
        copyToClipboard={copyToClipboard}
        onReload={onReload}
        isLast={isLast}
        hasScrollAnchor={hasScrollAnchor}
        parts={parts}
        status={status}
        className={className}
        agent_id={agent_id}
        agent={agent}
      >
        {children}
      </MessageAssistant>
    )
  }

  return null
}
