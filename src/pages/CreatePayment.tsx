import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { 
  Upload, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface PaymentFormData {
  paymentAmount: string;
  paymentMethod: 'BANK_TRANSFER' | 'ONLINE_PAYMENT' | 'CASH_DEPOSIT' | '';
  paymentReference: string;
  paymentDate: string;
  paymentMonth: string;
  notes: string;
  paymentSlip: File | null;
}

const CreatePayment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentAmount: '',
    paymentMethod: '',
    paymentReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMonth: new Date().toISOString().slice(0, 7),
    notes: '',
    paymentSlip: null
  });
  const [fileError, setFileError] = useState('');

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      setFileError('Only PDF, JPG, JPEG, and PNG files are allowed');
      return false;
    }

    if (file.size > maxSize) {
      setFileError('File size must be less than 2MB');
      return false;
    }

    setFileError('');
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setFormData(prev => ({
        ...prev,
        paymentSlip: file
      }));
    } else if (file) {
      // Clear the file input if validation failed
      event.target.value = '';
      setFormData(prev => ({
        ...prev,
        paymentSlip: null
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.paymentMethod) {
      toast({
        title: "Validation Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.paymentDate) {
      toast({
        title: "Validation Error",
        description: "Please select a payment date",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.paymentMonth) {
      toast({
        title: "Validation Error",
        description: "Please select a payment month",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.paymentSlip) {
      toast({
        title: "Validation Error",
        description: "Please upload a payment slip",
        variant: "destructive",
      });
      return false;
    }

    if (formData.paymentReference && formData.paymentReference.length > 100) {
      toast({
        title: "Validation Error",
        description: "Payment reference must be less than 100 characters",
        variant: "destructive",
      });
      return false;
    }

    if (formData.notes && formData.notes.length > 1000) {
      toast({
        title: "Validation Error",
        description: "Notes must be less than 1000 characters",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const baseUrl = getBaseUrl();
      
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('paymentAmount', parseFloat(formData.paymentAmount).toFixed(2));
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('paymentDate', new Date(formData.paymentDate).toISOString());
      formDataToSend.append('paymentMonth', formData.paymentMonth);
      
      if (formData.paymentReference) {
        formDataToSend.append('paymentReference', formData.paymentReference);
      }
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }
      if (formData.paymentSlip) {
        formDataToSend.append('paymentSlip', formData.paymentSlip);
      }

      const response = await fetch(`${baseUrl}/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Payment creation response:', result);
      
      setSuccessData(result);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        paymentAmount: '',
        paymentMethod: '',
        paymentReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMonth: new Date().toISOString().slice(0, 7),
        notes: '',
        paymentSlip: null
      });
      
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSuccessData(null);
    navigate('/payments');
  };

  const resetForm = () => {
    setFormData({
      paymentAmount: '',
      paymentMethod: '',
      paymentReference: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMonth: new Date().toISOString().slice(0, 7),
      notes: '',
      paymentSlip: null
    });
    setFileError('');
  };

  const handleCancel = () => {
    resetForm();
    navigate('/payments');
  };

  return (
    <>
      <AppLayout currentPage="system-payment">
        <div className="container mx-auto p-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>
              <FileText className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileText className="h-8 w-8" />
                Create New Payment
              </h1>
              <p className="text-muted-foreground">
                Submit a new payment with payment slip upload
              </p>
            </div>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Amount */}
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.paymentAmount}
                  onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="ONLINE_PAYMENT">Online Payment</SelectItem>
                    <SelectItem value="CASH_DEPOSIT">Cash Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Date */}
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                />
              </div>

              {/* Payment Month */}
              <div className="space-y-2">
                <Label htmlFor="paymentMonth">Payment Month *</Label>
                <Input
                  id="paymentMonth"
                  type="month"
                  value={formData.paymentMonth}
                  onChange={(e) => handleInputChange('paymentMonth', e.target.value)}
                />
              </div>
            </div>

            {/* Payment Reference */}
            <div className="space-y-2">
              <Label htmlFor="paymentReference">Payment Reference (Optional)</Label>
              <Input
                id="paymentReference"
                placeholder="Enter payment reference number"
                maxLength={100}
                value={formData.paymentReference}
                onChange={(e) => handleInputChange('paymentReference', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {formData.paymentReference.length}/100 characters
              </p>
            </div>

            {/* Payment Slip Upload */}
            <div className="space-y-2">
              <Label htmlFor="paymentSlip">Payment Slip *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <Input
                      id="paymentSlip"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="paymentSlip"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      Choose File
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      PDF, JPG, JPEG, PNG (max 2MB)
                    </p>
                  </div>
                </div>
                
                {formData.paymentSlip && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{formData.paymentSlip.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(formData.paymentSlip.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                )}
                
                {fileError && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {fileError}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes about this payment"
                rows={3}
                maxLength={1000}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {formData.notes.length}/1000 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Payment'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </AppLayout>

      {/* Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Payment Submitted Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Your payment has been submitted and is now pending verification.</p>
              {successData && (
                <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <div><strong>Payment ID:</strong> {successData.data?.paymentId}</div>
                  <div><strong>Status:</strong> {successData.data?.status}</div>
                  {successData.data?.uploadedFile && (
                    <div><strong>Uploaded File:</strong> {successData.data.uploadedFile}</div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleSuccessClose}>
            Continue
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CreatePayment;