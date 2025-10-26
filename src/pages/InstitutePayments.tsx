import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowLeft, Download, Search, Eye, Plus, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { institutePaymentsApi, InstitutePaymentsResponse, StudentPaymentsResponse, InstitutePayment } from '@/api/institutePayments.api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import CreatePaymentDialog from '@/components/forms/CreatePaymentDialog';
import SubmitPaymentDialog from '@/components/forms/SubmitPaymentDialog';
import MUITable from '@/components/ui/mui-table';
import { useTableData } from '@/hooks/useTableData';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstituteRole } from '@/hooks/useInstituteRole';
const InstitutePayments = () => {
  console.log('🚀 InstitutePayments component rendering');

  // Check if we're in a Router context
  let navigate;
  let location;
  try {
    navigate = useNavigate();
    location = useLocation();
    console.log('✅ Router context available');
  } catch (error) {
    console.error('❌ Router context not available:', error);
    // Fallback navigation function
    navigate = (path: string | number) => {
      if (typeof path === 'string') {
        window.location.href = path;
      } else {
        window.history.go(path);
      }
    };
  }
  const {
    selectedInstitute,
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const effectiveRole = useInstituteRole();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<InstitutePayment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isInstituteAdmin = effectiveRole === 'InstituteAdmin';
  const isStudent = effectiveRole === 'Student';
  const isTeacher = effectiveRole === 'Teacher';
  // Configure table data hook
  const tableData = useTableData<InstitutePayment>({
    endpoint: isInstituteAdmin || isTeacher ? `/institute-payments/institute/${selectedInstitute?.id}/payments` : `/institute-payments/institute/${selectedInstitute?.id}/my-payments`,
    defaultParams: {
      search: searchQuery
    },
    dependencies: [selectedInstitute?.id, isInstituteAdmin, isTeacher, searchQuery],
    pagination: {
      defaultLimit: 50,
      availableLimits: [25, 50, 100]
    },
    autoLoad: false
  });
  // Search handler with live filtering
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Don't update filters in the API call, just filter locally for live search
  };

  // Force refresh data from API
  const handleForceRefresh = () => {
    console.log('Force refreshing payments data...');
    tableData.actions.refresh();
  };
  const handleSubmitPayment = (payment: InstitutePayment) => {
    setSelectedPayment(payment);
    setSubmitDialogOpen(true);
  };
  const handleViewSubmissions = (payment: InstitutePayment) => {
    try {
      navigate(`/payment-submissions/${payment.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = `/payment-submissions/${payment.id}`;
    }
  };
  // Filter data locally for live search
  const filteredData = useMemo(() => {
    if (!Array.isArray(tableData.state.data)) return [];
    return tableData.state.data.filter(payment => {
      if (!searchQuery.trim()) return true;
      const searchLower = searchQuery.toLowerCase();

      // Search in Payment Type
      const matchesPaymentType = payment.paymentType?.toLowerCase().includes(searchLower);

      // Search in Amount (convert to string and search)
      const matchesAmount = payment.amount?.toString().includes(searchQuery.trim());

      // Search in Priority
      const matchesPriority = payment.priority?.toLowerCase().includes(searchLower);
      return matchesPaymentType || matchesAmount || matchesPriority;
    });
  }, [tableData.state.data, searchQuery]);

  // Table columns configuration
  const columns = useMemo(() => [{
    id: 'paymentType',
    label: 'Payment Type',
    minWidth: 180,
    format: (value: string) => <div className="font-medium text-foreground">{value}</div>
  }, {
    id: 'description',
    label: 'Description',
    minWidth: 200,
    format: (value: string) => <div className="text-sm text-muted-foreground line-clamp-2">{value}</div>
  }, {
    id: 'amount',
    label: 'Amount',
    minWidth: 120,
    align: 'right' as const,
    format: (value: number) => {
      console.log('Amount column format - value:', value, 'type:', typeof value);
      const numericValue = Number(value) || 0;
      return <div className="font-semibold text-lg text-primary">Rs {numericValue.toLocaleString()}</div>;
    }
  }, {
    id: 'dueDate',
    label: 'Due Date',
    minWidth: 120,
    format: (value: string) => {
      const date = new Date(value);
      const isOverdue = date < new Date() && date.toDateString() !== new Date().toDateString();
      return <div className={`text-sm ${isOverdue ? 'text-destructive font-medium' : 'text-foreground'}`}>
            {date.toLocaleDateString()}
            {isOverdue && <div className="text-xs text-destructive">Overdue</div>}
          </div>;
    }
  }, {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    format: (value: string) => <Badge variant={value === 'ACTIVE' ? 'default' : 'secondary'} className={value === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700'}>
          {value}
        </Badge>
  }, ...(isInstituteAdmin ? [{
    id: 'totalSubmissions',
    label: 'Submissions',
    minWidth: 100,
    align: 'center' as const,
    format: (value: number, row: InstitutePayment) => <div className="text-center">
            <div className="font-semibold">{value || 0}</div>
            <div className="text-xs text-muted-foreground">
              {row.verifiedSubmissions || 0} verified
            </div>
          </div>
  }] : [])], [isInstituteAdmin]);
  const renderComponent = () => {
    // Debug logging for table data
    console.log('InstitutePayments Debug - Table data:', {
      loading: tableData.state.loading,
      error: tableData.state.error,
      dataLength: Array.isArray(tableData.state.data) ? tableData.state.data.length : 0,
      firstItem: Array.isArray(tableData.state.data) && tableData.state.data[0],
      amountValues: Array.isArray(tableData.state.data) ? tableData.state.data.map(item => ({
        id: item.id,
        paymentType: item.paymentType,
        amount: item.amount,
        typeof_amount: typeof item.amount
      })) : []
    });
    return <PageContainer className="h-full">
        {/* Header Section */}
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" onClick={() => {
                try {
                  navigate(-1);
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.history.back();
                }
              }} className="shrink-0" size="sm">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Institute Payments
                </h1>
                {selectedInstitute && <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Institute: <span className="font-medium text-foreground">{selectedInstitute.name}</span>
                  </p>}
              </div>
            </div>
            {isInstituteAdmin && <Button onClick={() => setCreateDialogOpen(true)} className="shrink-0" size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Payment</span>
                <span className="sm:hidden">Create</span>
              </Button>}
          </div>
        </div>

        {/* Institute Info Card */}
        {selectedInstitute && <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                {selectedInstitute.name}
              </CardTitle>
              {selectedInstitute.description && <p className="text-muted-foreground text-sm">{selectedInstitute.description}</p>}
            </CardHeader>
          </Card>}

        {/* Search and Actions */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by payment type, amount, or priority..." className="pl-10 w-full text-sm sm:text-base" value={searchQuery} onChange={e => handleSearch(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button variant="outline" onClick={handleForceRefresh} disabled={tableData.state.loading} size="sm">
                  <RefreshCw className={`h-4 w-4 sm:mr-2 ${tableData.state.loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{tableData.state.loading ? 'Refreshing...' : 'Force Refresh'}</span>
                  <span className="sm:hidden">Refresh</span>
                </Button>
                
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {tableData.state.loading && <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>}

        {/* Error State */}
        {tableData.state.error && <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-destructive text-lg mb-2">Failed to load payments</div>
                <p className="text-muted-foreground mb-4">{tableData.state.error}</p>
                <Button variant="outline" onClick={() => tableData.actions.refresh()} className="border-destructive/50 hover:bg-destructive/10">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>}

        {/* Load Data Section */}
        {!Array.isArray(tableData.state.data) || tableData.state.data.length === 0 ? <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Institute Payments
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {!selectedInstitute?.id ? 'Please select an institute first.' : 'Click the button below to load payments data'}
            </p>
            <Button onClick={() => tableData.actions.refresh()} disabled={tableData.state.loading || !selectedInstitute?.id} className="bg-blue-600 hover:bg-blue-700">
              {tableData.state.loading ? <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading Data...
                </> : <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Data
                </>}
            </Button>
          </div> : <>
            {/* Payments Table */}
            {!tableData.state.loading && !tableData.state.error && <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Records
                </CardTitle>
                <Badge variant="outline" className="text-sm">
                  {tableData.pagination.totalCount} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-auto">
                <div className="min-w-full">
                  <MUITable title="" columns={columns} data={filteredData} page={tableData.pagination.page} rowsPerPage={tableData.pagination.limit} totalCount={filteredData.length} onPageChange={tableData.actions.setPage} onRowsPerPageChange={tableData.actions.setLimit} rowsPerPageOptions={tableData.availableLimits} customActions={[
                  // Student actions
                  ...(isStudent ? [{
                    label: 'Submit Payment',
                    action: handleSubmitPayment,
                    icon: <CreditCard className="h-4 w-4" />,
                    variant: 'default' as const
                  }] : []),
                  // InstituteAdmin/Teacher actions  
                  ...(isInstituteAdmin || isTeacher ? [{
                    label: 'View Submissions',
                    action: handleViewSubmissions,
                    icon: <Eye className="h-4 w-4" />,
                    variant: 'default' as const
                  }] : [])]} />
                </div>
              </div>
            </CardContent>
          </Card>}

            {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Active Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                Rs {filteredData.filter(p => p.status === 'ACTIVE').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isInstituteAdmin ? 'Total Submissions' : 'Total Payments'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {isInstituteAdmin ? filteredData ? filteredData.reduce((sum, p) => sum + (p.totalSubmissions || 0), 0) : 0 : filteredData.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Loaded Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {filteredData.length}
              </p>
            </CardContent>
          </Card>
            </div>
          </>}

        {/* Dialogs */}
        {selectedInstitute && <>
            <CreatePaymentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} instituteId={selectedInstitute.id} onSuccess={() => {
            tableData.actions.refresh();
            toast({
              title: "Success",
              description: "Payment created successfully"
            });
          }} />
            <SubmitPaymentDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} payment={selectedPayment} instituteId={selectedInstitute.id} onSuccess={() => {
            tableData.actions.refresh();
            toast({
              title: "Success",
              description: "Payment submitted successfully"
            });
          }} />
          </>}
      </PageContainer>;
  };
  return renderComponent();
};
export default InstitutePayments;