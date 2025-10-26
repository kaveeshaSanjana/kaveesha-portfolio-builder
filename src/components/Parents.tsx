import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import MUITable from '@/components/ui/mui-table';
import { Users, RefreshCw, Search, Plus, AlertTriangle, User, MapPin, Phone, Briefcase, Calendar, Home, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { type UserRole } from '@/contexts/types/auth.types';
import { useToast } from '@/hooks/use-toast';
import { useTableData } from '@/hooks/useTableData';

const Parents = () => {
  const {
    user,
    selectedInstitute
  } = useAuth();
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    instituteId: '',
    name: '',
    phone: '',
    address: '',
    occupation: ''
  });
  const userRole = useInstituteRole();
  const canViewParents = userRole === 'InstituteAdmin';
  const canCreateParents = userRole === 'InstituteAdmin';

  // Use the useTableData hook for better data management and pagination
  const tableData = useTableData({
    endpoint: selectedInstitute ? `/institute-users/institute/${selectedInstitute.id}/users/PARENT` : '',
    autoLoad: false,
    pagination: {
      defaultLimit: 50,
      availableLimits: [25, 50, 100]
    }
  });

  // Table columns configuration
  const columns = [{
    id: 'imageUrl',
    label: 'Avatar',
    minWidth: 80,
    align: 'center' as const,
    format: (value: string, row: any) => <Avatar className="h-8 w-8 md:h-10 md:w-10">
          <AvatarImage src={value} alt={row.name} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
  }, {
    id: 'userIdByInstitute',
    label: 'Institute ID',
    minWidth: 100,
    format: (value: string) => <div className="font-medium text-sm">
          {value || 'Not assigned'}
        </div>
  }, {
    id: 'name',
    label: 'Name',
    minWidth: 150,
    format: (value: string) => <div className="font-medium text-sm md:text-base">
          {value}
        </div>
  }, {
    id: 'phoneNumber',
    label: 'Phone',
    minWidth: 130,
    format: (value: string) => <div className="text-sm flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {value || 'Not specified'}
        </div>
  }, {
    id: 'dateOfBirth',
    label: 'Date of Birth',
    minWidth: 120,
    format: (value: string) => <div className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {value ? new Date(value).toLocaleDateString() : 'Not specified'}
        </div>
  }, {
    id: 'addressLine1',
    label: 'Address',
    minWidth: 200,
    format: (value: string, row: any) => <div className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <div>{value || 'Not specified'}</div>
            {row.addressLine2 && <div className="text-xs text-muted-foreground">{row.addressLine2}</div>}
          </div>
        </div>
  }, {
    id: 'occupation',
    label: 'Occupation',
    minWidth: 130,
    format: (value: string, row: any) => <div className="text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            {value || 'Not specified'}
          </div>
          {row.workPlace && <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <Home className="h-3 w-3" />
              {row.workPlace}
            </div>}
        </div>
  }, {
    id: 'verifiedBy',
    label: 'Status',
    minWidth: 100,
    align: 'center' as const,
    format: (value: string) => <Badge variant={value ? "default" : "secondary"} className="text-xs">
          {value ? 'Verified' : 'Unverified'}
      </Badge>
  }];

  // Filter data based on search term and filters
  const filteredData = tableData.state.data.filter(parent => {
    // Search term filter
    const matchesSearch = !searchTerm.trim() || parent.name?.toLowerCase().includes(searchTerm.toLowerCase()) || parent.addressLine1?.toLowerCase().includes(searchTerm.toLowerCase()) || parent.addressLine2?.toLowerCase().includes(searchTerm.toLowerCase()) || parent.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) || parent.workPlace?.toLowerCase().includes(searchTerm.toLowerCase());

    // Additional filters
    const matchesInstituteId = !filters.instituteId.trim() || parent.userIdByInstitute?.toLowerCase().includes(filters.instituteId.toLowerCase());
    const matchesName = !filters.name.trim() || parent.name?.toLowerCase().includes(filters.name.toLowerCase());
    const matchesPhone = !filters.phone.trim() || parent.phoneNumber?.toLowerCase().includes(filters.phone.toLowerCase());
    const matchesAddress = !filters.address.trim() || parent.addressLine1?.toLowerCase().includes(filters.address.toLowerCase()) || parent.addressLine2?.toLowerCase().includes(filters.address.toLowerCase());
    const matchesOccupation = !filters.occupation.trim() || parent.occupation?.toLowerCase().includes(filters.occupation.toLowerCase()) || parent.workPlace?.toLowerCase().includes(filters.occupation.toLowerCase());
    return matchesSearch && matchesInstituteId && matchesName && matchesPhone && matchesAddress && matchesOccupation;
  });

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      instituteId: '',
      name: '',
      phone: '',
      address: '',
      occupation: ''
    });
    setSearchTerm('');
  };

  // Access control check
  if (!canViewParents) {
    return <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You don't have permission to view parents. Only Institute Admins can access this section.
        </p>
      </div>;
  }

  // Selection requirement check
  if (!selectedInstitute) {
    return <div className="flex flex-col items-center justify-center h-64 text-center">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Selection Required</h3>
        <p className="text-muted-foreground">
          Please select an institute to view parents.
        </p>
      </div>;
  }
  return <div className="h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 md:w-8 md:h-8" />
            Institute Parents
          </h1>
          <div className="text-sm md:text-base text-muted-foreground">
            <p>Institute: <span className="font-medium">{selectedInstitute.name}</span></p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          
          <Button onClick={() => tableData.actions.refresh()} disabled={tableData.state.loading} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${tableData.state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Advanced Filters</CardTitle>
                  <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Institute ID</label>
                    <Input placeholder="Filter by Institute ID..." value={filters.instituteId} onChange={e => setFilters(prev => ({
                    ...prev,
                    instituteId: e.target.value
                  }))} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input placeholder="Filter by name..." value={filters.name} onChange={e => setFilters(prev => ({
                    ...prev,
                    name: e.target.value
                  }))} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input placeholder="Filter by phone..." value={filters.phone} onChange={e => setFilters(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input placeholder="Filter by address..." value={filters.address} onChange={e => setFilters(prev => ({
                    ...prev,
                    address: e.target.value
                  }))} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Occupation</label>
                    <Input placeholder="Filter by occupation..." value={filters.occupation} onChange={e => setFilters(prev => ({
                    ...prev,
                    occupation: e.target.value
                  }))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Parents MUI Table - Full Height */}
      <div className="flex-1 min-h-0">
        <MUITable title="Institute Parents" columns={columns} data={filteredData} page={tableData.pagination.page} rowsPerPage={tableData.pagination.limit} totalCount={tableData.pagination.totalCount} onPageChange={tableData.actions.setPage} onRowsPerPageChange={tableData.actions.setLimit} rowsPerPageOptions={tableData.availableLimits} allowAdd={false} allowEdit={false} allowDelete={false} />
      </div>
    </div>;
};
export default Parents;