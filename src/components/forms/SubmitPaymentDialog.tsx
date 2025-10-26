import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { institutePaymentsApi, SubmitPaymentRequest, InstitutePayment } from '@/api/institutePayments.api';

interface SubmitPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: InstitutePayment | null;
  instituteId: string;
  onSuccess?: () => void;
}

const SubmitPaymentDialog = ({ open, onOpenChange, payment, instituteId, onSuccess }: SubmitPaymentDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<SubmitPaymentRequest, 'receipt'>>({
    paymentAmount: 0,
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: '',
    paymentDate: '',
    paymentRemarks: ''
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment || !receiptFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload a receipt",
        variant: "destructive",
      });
      return;
    }

    if (formData.paymentAmount <= 0 || !formData.paymentDate) {
      toast({
        title: "Error",
        description: "Please enter valid payment amount and date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const submitData: SubmitPaymentRequest = {
        ...formData,
        receipt: receiptFile
      };

      await institutePaymentsApi.submitPayment(instituteId, payment.id, submitData);
      toast({
        title: "Success",
        description: "Payment submitted successfully for verification",
      });
      onOpenChange(false);
      onSuccess?.();
      // Reset form
      setFormData({
        paymentAmount: 0,
        paymentMethod: 'BANK_TRANSFER',
        transactionReference: '',
        paymentDate: '',
        paymentRemarks: ''
      });
      setReceiptFile(null);
    } catch (error) {
      console.error('Failed to submit payment:', error);
      toast({
        title: "Error",
        description: "Failed to submit payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please upload a PDF, JPG, or PNG file",
          variant: "destructive",
        });
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setReceiptFile(file);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Payment</DialogTitle>
        </DialogHeader>
        
        {/* Payment Details */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><strong>Payment Type:</strong> {payment.paymentType}</p>
              <p><strong>Amount:</strong> Rs {payment.amount.toLocaleString()}</p>
              <p><strong>Due Date:</strong> {new Date(payment.dueDate).toLocaleDateString()}</p>
              <p><strong>Priority:</strong> {payment.priority}</p>
            </div>
            <p className="text-sm mt-2"><strong>Description:</strong> {payment.description}</p>
            
            {payment.paymentInstructions && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium mb-1">Payment Instructions:</p>
                <p className="text-sm">{payment.paymentInstructions}</p>
              </div>
            )}

            {payment.bankDetails && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm font-medium mb-2">Bank Details:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><strong>Bank:</strong> {payment.bankDetails.bankName}</p>
                  <p><strong>IFSC:</strong> {payment.bankDetails.ifscCode}</p>
                  <p><strong>Account:</strong> {payment.bankDetails.accountNumber}</p>
                  <p><strong>Holder:</strong> {payment.bankDetails.accountHolderName}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentAmount">Payment Amount (Rs) *</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.paymentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="ONLINE">Online Payment</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="DD">Demand Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transactionReference">Transaction Reference</Label>
              <Input
                id="transactionReference"
                value={formData.transactionReference}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionReference: e.target.value }))}
                placeholder="TXN123456"
              />
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="datetime-local"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="paymentRemarks">Payment Remarks</Label>
            <Textarea
              id="paymentRemarks"
              value={formData.paymentRemarks}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentRemarks: e.target.value }))}
              placeholder="Any additional notes about the payment..."
            />
          </div>

          <div>
            <Label htmlFor="receipt">Receipt Upload *</Label>
            <div className="mt-1">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="mt-4">
                    <Label htmlFor="receipt" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium">
                        {receiptFile ? receiptFile.name : 'Upload receipt file'}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        PDF, JPG, PNG up to 5MB
                      </span>
                    </Label>
                    <Input
                      id="receipt"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {receiptFile && (
                    <div className="mt-2 flex items-center justify-center text-sm text-green-600">
                      <FileText className="h-4 w-4 mr-1" />
                      {receiptFile.name} ({(receiptFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !receiptFile}>
              {loading ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitPaymentDialog;