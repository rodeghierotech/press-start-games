import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import type { ComponentPropsWithoutRef, ElementRef, HTMLAttributes } from "react"
import { forwardRef } from "react"

const Dialog = DialogPrimitive.Root

const DialogOverlay = forwardRef<ElementRef<typeof DialogPrimitive.Overlay>, ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className = "", ...props }, ref) => <DialogPrimitive.Overlay ref={ref} className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm ${className}`} {...props} />)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className = "", children, ...props }, ref) => <DialogPrimitive.Portal><DialogOverlay /><DialogPrimitive.Content ref={ref} className={`fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[#3a3a3a] bg-[#171717] p-6 text-white shadow-2xl focus:outline-none sm:max-w-2xl ${className}`} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400" aria-label="Fechar"><X className="h-5 w-5" /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) => <div className={`flex flex-col space-y-1.5 ${className}`} {...props} />
const DialogTitle = forwardRef<ElementRef<typeof DialogPrimitive.Title>, ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className = "", ...props }, ref) => <DialogPrimitive.Title ref={ref} className={`text-2xl font-bold ${className}`} {...props} />)
DialogTitle.displayName = DialogPrimitive.Title.displayName
const DialogDescription = forwardRef<ElementRef<typeof DialogPrimitive.Description>, ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className = "", ...props }, ref) => <DialogPrimitive.Description ref={ref} className={`text-sm text-slate-400 ${className}`} {...props} />)
DialogDescription.displayName = DialogPrimitive.Description.displayName

export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle }
