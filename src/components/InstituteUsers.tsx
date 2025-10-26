
import React, { useState } from 'react';
import * as MUI from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, RefreshCw, GraduationCap, Users, UserCheck, Plus, UserPlus, UserCog, Filter, Search, Shield, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { instituteApi } from '@/api/institute.api';
import { studentsApi } from '@/api/students.api';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useTableData } from '@/hooks/useTableData';
import CreateUserForm from '@/components/forms/CreateUserForm';
import CreateComprehensiveUserForm from '@/components/forms/CreateComprehensiveUserForm';
import AssignUserForm from '@/components/forms/AssignUserForm';
import AssignParentForm from '@/components/forms/AssignParentForm';
import AssignParentByPhoneForm from '@/components/forms/AssignParentByPhoneForm';
import AssignUserMethodsDialog from '@/components/forms/AssignUserMethodsDialog';
import { usersApi, BasicUser } from '@/api/users.api';
import UserInfoDialog from '@/components/forms/UserInfoDialog';
import UserOrganizationsDialog from '@/components/forms/UserOrganizationsDialog';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface InstituteUserData {
  id: string;
  name: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  phoneNumber?: string;
  imageUrl?: string;
  instituteUserImageUrl?: string;
  dateOfBirth?: string;
  userIdByInstitute?: string | null;
  verifiedBy?: string | null;
  fatherId?: string;
  motherId?: string;
  guardianId?: string;
}

interface InstituteUsersResponse {
  data: InstituteUserData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type UserType = 'STUDENT' | 'TEACHER' | 'ATTENDANCE_MARKER' | 'INSTITUTE_ADMIN';

const InstituteUsers = () => {
  const { toast } = useToast();
  const { user, currentInstituteId } = useAuth();
  
  const [selectedUser, setSelectedUser] = useState<InstituteUserData | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showCreateComprehensiveUserDialog, setShowCreateComprehensiveUserDialog] = useState(false);
  const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
  const [showAssignMethodsDialog, setShowAssignMethodsDialog] = useState(false);
  const [showAssignParentDialog, setShowAssignParentDialog] = useState(false);
  const [selectedStudentForParent, setSelectedStudentForParent] = useState<InstituteUserData | null>(null);
  const [assignInitialUserId, setAssignInitialUserId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<UserType>('STUDENT');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [userInfoDialog, setUserInfoDialog] = useState<{ open: boolean; user: BasicUser | null }>({
    open: false,
    user: null,
  });
  const [uploadingUserId, setUploadingUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [selectedUserForOrg, setSelectedUserForOrg] = useState<{ id: string; name: string } | null>(null);

  // Table data management for each user type
  const studentsTable = useTableData<InstituteUserData>({
    endpoint: `/institute-users/institute/${currentInstituteId}/users/STUDENT`,
    dependencies: [], // Remove dependencies to prevent auto-reloading
    pagination: { defaultLimit: 50, availableLimits: [25, 50, 100] },
    autoLoad: false
  });

  const teachersTable = useTableData<InstituteUserData>({
    endpoint: `/institute-users/institute/${currentInstituteId}/users/TEACHER`,
    dependencies: [], // Remove dependencies to prevent auto-reloading
    pagination: { defaultLimit: 50, availableLimits: [25, 50, 100] },
    autoLoad: false
  });

  const attendanceMarkersTable = useTableData<InstituteUserData>({
    endpoint: `/institute-users/institute/${currentInstituteId}/users/ATTENDANCE_MARKER`,
    dependencies: [], // Remove dependencies to prevent auto-reloading
    pagination: { defaultLimit: 50, availableLimits: [25, 50, 100] },
    autoLoad: false
  });

  const instituteAdminsTable = useTableData<InstituteUserData>({
    endpoint: `/institute-users/institute/${currentInstituteId}/users/INSTITUTE_ADMIN`,
    dependencies: [], // Remove dependencies to prevent auto-reloading
    pagination: { defaultLimit: 50, availableLimits: [25, 50, 100] },
    autoLoad: false
  });

  // Use API request hook for creating users with duplicate prevention
  const createUserRequest = useApiRequest(
    async (userData: any) => {
      console.log('Creating user with data:', userData);
      // This would need to be implemented based on your API structure
      const response = await fetch(`/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return response.json();
    },
    { preventDuplicates: true, showLoading: false }
  );

  const handleViewUser = (user: InstituteUserData) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };
  const handleViewBasicUser = async (id?: string | null) => {
    if (!id) return;
    try {
      const info = await usersApi.getBasicInfo(id);
      setUserInfoDialog({ open: true, user: info });
    } catch (error: any) {
      console.error('Error fetching user basic info:', error);
      toast({
        title: 'Failed to load user',
        description: error?.message || 'Could not fetch user information',
        variant: 'destructive',
        duration: 1500
      });
    }
  };

  const handleCreateUser = async (userData: any) => {
    console.log('User created successfully:', userData);
    setShowCreateUserDialog(false);
    
    // If API returned assignment-related shape, auto-open Assign dialog with prefilled userId
    if (userData && typeof userData.success === 'boolean' && userData.user?.id) {
      setAssignInitialUserId(userData.user.id);
      setShowAssignUserDialog(true);
    }
    
    toast({
      title: "User Created",
      description: "User has been created successfully.",
      duration: 1500
    });
  };

  const handleAssignUser = async (assignData: any) => {
    console.log('User assigned successfully:', assignData);
    setShowAssignUserDialog(false);
    
    toast({
      title: "User Assigned",
      description: "User has been assigned to institute successfully.",
      duration: 1500
    });
    
    // Refresh the current tab data
    getCurrentTable().actions.refresh();
  };

  const handleAssignParent = (student: InstituteUserData) => {
    setSelectedStudentForParent(student);
    setShowAssignParentDialog(true);
  };

  const handleParentAssignment = async (data: any) => {
    // The API call is handled by the form component
    // This function just handles the success response
    setShowAssignParentDialog(false);
    setSelectedStudentForParent(null);
    
    // Refresh students data
    studentsTable.actions.refresh();
  };

  const handleImageUpload = async (userId: string) => {
    if (!selectedImage || !currentInstituteId) return;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${getBaseUrl()}/institute-users/institute/${currentInstituteId}/users/${userId}/upload-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: result.message || "Image uploaded successfully",
        duration: 1500
      });

      setUploadingUserId(null);
      setSelectedImage(null);
      getCurrentTable().actions.refresh();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
        duration: 1500
      });
    }
  };

  const getCurrentTable = () => {
    switch (activeTab) {
      case 'STUDENT':
        return studentsTable;
      case 'TEACHER':
        return teachersTable;
      case 'ATTENDANCE_MARKER':
        return attendanceMarkersTable;
      case 'INSTITUTE_ADMIN':
        return instituteAdminsTable;
      default:
        return studentsTable;
    }
  };

  // Prevent unnecessary API calls on repeated clicks.
  const safeLoad = (table: any) => {
    if (!table || table.state?.loading) return;
    // If already loaded once and no explicit refresh requested, skip
    if (table.state?.lastRefresh && (table.state?.data?.length || 0) > 0) return;
    table.actions?.loadData?.(false);
  };

  const getCurrentUsers = () => {
    return getCurrentTable().state.data;
  };

  const getUserTypeLabel = (type: UserType) => {
    switch (type) {
      case 'STUDENT':
        return 'Students';
      case 'TEACHER':
        return 'Teachers';
      case 'ATTENDANCE_MARKER':
        return 'Attendance Markers';
      case 'INSTITUTE_ADMIN':
        return 'Institute Admins';
      default:
        return '';
    }
  };

  const getUserTypeIcon = (type: UserType) => {
    switch (type) {
      case 'STUDENT':
        return GraduationCap;
      case 'TEACHER':
        return Users;
      case 'ATTENDANCE_MARKER':
        return UserCheck;
      case 'INSTITUTE_ADMIN':
        return Shield;
      default:
        return Users;
    }
  };

  const userRole = useInstituteRole();

  if (userRole !== 'InstituteAdmin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Access denied. InstituteAdmin role required.</p>
      </div>
    );
  }

  if (!currentInstituteId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please select an institute first.</p>
      </div>
    );
  }

  const currentTable = getCurrentTable();
  const currentUsers = getCurrentUsers();
  const filteredUsers = currentUsers.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm = !term || [u.name, u.id, u.email, u.phoneNumber]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(term));
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'verified' ? !!u.verifiedBy : !u.verifiedBy);
    return matchesTerm && matchesStatus;
  });
  const currentLoading = currentTable.state.loading;
  const IconComponent = getUserTypeIcon(activeTab);

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Institute Users</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage users in your institute
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 flex-1 sm:flex-none"
            size="sm"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            onClick={() => setShowAssignMethodsDialog(true)}
            variant="outline"
            className="flex items-center gap-2 flex-1 sm:flex-none"
            size="sm"
          >
            <UserPlus className="h-4 w-4" />
            Assign User
          </Button>
          <Button 
            onClick={() => setShowCreateComprehensiveUserDialog(true)}
            className="flex items-center gap-2 flex-1 sm:flex-none"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Tabs for different user types */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserType)}>
        {/* Mobile: Horizontal scrollable tabs - icon only, name shows when active */}
        <div className="lg:hidden overflow-x-auto">
          <TabsList className="inline-flex h-auto w-auto gap-2 p-1.5 bg-background border rounded-lg">
            <TabsTrigger 
              value="STUDENT" 
              className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md whitespace-nowrap data-[state=inactive]:px-2"
            >
              <GraduationCap className="h-4 w-4" />
              {activeTab === 'STUDENT' && <span className="text-sm">Students</span>}
            </TabsTrigger>
            <TabsTrigger 
              value="TEACHER" 
              className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md whitespace-nowrap data-[state=inactive]:px-2"
            >
              <Users className="h-4 w-4" />
              {activeTab === 'TEACHER' && <span className="text-sm">Teachers</span>}
            </TabsTrigger>
            <TabsTrigger 
              value="ATTENDANCE_MARKER" 
              className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md whitespace-nowrap data-[state=inactive]:px-2"
            >
              <UserCheck className="h-4 w-4" />
              {activeTab === 'ATTENDANCE_MARKER' && <span className="text-sm">Markers</span>}
            </TabsTrigger>
            <TabsTrigger 
              value="INSTITUTE_ADMIN" 
              className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md whitespace-nowrap data-[state=inactive]:px-2"
            >
              <Shield className="h-4 w-4" />
              {activeTab === 'INSTITUTE_ADMIN' && <span className="text-sm">Admins</span>}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop: Full width tabs with text */}
        <div className="hidden lg:block">
          <TabsList className="grid w-full grid-cols-4 gap-2 p-2 h-auto bg-muted/50">
            <TabsTrigger 
              value="STUDENT" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger 
              value="TEACHER" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              <span>Teachers</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ATTENDANCE_MARKER" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <UserCheck className="h-4 w-4" />
              <span>Markers</span>
            </TabsTrigger>
            <TabsTrigger 
              value="INSTITUTE_ADMIN" 
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Shield className="h-4 w-4" />
              <span>Admins</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="STUDENT" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {studentsTable.pagination.totalCount} Students
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button 
                onClick={() => studentsTable.actions.refresh()} 
                disabled={studentsTable.state.loading}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                {studentsTable.state.loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Load Students</span>
                    <span className="sm:hidden">Load</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="TEACHER" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {teachersTable.pagination.totalCount} Teachers
              </Badge>
            </div>
            <Button 
              onClick={() => teachersTable.actions.refresh()} 
              disabled={teachersTable.state.loading}
              variant="outline"
              size="sm"
            >
              {teachersTable.state.loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Teachers
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ATTENDANCE_MARKER" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                {attendanceMarkersTable.pagination.totalCount} Attendance Markers
              </Badge>
            </div>
            <Button 
              onClick={() => attendanceMarkersTable.actions.refresh()} 
              disabled={attendanceMarkersTable.state.loading}
              variant="outline"
              size="sm"
            >
              {attendanceMarkersTable.state.loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Attendance Markers
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="INSTITUTE_ADMIN" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                {instituteAdminsTable.pagination.totalCount} Institute Admins
              </Badge>
            </div>
            <Button 
              onClick={() => instituteAdminsTable.actions.refresh()} 
              disabled={instituteAdminsTable.state.loading}
              variant="outline"
              size="sm"
            >
              {instituteAdminsTable.state.loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Institute Admins
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Filter Controls */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter {getUserTypeLabel(activeTab)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${activeTab.toLowerCase()}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select 
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as 'all' | 'verified' | 'unverified')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={currentTable.pagination.limit.toString()} 
                onValueChange={(value) => currentTable.actions.setLimit(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  {currentTable.availableLimits.map((limit) => (
                    <SelectItem key={limit} value={limit.toString()}>
                      {limit} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users MUI Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ height: 'calc(100vh - 280px)' }}>
          <Table stickyHeader aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Org</TableCell>
                <TableCell>Upload</TableCell>
                {activeTab === 'STUDENT' && <TableCell>Parent</TableCell>}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(currentTable.pagination.page * currentTable.pagination.limit, 
                       currentTable.pagination.page * currentTable.pagination.limit + currentTable.pagination.limit)
                .map((userData) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={userData.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userData.imageUrl || ''} alt={userData.name} />
                      <AvatarFallback>
                        {userData.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{userData.id}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{userData.name}</div>
                      <div className="text-sm text-gray-500">
                        {userData.userIdByInstitute ? `Institute ID: ${userData.userIdByInstitute}` : 'No Institute ID'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{userData.email || 'Not provided'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{userData.phoneNumber || 'Not provided'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={userData.verifiedBy ? "default" : "secondary"}>
                      {userData.verifiedBy ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setSelectedUserForOrg({ id: userData.id, name: userData.name });
                        setOrgDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    {userData.instituteUserImageUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 pointer-events-none"
                        disabled
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Uploaded
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setUploadingUserId(userData.id)}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    )}
                  </TableCell>
                  {activeTab === 'STUDENT' && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignParent(userData)}
                      >
                        <UserCog className="h-4 w-4 mr-1" />
                        Assign Parent
                      </Button>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewUser(userData)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={activeTab === 'STUDENT' ? 10 : 9} align="center">
                    <div className="py-12 text-center text-gray-500">
                      <IconComponent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No {getUserTypeLabel(activeTab).toLowerCase()}</p>
                      <p className="text-sm">No users found for the current selection</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={currentTable.availableLimits}
          component="div"
          count={currentTable.pagination.totalCount}
          rowsPerPage={currentTable.pagination.limit}
          page={currentTable.pagination.page}
          onPageChange={(event: unknown, newPage: number) => currentTable.actions.setPage(newPage)}
          onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            currentTable.actions.setLimit(parseInt(event.target.value, 10));
            currentTable.actions.setPage(0);
          }}
        />
      </Paper>

      {/* Pagination */}
      {currentTable.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentTable.pagination.page) * currentTable.pagination.limit) + 1} to {Math.min((currentTable.pagination.page + 1) * currentTable.pagination.limit, currentTable.pagination.totalCount)} of {currentTable.pagination.totalCount} {activeTab.toLowerCase()}s
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentTable.actions.prevPage()}
              disabled={currentTable.pagination.page === 0 || currentTable.state.loading}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentTable.pagination.page + 1} of {currentTable.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentTable.actions.nextPage()}
              disabled={currentTable.pagination.page === currentTable.pagination.totalPages - 1 || currentTable.state.loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {currentUsers.length === 0 && !currentLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <IconComponent className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {getUserTypeLabel(activeTab)} Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No {activeTab.toLowerCase().replace('_', ' ')}s found in this institute. Click the button above to load data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getUserTypeLabel(activeTab).slice(0, -1)} Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.imageUrl || ''} alt={selectedUser.name} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email || 'N/A'}</p>
                  <Badge variant="outline">{activeTab.replace('_', ' ')}</Badge>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-sm">{selectedUser.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-sm">{selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Institute User ID</label>
                  <p className="text-sm">{selectedUser.userIdByInstitute || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Verified By</label>
                  <p className="text-sm">{selectedUser.verifiedBy || 'N/A'}</p>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-lg font-medium mb-3">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 1</label>
                    <p className="text-sm">{selectedUser.addressLine1 || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 2</label>
                    <p className="text-sm">{selectedUser.addressLine2 || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Family Information (Students only) */}
              {activeTab === 'STUDENT' && (selectedUser.fatherId || selectedUser.motherId || selectedUser.guardianId) && (
                <div>
                  <h4 className="text-lg font-medium mb-3">Family Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.fatherId && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center justify-between">
                          <span>Father ID</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 ml-2"
                            onClick={() => handleViewBasicUser(selectedUser.fatherId)}
                            aria-label="View father user details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </label>
                        <p className="text-sm mt-1">{selectedUser.fatherId}</p>
                      </div>
                    )}
                    {selectedUser.motherId && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center justify-between">
                          <span>Mother ID</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 ml-2"
                            onClick={() => handleViewBasicUser(selectedUser.motherId)}
                            aria-label="View mother user details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </label>
                        <p className="text-sm mt-1">{selectedUser.motherId}</p>
                      </div>
                    )}
                    {selectedUser.guardianId && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center justify-between">
                          <span>Guardian ID</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 ml-2"
                            onClick={() => handleViewBasicUser(selectedUser.guardianId)}
                            aria-label="View guardian user details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </label>
                        <p className="text-sm mt-1">{selectedUser.guardianId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateUserDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={showAssignUserDialog} onOpenChange={setShowAssignUserDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign User to Institute</DialogTitle>
          </DialogHeader>
          <AssignUserForm
            instituteId={currentInstituteId!}
            onSubmit={handleAssignUser}
            onCancel={() => setShowAssignUserDialog(false)}
            initialUserId={assignInitialUserId}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Parent Dialog */}
      <Dialog open={showAssignParentDialog} onOpenChange={setShowAssignParentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Parent to Student</DialogTitle>
          </DialogHeader>
          {selectedStudentForParent && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Assigning parent to:</p>
              <p className="font-medium">{selectedStudentForParent.name}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedStudentForParent.id}</p>
            </div>
          )}
          <AssignParentByPhoneForm
            studentId={selectedStudentForParent?.id || ''}
            onSubmit={handleParentAssignment}
            onCancel={() => {
              setShowAssignParentDialog(false);
              setSelectedStudentForParent(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Assign User Methods Dialog */}
      <AssignUserMethodsDialog
        open={showAssignMethodsDialog}
        onClose={() => setShowAssignMethodsDialog(false)}
        instituteId={currentInstituteId}
        onSuccess={() => {
          // Refresh the current tab data
          getCurrentTable().actions.refresh();
        }}
      />

      <UserInfoDialog 
        open={userInfoDialog.open}
        onClose={() => setUserInfoDialog({ open: false, user: null })}
        user={userInfoDialog.user}
      />

      {/* User Organizations Dialog */}
      {selectedUserForOrg && (
        <UserOrganizationsDialog
          open={orgDialogOpen}
          onOpenChange={setOrgDialogOpen}
          userId={selectedUserForOrg.id}
          userName={selectedUserForOrg.name}
        />
      )}

      {/* Create Comprehensive User Dialog */}
      {showCreateComprehensiveUserDialog && (
        <CreateComprehensiveUserForm
          onSubmit={(data) => {
            console.log('Comprehensive user created:', data);
            setShowCreateComprehensiveUserDialog(false);
            toast({
              title: "Success",
              description: data.message || "User created successfully!",
              duration: 1500
            });
            // Refresh the current tab data
            getCurrentTable().actions.refresh();
          }}
          onCancel={() => setShowCreateComprehensiveUserDialog(false)}
        />
      )}

      {/* Upload Image Dialog */}
      <Dialog open={!!uploadingUserId} onOpenChange={() => { setUploadingUserId(null); setSelectedImage(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload User Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => uploadingUserId && handleImageUpload(uploadingUserId)}
                disabled={!selectedImage}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <Button
                variant="outline"
                onClick={() => { setUploadingUserId(null); setSelectedImage(null); }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstituteUsers;
