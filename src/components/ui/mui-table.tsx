import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row?: any) => React.ReactNode;
}
interface MUITableProps {
  title: string;
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  customActions?: Array<{
    label: string;
    action: (row: any) => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  // Pagination props
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  // Section type for different behaviors
  sectionType?: 'lectures' | 'homework' | 'exams' | 'students' | 'classes' | 'subjects';
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
}
export default function MUITable({
  title,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onView,
  customActions = [],
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [25, 50, 100],
  sectionType,
  allowAdd = true,
  allowEdit = true,
  allowDelete = true
}: MUITableProps) {
  const {
    user
  } = useAuth();
  const instituteRole = useInstituteRole();
  
  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    onRowsPerPageChange(newRowsPerPage);
    onPageChange(0);
  };

  // Permission checks using institute role
  const canAdd = allowAdd && onAdd && (instituteRole === 'InstituteAdmin' || instituteRole === 'Teacher');
  const canEdit = allowEdit && onEdit && (instituteRole === 'InstituteAdmin' || instituteRole === 'Teacher');
  const canDelete = allowDelete && onDelete && (instituteRole === 'InstituteAdmin' || instituteRole === 'Teacher');

  // Add actions column if needed
  const hasActions = canEdit && onEdit || canDelete && onDelete || onView || customActions.length > 0;
  const allColumns = hasActions ? [...columns, {
    id: 'actions',
    label: 'Actions',
    minWidth: 200,
    align: 'center' as const
  }] : columns;
  return <div className="w-full space-y-4">
      {/* Header */}
      

      {/* Table */}
      <Paper sx={{
      width: '100%',
      overflow: 'hidden',
      height: 'calc(100vh - 280px)'
    }}>
        <TableContainer sx={{
        height: 'calc(100% - 52px)'
      }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {allColumns.map(column => <TableCell key={column.id} align={column.align} style={{
                minWidth: column.minWidth
              }} sx={{
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
                borderBottom: '1px solid hsl(var(--border))'
              }}>
                    {column.label}
                  </TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => {
              console.log('Row data:', row, 'Index:', index);
              return <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    {columns.map(column => {
                  const value = row[column.id];
                  console.log(`Column ${column.id}:`, value, 'from row:', row);
                  return <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value, row) : value || '-'}
                      </TableCell>;
                })}
                    {hasActions && <TableCell align="center">
                      <div className="flex justify-center items-center gap-1 flex-wrap">
                        {/* InstituteAdmin and Teacher Actions */}
                         {onEdit && (instituteRole === 'InstituteAdmin' || instituteRole === 'Teacher') && <Button variant="outline" size="sm" onClick={() => onEdit(row)} title={sectionType === 'lectures' ? 'Edit Lectures' : sectionType === 'homework' ? 'Edit Homework' : 'Edit Exam'} className="h-8 px-3 text-xs mr-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>}
                        
                         {onView && (instituteRole === 'InstituteAdmin' || instituteRole === 'Teacher' || (instituteRole === 'Student' && sectionType === 'homework')) && sectionType !== 'lectures' && <Button variant="outline" size="sm" onClick={() => onView(row)} title={sectionType === 'homework' ? 'View Homework' : sectionType === 'exams' ? 'View Results' : 'View'} className="h-8 px-3 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>}
                        
                        {/* Student Actions */}
                        {instituteRole === 'Student' && sectionType === 'homework' && onEdit && <Button variant="default" size="sm" onClick={() => onEdit(row)} title="Submit" className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="h-3 w-3 mr-1" />
                            Submit
                          </Button>}
                        
                        {instituteRole === 'Student' && sectionType === 'exams' && onView && <Button variant="outline" size="sm" onClick={() => onView(row)} title="View Results" className="h-8 px-3 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View Results
                          </Button>}

                        {/* Custom Actions */}
                        {customActions.map((action, actionIndex) => <Button key={actionIndex} variant={action.variant || "outline"} size="sm" onClick={() => action.action(row)} title={action.label} className={`h-8 px-3 text-xs ${action.variant === 'default' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}>
                            {action.icon && <span className="mr-1">{action.icon}</span>}
                            {action.label}
                          </Button>)}
                      </div>
                    </TableCell>}
                  </TableRow>;
            })}
              {data.length === 0 && <TableRow>
                  <TableCell colSpan={allColumns.length} align="center">
                    <div className="py-12 text-center text-gray-500">
                      <p className="text-lg">No data found</p>
                      <p className="text-sm">No records available for display</p>
                    </div>
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={rowsPerPageOptions} component="div" count={totalCount} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Paper>
    </div>;
}