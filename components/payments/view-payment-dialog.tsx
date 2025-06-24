"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { Calendar, Clock, User, Building, CheckCircle, AlertCircle, Receipt } from "lucide-react"
import type { Payment } from "@/lib/payments-database"
import type { Worker } from "@/lib/database"

interface ViewPaymentDialogProps {
  payment: Payment
  worker: Worker
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPaymentDialog({ payment, worker, open, onOpenChange }: ViewPaymentDialogProps) {
  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{payment.shift_title}</h2>
              <p className="text-muted-foreground">{payment.brand_name}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(payment.status)}
              <span className="text-2xl font-bold">R{payment.amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Worker Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{worker.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{worker.position}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Shift Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(payment.shift_date), "MMMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{payment.hours_worked} hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Calculation */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Payment Calculation</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>
                    Base Pay ({payment.hours_worked} hours × R{payment.hourly_rate}/hour)
                  </span>
                  <span>R{(payment.hours_worked * payment.hourly_rate).toLocaleString()}</span>
                </div>

                {payment.additional_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Additional Payment</span>
                    <span>+R{payment.additional_amount.toLocaleString()}</span>
                  </div>
                )}

                {payment.deduction_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Deductions</span>
                    <span>-R{payment.deduction_amount.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>R{payment.amount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Payment Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Payment Due: {format(new Date(payment.payment_due_date), "MMMM dd, yyyy")}</span>
                </div>

                {payment.status === "paid" && (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Paid on {format(new Date(payment.payment_date || new Date()), "MMMM dd, yyyy")}</span>
                    </div>
                    {payment.payment_reference && (
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span>Reference: {payment.payment_reference}</span>
                      </div>
                    )}
                  </>
                )}

                {payment.status === "overdue" && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Payment is{" "}
                      {Math.floor((Date.now() - new Date(payment.payment_due_date).getTime()) / (1000 * 60 * 60 * 24))}{" "}
                      days overdue
                    </span>
                  </div>
                )}

                {payment.status === "pending" && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="h-4 w-4" />
                    <span>Awaiting payment processing</span>
                  </div>
                )}

                {payment.status === "processing" && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <span className="font-semibold text-muted-foreground mr-1">R</span>
                    <span>Payment is being processed</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {payment.notes && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p>{payment.notes}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
