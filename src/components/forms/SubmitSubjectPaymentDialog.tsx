import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { subjectPaymentsApi, SubjectPayment } from '@/api/subjectPayments.api';
import { Upload, Calendar, CreditCard, FileText, DollarSign } from 'lucide-react';

interface SubmitSubjectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: SubjectPayment;
  onSuccess?: () => void;
}

const SubmitSubjectPaymentDialog: React.FC<SubmitSubjectPaymentDialogProps> = ({
  open,
  onOpenChange,
  payment,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().slice(0, 16),
    transactionId: '',
    submittedAmount: payment.amount,
    notes: ''
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, JPG, or PNG file.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }

      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.transactionId.trim()) {
      toast({
        title: "Validation Error",
        description: "Transaction ID is required.",
        variant: "destructive"
      });
      return;
    }

    if (!receiptFile) {
      toast({
        title: "Validation Error",
        description: "Receipt file is required.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const submitFormData = new FormData();
      
      // Convert datetime-local to ISO string
      const isoDate = new Date(formData.paymentDate).toISOString();
      submitFormData.append('paymentDate', isoDate);
      submitFormData.append('transactionId', formData.transactionId);
      
      // Convert amount to number
      const amountNumber = parseFloat(formData.submittedAmount);
      submitFormData.append('submittedAmount', amountNumber.toString());
      
      submitFormData.append('notes', formData.notes);
      submitFormData.append('receipt', receiptFile);

      console.log('Submitting form data:', {
        paymentDate: isoDate,
        transactionId: formData.transactionId,
        submittedAmount: amountNumber,
        notes: formData.notes,
        receiptFile: receiptFile.name
      });

      const response = await subjectPaymentsApi.submitPayment(payment.id, submitFormData);

      toast({
        title: "Success",
        description: response.message || "Payment submitted successfully!"
      });

      // Reset form
      setFormData({
        paymentDate: new Date().toISOString().slice(0, 16),
        transactionId: '',
        submittedAmount: payment.amount,
        notes: ''
      });
      setReceiptFile(null);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit payment.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Submit Payment</span>
          </DialogTitle>
        </DialogHeader>

        {/* Payment Details */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {payment.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            {payment.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Amount Required:</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Rs {parseFloat(payment.amount).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-500">Due Date:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {new Date(payment.lastDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Date */}
          <div>
            <Label htmlFor="paymentDate" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Payment Date</span>
            </Label>
            <Input
              id="paymentDate"
              type="datetime-local"
              value={formData.paymentDate}
              onChange={(e) => handleInputChange('paymentDate', e.target.value)}
              required
            />
          </div>

          {/* Transaction ID */}
          <div>
            <Label htmlFor="transactionId" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Transaction ID</span>
            </Label>
            <Input
              id="transactionId"
              placeholder="Enter transaction reference number"
              value={formData.transactionId}
              onChange={(e) => handleInputChange('transactionId', e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="submittedAmount" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Amount Paid (Rs)</span>
            </Label>
            <Input
              id="submittedAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.submittedAmount}
              onChange={(e) => handleInputChange('submittedAmount', e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this payment..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <Label htmlFor="receipt" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Receipt File</span>
            </Label>
            <div className="mt-2">
              <Input
                id="receipt"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
              />
              {receiptFile && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Selected: {receiptFile.name} ({(receiptFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: PDF, JPG, PNG (Max 5MB)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !receiptFile}
              className="flex items-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Submit Payment'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitSubjectPaymentDialog;