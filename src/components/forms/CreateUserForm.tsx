import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { usersApi, UserCreateData } from '@/api';
import { toast } from 'sonner';
import { CalendarIcon, Camera, Upload } from 'lucide-react';

interface CreateUserFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: any;
}

const CreateUserForm = ({ onSubmit, onCancel, loading = false, initialData }: CreateUserFormProps) => {
  // Format initial date to YYYY-MM-DD if provided
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse and format the date
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    userType: initialData?.userType || 'USER',
    dateOfBirth: formatDateForInput(initialData?.dateOfBirth),
    gender: initialData?.gender || '',
    nic: initialData?.nic || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || '',
    district: initialData?.district || '',
    province: initialData?.province || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'Sri Lanka',
    imageUrl: initialData?.imageUrl || '',
    idUrl: initialData?.idUrl || '',
    isActive: initialData?.isActive ?? true,
    studentId: initialData?.studentId || '',
    emergencyContact: initialData?.emergencyContact || '',
    medicalConditions: initialData?.medicalConditions || '',
    allergies: initialData?.allergies || '',
    bloodGroup: initialData?.bloodGroup || '',
    fatherId: initialData?.fatherId || '',
    fatherPhoneNumber: initialData?.fatherPhoneNumber || '',
    motherId: initialData?.motherId || '',
    motherPhoneNumber: initialData?.motherPhoneNumber || '',
    guardianId: initialData?.guardianId || '',
    guardianPhoneNumber: initialData?.guardianPhoneNumber || '',
    occupation: initialData?.occupation || '',
    workplace: initialData?.workplace || '',
    workPhone: initialData?.workPhone || '',
    educationLevel: initialData?.educationLevel || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        handleInputChange('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formattedData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        userType: formData.userType,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nic: formData.nic,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        province: formData.province,
        postalCode: formData.postalCode,
        country: formData.country,
        imageUrl: formData.imageUrl,
        idUrl: formData.idUrl,
        isActive: formData.isActive,
        studentId: formData.studentId,
        emergencyContact: formData.emergencyContact,
        medicalConditions: formData.medicalConditions,
        allergies: formData.allergies,
        bloodGroup: formData.bloodGroup,
        fatherId: formData.fatherId,
        fatherPhoneNumber: formData.fatherPhoneNumber,
        motherId: formData.motherId,
        motherPhoneNumber: formData.motherPhoneNumber,
        guardianId: formData.guardianId,
        guardianPhoneNumber: formData.guardianPhoneNumber,
        occupation: formData.occupation,
        workplace: formData.workplace,
        workPhone: formData.workPhone,
        educationLevel: formData.educationLevel
      };
      
      console.log('Submitting user data with formatted date:', formattedData);
      
      if (!initialData) {
        const result = await usersApi.create(formattedData);
        toast.success('User created successfully!');
        onSubmit(result);
      } else {
        onSubmit(formattedData);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error?.response?.data?.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-6xl max-h-[98vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {initialData ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <p className="text-muted-foreground text-center mt-2">Fill in the information below to create a new user account</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Photo Upload Section */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  Photo Upload
                </h3>
                
                <div className="flex flex-col items-center gap-4">
                  {imagePreview && (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button type="button" onClick={handleCameraClick} variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
                    <Button type="button" onClick={handleFileClick} variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-base font-semibold text-foreground">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-base font-semibold text-foreground">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base font-semibold text-foreground">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber" className="text-base font-semibold text-foreground">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="userType" className="text-base font-semibold text-foreground">User Type *</Label>
                    <Select value={formData.userType} onValueChange={(value) => handleInputChange('userType', value)}>
                      <SelectTrigger className="mt-2 h-12 text-base">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="USER">User</SelectItem>
                         <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
                         <SelectItem value="ATTENDANCE_MARKER">Attendance Marker</SelectItem>
                         <SelectItem value="TEACHER">Teacher</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth" className="text-base font-semibold text-foreground">Date of Birth *</Label>
                    <div className="relative mt-2">
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="h-12 text-base"
                        placeholder="mm/dd/yyyy"
                        required
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gender" className="text-base font-semibold text-foreground">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="mt-2 h-12 text-base">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nic" className="text-base font-semibold text-foreground">NIC</Label>
                    <Input
                      id="nic"
                      value={formData.nic}
                      onChange={(e) => handleInputChange('nic', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter NIC number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="studentId" className="text-base font-semibold text-foreground">Student ID</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter student ID"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="idUrl" className="text-base font-semibold text-foreground">ID Document URL</Label>
                    <Input
                      id="idUrl"
                      value={formData.idUrl}
                      onChange={(e) => handleInputChange('idUrl', e.target.value)}
                      placeholder="https://example.com/id-document.pdf"
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Medical & Emergency Information Section */}
              <div className="bg-gradient-to-r from-accent/5 to-accent/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent-foreground font-bold">3</span>
                  </div>
                  Medical & Emergency Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="emergencyContact" className="text-base font-semibold">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="+94771234567"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bloodGroup" className="text-base font-semibold">Blood Group</Label>
                    <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                      <SelectTrigger className="mt-2 h-12 text-base">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A_POSITIVE">A+</SelectItem>
                        <SelectItem value="A_NEGATIVE">A-</SelectItem>
                        <SelectItem value="B_POSITIVE">B+</SelectItem>
                        <SelectItem value="B_NEGATIVE">B-</SelectItem>
                        <SelectItem value="O_POSITIVE">O+</SelectItem>
                        <SelectItem value="O_NEGATIVE">O-</SelectItem>
                        <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                        <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="medicalConditions" className="text-base font-semibold">Medical Conditions</Label>
                    <Textarea
                      id="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                      className="mt-2"
                      placeholder="Any medical conditions..."
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="allergies" className="text-base font-semibold">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      className="mt-2"
                      placeholder="Any allergies..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information Section */}
              <div className="bg-gradient-to-r from-secondary/5 to-secondary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground font-bold">4</span>
                  </div>
                  Parent/Guardian Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fatherId" className="text-base font-semibold">Father ID</Label>
                    <Input
                      id="fatherId"
                      value={formData.fatherId}
                      onChange={(e) => handleInputChange('fatherId', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter father's ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fatherPhoneNumber" className="text-base font-semibold">Father Phone Number</Label>
                    <Input
                      id="fatherPhoneNumber"
                      value={formData.fatherPhoneNumber}
                      onChange={(e) => handleInputChange('fatherPhoneNumber', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="+94771234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="motherId" className="text-base font-semibold">Mother ID</Label>
                    <Input
                      id="motherId"
                      value={formData.motherId}
                      onChange={(e) => handleInputChange('motherId', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter mother's ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="motherPhoneNumber" className="text-base font-semibold">Mother Phone Number</Label>
                    <Input
                      id="motherPhoneNumber"
                      value={formData.motherPhoneNumber}
                      onChange={(e) => handleInputChange('motherPhoneNumber', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="+94777654321"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guardianId" className="text-base font-semibold">Guardian ID</Label>
                    <Input
                      id="guardianId"
                      value={formData.guardianId}
                      onChange={(e) => handleInputChange('guardianId', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter guardian's ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guardianPhoneNumber" className="text-base font-semibold">Guardian Phone Number</Label>
                    <Input
                      id="guardianPhoneNumber"
                      value={formData.guardianPhoneNumber}
                      onChange={(e) => handleInputChange('guardianPhoneNumber', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="+94773333333"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">5</span>
                  </div>
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="occupation" className="text-base font-semibold">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="e.g., ENGINEER"
                    />
                  </div>

                  <div>
                    <Label htmlFor="workplace" className="text-base font-semibold">Workplace</Label>
                    <Input
                      id="workplace"
                      value={formData.workplace}
                      onChange={(e) => handleInputChange('workplace', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter workplace"
                    />
                  </div>

                  <div>
                    <Label htmlFor="workPhone" className="text-base font-semibold">Work Phone</Label>
                    <Input
                      id="workPhone"
                      value={formData.workPhone}
                      onChange={(e) => handleInputChange('workPhone', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="+94112345678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="educationLevel" className="text-base font-semibold">Education Level</Label>
                    <Input
                      id="educationLevel"
                      value={formData.educationLevel}
                      onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="e.g., Bachelor of Engineering"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-gradient-to-r from-secondary/5 to-secondary/10 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground font-bold">6</span>
                  </div>
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="addressLine1" className="text-base font-semibold">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2" className="text-base font-semibold">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Area, landmark"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-base font-semibold">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="district" className="text-base font-semibold">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter district"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province" className="text-base font-semibold">Province</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter province"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode" className="text-base font-semibold">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="country" className="text-base font-semibold">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Sri Lanka"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-12 px-8 text-base">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isLoading} className="w-full sm:w-auto h-12 px-8 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              {loading || isLoading ? 'Creating...' : (initialData ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserForm;