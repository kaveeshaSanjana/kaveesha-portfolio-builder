import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { CalendarIcon, DollarSign } from 'lucide-react';

interface CreateSubjectPaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instituteId: string;
  classId: string;
  subjectId: string;
  onSuccess: () => void;
}

interface CreateSubjectPaymentData {
  title: string;
  description: string;
  targetType: 'PARENTS' | 'STUDENTS';
  priority: 'MANDATORY' | 'OPTIONAL';
  amount: number;
  documentUrl?: string;
  lastDate: string;
  notes?: string;
}

const CreateSubjectPaymentForm: React.FC<CreateSubjectPaymentFormProps> = ({
  open,
  onOpenChange,
  instituteId,
  classId,
  subjectId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSubjectPaymentData>({
    title: '',
    description: '',
    targetType: 'PARENTS',
    priority: 'MANDATORY',
    amount: 0,
    documentUrl: '',
    lastDate: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.amount || !formData.lastDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        targetType: formData.targetType,
        priority: formData.priority,
        amount: parseFloat(formData.amount.toString()),
        documentUrl: formData.documentUrl && formData.documentUrl.trim() ? formData.documentUrl : undefined,
        lastDate: new Date(formData.lastDate).toISOString(),
        notes: formData.notes || undefined
      };

      const response = await apiClient.post(
        `/institute-class-subject-payments/institute/${instituteId}/class/${classId}/subject/${subjectId}`,
        requestData
      );

      toast({
        title: "Success",
        description: "Subject payment created successfully."
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        targetType: 'PARENTS',
        priority: 'MANDATORY',
        amount: 0,
        documentUrl: '',
        lastDate: '',
        notes: ''
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject payment.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateSubjectPaymentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Create Subject Payment</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Monthly Tuition Fee"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the payment"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetType">Target Type *</Label>
              <Select
                value={formData.targetType}
                onValueChange={(value) => handleInputChange('targetType', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PARENTS">Parents</SelectItem>
                  <SelectItem value="STUDENTS">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANDATORY">Mandatory</SelectItem>
                  <SelectItem value="OPTIONAL">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastDate">Due Date *</Label>
            <Input
              id="lastDate"
              type="datetime-local"
              value={formData.lastDate}
              onChange={(e) => handleInputChange('lastDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentUrl">Document URL (Optional)</Label>
            <Input
              id="documentUrl"
              type="url"
              value={formData.documentUrl}
              onChange={(e) => handleInputChange('documentUrl', e.target.value)}
              placeholder="https://example.com/document.pdf"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or instructions"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectPaymentForm;