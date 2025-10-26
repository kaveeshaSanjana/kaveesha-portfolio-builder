import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { UserPlus, Phone, CreditCard, User, Eye, Mail, Upload } from 'lucide-react';

interface AssignUserMethodsDialogProps {
  open: boolean;
  onClose: () => void;
  instituteId: string;
  onSuccess: () => void;
}

type AssignMethod = 'id' | 'phone' | 'rfid' | 'email';

interface UserPreviewData {
  id: string;
  imageUrl: string;
  fullName: string;
  userType: string;
}

const AssignUserMethodsDialog = ({ open, onClose, instituteId, onSuccess }: AssignUserMethodsDialogProps) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<AssignMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreview, setUserPreview] = useState<UserPreviewData | null>(null);
  const [showUserPreview, setShowUserPreview] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Form states for different methods
  const [idFormData, setIdFormData] = useState({
    userId: '',
    instituteUserType: 'STUDENT',
    userIdByInstitute: '',
    instituteCardId: '',
    image: null as File | null
  });

  const [phoneFormData, setPhoneFormData] = useState({
    phoneNumber: '+94',
    instituteUserType: 'STUDENT',
    userIdByInstitute: '',
    instituteCardId: '',
    image: null as File | null
  });

  const [rfidFormData, setRfidFormData] = useState({
    rfid: '',
    instituteUserType: 'STUDENT',
    userIdByInstitute: '',
    instituteCardId: '',
    image: null as File | null
  });

  const [emailFormData, setEmailFormData] = useState({
    email: '',
    instituteUserType: 'STUDENT',
    userIdByInstitute: '',
    instituteCardId: '',
    image: null as File | null
  });

  const handleAssignById = async () => {
    if (!idFormData.userId || !idFormData.userIdByInstitute) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', idFormData.userId);
      formData.append('instituteUserType', idFormData.instituteUserType);
      formData.append('userIdByInstitute', idFormData.userIdByInstitute);
      if (idFormData.instituteCardId) {
        formData.append('instituteCardId', idFormData.instituteCardId);
      }
      if (idFormData.image) {
        formData.append('image', idFormData.image);
      }

      const response = await apiClient.post(
        `/institute-users/institute/${instituteId}/assign-user-by-id`,
        formData
      );

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to assign user',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignByPhone = async () => {
    if (phoneFormData.phoneNumber.length <= 3 || !phoneFormData.userIdByInstitute) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number and institute user ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('phoneNumber', phoneFormData.phoneNumber);
      formData.append('instituteUserType', phoneFormData.instituteUserType);
      formData.append('userIdByInstitute', phoneFormData.userIdByInstitute);
      if (phoneFormData.instituteCardId) {
        formData.append('instituteCardId', phoneFormData.instituteCardId);
      }
      if (phoneFormData.image) {
        formData.append('image', phoneFormData.image);
      }

      const response = await apiClient.post(
        `/institute-users/institute/${instituteId}/assign-user-by-phone`,
        formData
      );

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to assign user by phone',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignByRfid = async () => {
    if (!rfidFormData.rfid || !rfidFormData.userIdByInstitute) {
      toast({
        title: "Validation Error",
        description: "Please enter RFID and institute user ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('rfid', rfidFormData.rfid);
      formData.append('instituteUserType', rfidFormData.instituteUserType);
      formData.append('userIdByInstitute', rfidFormData.userIdByInstitute);
      if (rfidFormData.instituteCardId) {
        formData.append('instituteCardId', rfidFormData.instituteCardId);
      }
      if (rfidFormData.image) {
        formData.append('image', rfidFormData.image);
      }

      const response = await apiClient.post(
        `/institute-users/institute/${instituteId}/assign-student-by-rfid`,
        formData
      );

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to assign student by RFID',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignByEmail = async () => {
    if (!emailFormData.email || !emailFormData.userIdByInstitute) {
      toast({
        title: "Validation Error",
        description: "Please enter email and institute user ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', emailFormData.email);
      formData.append('instituteUserType', emailFormData.instituteUserType);
      formData.append('userIdByInstitute', emailFormData.userIdByInstitute);
      if (emailFormData.instituteCardId) {
        formData.append('instituteCardId', emailFormData.instituteCardId);
      }
      if (emailFormData.image) {
        formData.append('image', emailFormData.image);
      }

      const response = await apiClient.post(
        `/institute-users/institute/${instituteId}/assign-user-by-email`,
        formData
      );

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to assign user by email',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserById = async (userId: string) => {
    if (!userId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a user ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingPreview(true);
    try {
      const response = await apiClient.get(`/users/basic/${userId}`);
      setUserPreview(response);
      setShowUserPreview(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'User not found',
        variant: "destructive"
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const fetchUserByPhone = async (phoneNumber: string) => {
    if (!phoneNumber.trim() || phoneNumber === '+94') {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingPreview(true);
    try {
      // Don't encode the phone number - backend expects literal + sign
      const response = await apiClient.get(`/users/basic/phone/${phoneNumber}`);
      setUserPreview(response);
      setShowUserPreview(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'User not found',
        variant: "destructive"
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const fetchUserByEmail = async (email: string) => {
    if (!email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingPreview(true);
    try {
      const response = await apiClient.get(`/users/basic/email/${email}`);
      setUserPreview(response);
      setShowUserPreview(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'User not found',
        variant: "destructive"
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const resetForm = () => {
    setSelectedMethod(null);
    setIdFormData({ userId: '', instituteUserType: 'STUDENT', userIdByInstitute: '', instituteCardId: '', image: null });
    setPhoneFormData({ phoneNumber: '+94', instituteUserType: 'STUDENT', userIdByInstitute: '', instituteCardId: '', image: null });
    setRfidFormData({ rfid: '', instituteUserType: 'STUDENT', userIdByInstitute: '', instituteCardId: '', image: null });
    setEmailFormData({ email: '', instituteUserType: 'STUDENT', userIdByInstitute: '', instituteCardId: '', image: null });
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Always ensure it starts with +94
    if (!value.startsWith('+94')) {
      value = '+94';
    }
    
    // Get the part after +94
    const numberPart = value.slice(3);
    
    // Prevent starting with 0 and only allow digits
    if (numberPart.length > 0) {
      // Remove any non-digit characters
      const cleanNumber = numberPart.replace(/\D/g, '');
      
      // Prevent starting with 0
      if (cleanNumber.startsWith('0')) {
        return; // Don't update if trying to start with 0
      }
      
      value = '+94' + cleanNumber;
    }
    
    setPhoneFormData(prev => ({ ...prev, phoneNumber: value }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign User
          </DialogTitle>
        </DialogHeader>

        {!selectedMethod ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose how you want to assign a user to this institute:
            </p>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => setSelectedMethod('id')}
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Assign user by ID</div>
                    <div className="text-sm text-muted-foreground">Use existing user ID</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => setSelectedMethod('phone')}
              >
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Assign user by Phone number</div>
                    <div className="text-sm text-muted-foreground">Find user by phone number</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => setSelectedMethod('rfid')}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Assign Student by RFID</div>
                    <div className="text-sm text-muted-foreground">Use RFID card number</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => setSelectedMethod('email')}
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">Assign user by Email</div>
                    <div className="text-sm text-muted-foreground">Find user by email address</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMethod(null)}
              className="mb-2"
            >
              ← Back to methods
            </Button>

            {selectedMethod === 'id' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-blue-500" />
                  <Badge variant="outline">Assign by User ID</Badge>
                </div>

                <div>
                  <Label htmlFor="userId">User ID *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="userId"
                      value={idFormData.userId}
                      onChange={(e) => setIdFormData(prev => ({ ...prev, userId: e.target.value }))}
                      placeholder="Enter user ID"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => fetchUserById(idFormData.userId)}
                      disabled={isLoadingPreview || !idFormData.userId.trim()}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="instituteUserType">User Type *</Label>
                  <Select
                    value={idFormData.instituteUserType}
                    onValueChange={(value) => setIdFormData(prev => ({ ...prev, instituteUserType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ATTENDANCE_MARKER">Attendance Marker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="userIdByInstitute">Institute User ID *</Label>
                  <Input
                    id="userIdByInstitute"
                    value={idFormData.userIdByInstitute}
                    onChange={(e) => setIdFormData(prev => ({ ...prev, userIdByInstitute: e.target.value }))}
                    placeholder="e.g., STU2024001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="instituteCardId">Institute Card ID</Label>
                  <Input
                    id="instituteCardId"
                    value={idFormData.instituteCardId}
                    onChange={(e) => setIdFormData(prev => ({ ...prev, instituteCardId: e.target.value }))}
                    placeholder="e.g., CARD-2024-001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="idImage">Profile Image</Label>
                  <div className="mt-1">
                    <Input
                      id="idImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                      className="cursor-pointer"
                    />
                    {idFormData.image && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        {idFormData.image.name}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAssignById}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Assigning...' : 'Assign User'}
                </Button>
              </div>
            )}

            {selectedMethod === 'phone' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="h-4 w-4 text-green-500" />
                  <Badge variant="outline">Assign by Phone Number</Badge>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="phoneNumber"
                      value={phoneFormData.phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="+94772261284"
                      className="pl-12 pr-10"
                      maxLength={12}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      +94
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => fetchUserByPhone(phoneFormData.phoneNumber)}
                      disabled={isLoadingPreview || phoneFormData.phoneNumber === '+94'}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phoneUserType">User Type *</Label>
                  <Select
                    value={phoneFormData.instituteUserType}
                    onValueChange={(value) => setPhoneFormData(prev => ({ ...prev, instituteUserType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ATTENDANCE_MARKER">Attendance Marker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phoneUserIdByInstitute">Institute User ID *</Label>
                  <Input
                    id="phoneUserIdByInstitute"
                    value={phoneFormData.userIdByInstitute}
                    onChange={(e) => setPhoneFormData(prev => ({ ...prev, userIdByInstitute: e.target.value }))}
                    placeholder="e.g., STU2024001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneInstituteCardId">Institute Card ID</Label>
                  <Input
                    id="phoneInstituteCardId"
                    value={phoneFormData.instituteCardId}
                    onChange={(e) => setPhoneFormData(prev => ({ ...prev, instituteCardId: e.target.value }))}
                    placeholder="e.g., CARD-2024-001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneImage">Profile Image</Label>
                  <div className="mt-1">
                    <Input
                      id="phoneImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoneFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                      className="cursor-pointer"
                    />
                    {phoneFormData.image && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        {phoneFormData.image.name}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAssignByPhone}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Assigning...' : 'Assign User'}
                </Button>
              </div>
            )}

            {selectedMethod === 'rfid' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                  <Badge variant="outline">Assign by RFID</Badge>
                </div>

                <div>
                  <Label htmlFor="rfid">RFID *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="rfid"
                      value={rfidFormData.rfid}
                      onChange={(e) => setRfidFormData(prev => ({ ...prev, rfid: e.target.value }))}
                      placeholder="RFID5984594359"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => fetchUserById(rfidFormData.rfid)}
                      disabled={isLoadingPreview || !rfidFormData.rfid.trim()}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="rfidUserType">User Type *</Label>
                  <Select
                    value={rfidFormData.instituteUserType}
                    onValueChange={(value) => setRfidFormData(prev => ({ ...prev, instituteUserType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ATTENDANCE_MARKER">Attendance Marker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rfidUserIdByInstitute">Institute User ID *</Label>
                  <Input
                    id="rfidUserIdByInstitute"
                    value={rfidFormData.userIdByInstitute}
                    onChange={(e) => setRfidFormData(prev => ({ ...prev, userIdByInstitute: e.target.value }))}
                    placeholder="e.g., STU2024001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rfidInstituteCardId">Institute Card ID</Label>
                  <Input
                    id="rfidInstituteCardId"
                    value={rfidFormData.instituteCardId}
                    onChange={(e) => setRfidFormData(prev => ({ ...prev, instituteCardId: e.target.value }))}
                    placeholder="e.g., CARD-2024-001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rfidImage">Profile Image</Label>
                  <div className="mt-1">
                    <Input
                      id="rfidImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setRfidFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                      className="cursor-pointer"
                    />
                    {rfidFormData.image && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        {rfidFormData.image.name}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAssignByRfid}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Assigning...' : 'Assign Student'}
                </Button>
              </div>
            )}

            {selectedMethod === 'email' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-4 w-4 text-orange-500" />
                  <Badge variant="outline">Assign by Email</Badge>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="email"
                      type="email"
                      value={emailFormData.email}
                      onChange={(e) => setEmailFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => fetchUserByEmail(emailFormData.email)}
                      disabled={isLoadingPreview || !emailFormData.email.trim()}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="emailUserType">User Type *</Label>
                  <Select
                    value={emailFormData.instituteUserType}
                    onValueChange={(value) => setEmailFormData(prev => ({ ...prev, instituteUserType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ATTENDANCE_MARKER">Attendance Marker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="emailUserIdByInstitute">Institute User ID *</Label>
                  <Input
                    id="emailUserIdByInstitute"
                    value={emailFormData.userIdByInstitute}
                    onChange={(e) => setEmailFormData(prev => ({ ...prev, userIdByInstitute: e.target.value }))}
                    placeholder="e.g., STU2024001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="emailInstituteCardId">Institute Card ID</Label>
                  <Input
                    id="emailInstituteCardId"
                    value={emailFormData.instituteCardId}
                    onChange={(e) => setEmailFormData(prev => ({ ...prev, instituteCardId: e.target.value }))}
                    placeholder="e.g., CARD-2024-001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="emailImage">Profile Image</Label>
                  <div className="mt-1">
                    <Input
                      id="emailImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEmailFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                      className="cursor-pointer"
                    />
                    {emailFormData.image && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        {emailFormData.image.name}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAssignByEmail}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Assigning...' : 'Assign User'}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* User Preview Dialog */}
        <Dialog open={showUserPreview} onOpenChange={setShowUserPreview}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>User Preview</DialogTitle>
            </DialogHeader>
            {userPreview && (
              <div className="flex flex-col items-center space-y-4 py-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userPreview.imageUrl} alt={userPreview.fullName} />
                  <AvatarFallback>
                    {userPreview.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{userPreview.fullName}</h3>
                  <Badge variant="outline" className="mt-1">
                    {userPreview.userType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">ID: {userPreview.id}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserMethodsDialog;