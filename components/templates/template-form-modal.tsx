"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TemplateForm from "@/components/templates/template-form"
import type { CodeTemplate, CreateTemplateRequest, UpdateTemplateRequest } from "@/types/template"

interface TemplateFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTemplateRequest | UpdateTemplateRequest) => void
  template?: CodeTemplate
  isSubmitting?: boolean
}

export default function TemplateFormModal({
  isOpen,
  onClose,
  onSubmit,
  template,
  isSubmitting = false,
}: TemplateFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "编辑模板" : "创建新模板"}</DialogTitle>
        </DialogHeader>

        <TemplateForm template={template} onSubmit={onSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  )
}
