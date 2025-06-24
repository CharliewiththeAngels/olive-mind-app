"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, CheckCircle, AlertCircle, CreditCard, Download, Eye } from "lucide-react"
import { getPayments, type Payment, updatePaymentStatus } from "@/lib/payments-database"
import { getAllWorkers, type Worker } from "@/lib/database"
import { ViewPaymentDialog } from "@/components/payments/view-payment-dialog"
import { PaymentSummaryDialog } from "@/components/payments/payment-summary-dialog"
import { format } from "date-fns"

export default function PaymentsPage() {
  const { user } = useSupabase()
  const isManager = user?.email === "Mtsand09@gmail.com"

  const [payments, setPayments] = useState<Payment[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [viewPaymentOpen, setViewPaymentOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsData, workersData] = await Promise.all([getPayments(), getAllWorkers()])
        setPayments(paymentsData)
        setWorkers(workersData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter payments based on role
  const filteredPayments = payments.filter((payment) => {
    if (!isManager) {
      // Workers only see their own payments
      const worker = workers.find((w) => w.email === user?.email)
      if (!worker || payment.worker_id !== worker.id) return false
    }

    // Apply search and status filters
    const worker = workers.find((w) => w.id === payment.worker_id)

    const matchesSearch =
      !searchTerm ||
      payment.shift_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker?.full_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate summary statistics
  const totalEarnings = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const pendingPayments = filteredPayments.filter((p) => p.status === "pending")
  const paidPayments = filteredPayments.filter((p) => p.status === "paid")
  const overduePayments = filteredPayments.filter((p) => p.status === "overdue")

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await updatePaymentStatus(paymentId, "paid")
      // Refresh payments
      const paymentsData = await getPayments()
      setPayments(paymentsData)
    } catch (error) {
      console.error("Error updating payment:", error)
    }
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setViewPaymentOpen(true)
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            {isManager ? "Manage worker payments and earnings" : "Your payment history and earnings"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSummaryOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Payment Summary
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <span className="font-semibold text-muted-foreground mr-1">R</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R{paidPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidPayments.length} payment{paidPayments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R{pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} payment{pendingPayments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R{overduePayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {overduePayments.length} payment{overduePayments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by worker, shift, or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments List */}
      <div className="grid gap-4">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No payments found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => {
            const worker = workers.find((w) => w.id === payment.worker_id)

            if (!worker) return null

            return (
              <Card key={payment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{payment.shift_title}</h3>
                        {getStatusBadge(payment.status)}
                        {payment.additional_amount > 0 && (
                          <Badge variant="outline" className="text-green-600">
                            +R{payment.additional_amount} Additional
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {worker.full_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(payment.shift_date), "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {payment.hours_worked} hours
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold mr-1">R</span>
                          {payment.hourly_rate}/hour
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Payment Due: </span>
                        <span className={payment.status === "overdue" ? "text-red-600" : ""}>
                          {format(new Date(payment.payment_due_date), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold">R{payment.amount.toLocaleString()}</div>
                        {payment.additional_amount > 0 && (
                          <div className="text-sm text-green-600">+R{payment.additional_amount} additional</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewPayment(payment)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {isManager && payment.status === "pending" && (
                          <Button size="sm" onClick={() => handleMarkAsPaid(payment.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* View Payment Dialog */}
      {selectedPayment && (
        <ViewPaymentDialog
          payment={selectedPayment}
          worker={workers.find((w) => w.id === selectedPayment.worker_id)!}
          open={viewPaymentOpen}
          onOpenChange={setViewPaymentOpen}
        />
      )}

      {/* Payment Summary Dialog */}
      <PaymentSummaryDialog
        payments={filteredPayments}
        workers={workers}
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
      />
    </div>
  )
}
