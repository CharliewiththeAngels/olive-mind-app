"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar, Download, Printer, User } from "lucide-react"
import type { Payment } from "@/lib/payments-database"
import type { Worker } from "@/lib/database"

interface PaymentSummaryDialogProps {
  payments: Payment[]
  workers: Worker[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentSummaryDialog({ payments, workers, open, onOpenChange }: PaymentSummaryDialogProps) {
  const [activeTab, setActiveTab] = useState("summary")

  // Group payments by worker
  const paymentsByWorker: Record<string, { worker: Worker; payments: Payment[] }> = {}

  payments.forEach((payment) => {
    const worker = workers.find((w) => w.id === payment.worker_id)
    if (!worker) return

    if (!paymentsByWorker[worker.id]) {
      paymentsByWorker[worker.id] = { worker, payments: [] }
    }

    paymentsByWorker[worker.id].payments.push(payment)
  })

  // Group payments by month
  const paymentsByMonth: Record<string, Payment[]> = {}

  payments.forEach((payment) => {
    const month = format(new Date(payment.shift_date), "MMMM yyyy")

    if (!paymentsByMonth[month]) {
      paymentsByMonth[month] = []
    }

    paymentsByMonth[month].push(payment)
  })

  // Calculate totals
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payments.filter((p) => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Summary</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Payments</div>
                <div className="text-2xl font-bold">
                  <span className="font-semibold text-muted-foreground mr-1">R</span>
                  {totalAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Paid</div>
                <div className="text-2xl font-bold text-green-600">
                  <span className="font-semibold text-muted-foreground mr-1">R</span>
                  {totalPaid.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  <span className="font-semibold text-muted-foreground mr-1">R</span>
                  {totalPending.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Overdue</div>
                <div className="text-2xl font-bold text-red-600">
                  <span className="font-semibold text-muted-foreground mr-1">R</span>
                  {totalOverdue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="by-worker">By Worker</TabsTrigger>
              <TabsTrigger value="by-month">By Month</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Payments</span>
                      <span>{payments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Workers</span>
                      <span>{Object.keys(paymentsByWorker).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Payment</span>
                      <span>
                        <span className="font-semibold text-muted-foreground mr-1">R</span>
                        {(totalAmount / payments.length).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Highest Payment</span>
                      <span>
                        <span className="font-semibold text-muted-foreground mr-1">R</span>
                        {Math.max(...payments.map((p) => p.amount)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lowest Payment</span>
                      <span>
                        <span className="font-semibold text-muted-foreground mr-1">R</span>
                        {Math.min(...payments.map((p) => p.amount)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Payment Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Paid</span>
                      <span>{payments.filter((p) => p.status === "paid").length} payments</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <span>{payments.filter((p) => p.status === "pending").length} payments</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing</span>
                      <span>{payments.filter((p) => p.status === "processing").length} payments</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overdue</span>
                      <span>{payments.filter((p) => p.status === "overdue").length} payments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* By Worker Tab */}
            <TabsContent value="by-worker" className="space-y-4">
              {Object.values(paymentsByWorker).map(({ worker, payments }) => {
                const workerTotal = payments.reduce((sum, p) => sum + p.amount, 0)
                const paidAmount = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
                const pendingAmount = payments
                  .filter((p) => p.status === "pending" || p.status === "processing")
                  .reduce((sum, p) => sum + p.amount, 0)

                return (
                  <Card key={worker.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-semibold">{worker.full_name}</h3>
                        </div>
                        <div className="text-xl font-bold">
                          <span className="font-semibold text-muted-foreground mr-1">R</span>
                          {workerTotal.toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Payments</span>
                          <span>{payments.length} payments</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paid</span>
                          <span className="text-green-600">
                            <span className="font-semibold text-muted-foreground mr-1">R</span>
                            {paidAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending</span>
                          <span className="text-yellow-600">
                            <span className="font-semibold text-muted-foreground mr-1">R</span>
                            {pendingAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Payment</span>
                          <span>
                            <span className="font-semibold text-muted-foreground mr-1">R</span>
                            {(workerTotal / payments.length).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            {/* By Month Tab */}
            <TabsContent value="by-month" className="space-y-4">
              {Object.entries(paymentsByMonth).map(([month, monthPayments]) => {
                const monthTotal = monthPayments.reduce((sum, p) => sum + p.amount, 0)
                const paidAmount = monthPayments
                  .filter((p) => p.status === "paid")
                  .reduce((sum, p) => sum + p.amount, 0)
                const pendingAmount = monthPayments
                  .filter((p) => p.status === "pending" || p.status === "processing")
                  .reduce((sum, p) => sum + p.amount, 0)

                return (
                  <Card key={month}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-semibold">{month}</h3>
                        </div>
                        <div className="text-xl font-bold">
                          <span className="font-semibold text-muted-foreground mr-1">R</span>
                          {monthTotal.toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Payments</span>
                          <span>{monthPayments.length} payments</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paid</span>
                          <span className="text-green-600">
                            <span className="font-semibold text-muted-foreground mr-1">R</span>
                            {paidAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending</span>
                          <span className="text-yellow-600">
                            <span className="font-semibold text-muted-foreground mr-1">R</span>
                            {pendingAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Workers</span>
                          <span>{new Set(monthPayments.map((p) => p.worker_id)).size} workers</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
