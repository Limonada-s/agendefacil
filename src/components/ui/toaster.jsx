"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // =============================================================
        // A CORREÇÃO ESTÁ AQUI:
        // Esta linha separa a propriedade 'dismiss' do resto das props.
        // A variável 'rest' conterá todas as outras propriedades válidas.
        // =============================================================
        const { dismiss, ...rest } = props;

        return (
          // Agora, passamos apenas as props válidas ('rest') para o componente.
          <Toast key={id} {...rest}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
