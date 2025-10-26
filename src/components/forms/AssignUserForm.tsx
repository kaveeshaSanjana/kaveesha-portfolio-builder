import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

interface AssignUserFormProps {
  instituteId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialUserId?: string;
}

interface AssignUserResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
  };
}

const AssignUserForm = ({ instituteId, onSubmit, onCancel, initialUserId }: AssignUserFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: initialUserId || '',
    userIdByInstitute: '',
    status: 'ACTIVE',
    role: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        instituteId,
        userId: formData.userId,
        userIdByInstitute: formData.userIdByInstitute,
        status: formData.status,
        role: formData.role
      };

      const response = await apiClient.post<AssignUserResponse>('/institute-users', payload);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        onSubmit(response);
      } else {
        // Handle case where user is already assigned - show auto-popup
        if (response.message.includes('already assigned')) {
          toast({
            title: "User Already Assigned",
            description: response.message,
            variant: "destructive"
          });
          
          // Auto-fill the form with the existing user data
          setFormData(prev => ({
            ...prev,
            userId: response.user.id
          }));
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error: any) {
      console.error('Error assigning user:', error);
      
      // Handle different response scenarios
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.message?.includes('already assigned')) {
          toast({
            title: "User Already Assigned",
            description: errorData.message,
            variant: "destructive"
          });
          
          // Auto-fill the form if user data is provided
          if (errorData.user) {
            setFormData(prev => ({
              ...prev,
              userId: errorData.user.id
            }));
          }
        } else {
          toast({
            title: "Error",
            description: errorData.message || 'Failed to assign user to institute',
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Error",
          description: 'Failed to assign user to institute',
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="userId" className="text-sm font-medium">User ID *</Label>
        <Input
          id="userId"
          value={formData.userId}
          onChange={(e) => handleInputChange('userId', e.target.value)}
          placeholder="Enter user ID"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="userIdByInstitute" className="text-sm font-medium">Institute User ID *</Label>
        <Input
          id="userIdByInstitute"
          value={formData.userIdByInstitute}
          onChange={(e) => handleInputChange('userIdByInstitute', e.target.value)}
          placeholder="e.g., EMP2024001"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
        
        <div>
          <Label htmlFor="role" className="text-sm font-medium">User Role *</Label>
          <Select value={formData.role || ''} onValueChange={(value) => handleInputChange('role', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select user role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
              <SelectItem value="TEACHER">Teacher</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="ATTENDANCE_MARKER">Attendance Marker</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Assigning...' : 'Assign User'}
        </Button>
      </div>
    </form>
  );
};

export default AssignUserForm;