import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { AccessControl } from '@/utils/permissions';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  School,
  ClipboardList,
  BarChart3,
  Settings,
  User,
  Building2,
  QrCode,
  X,
  Award,
  Video,
  LogOut,
  Menu,
  FileText,
  ArrowLeft,
  Notebook,
  Images,
  Palette,
  CreditCard,
  Camera,
  AlertCircle,
  Truck,
  ImageIcon,
  IdCard,
  MessageSquare,
  Wifi
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ isOpen, onClose, currentPage, onPageChange }: SidebarProps) => {
  const { user, selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization, selectedTransport, logout, setSelectedInstitute, setSelectedClass, setSelectedSubject, setSelectedChild, setSelectedOrganization, setSelectedTransport } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  // Institute-specific role
  const userRole = useInstituteRole();

  // Get menu items based on current selection state
  const getMenuItems = () => {
    // Special handling for child selection (Parent viewing child's data)
    if (selectedChild) {
      return [
        {
          id: 'child-attendance',
          label: 'Transport Attendance',
          icon: Truck,
          permission: 'view-dashboard',
          alwaysShow: true
        }
      ];
    }

    // Special handling for organization selection
    if (selectedOrganization) {
      return [
        {
          id: 'organizations',
          label: 'Select Organizations',
          icon: Building2,
          permission: 'view-organizations',
          alwaysShow: true
        },
        {
          id: 'organization-gallery',
          label: 'Gallery',
          icon: Camera,
          permission: 'view-organizations',
          alwaysShow: true
        },
        {
          id: 'organization-courses', 
          label: 'Courses',
          icon: BookOpen,
          permission: 'view-organizations',
          alwaysShow: true
        }
      ];
    }

    // Special handling for Student role
    if (userRole === 'Student') {
      // 1. Student without institute - only show basic options + payment
      if (!selectedInstitute) {
        return [
          {
            id: 'dashboard',
            label: 'Select Institutes',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'organizations',
            label: 'Organizations',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          },
          {
            id: 'transport',
            label: 'Transport',
            icon: Truck,
            permission: 'view-dashboard',
            alwaysShow: true
          }
        ];
      }

      // 2. Student with institute selected - show basic navigation (Enroll Class removed - moved to ClassSelector)
      if (selectedInstitute && !selectedClass) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'my-attendance',
            label: 'My Attendance',
            icon: UserCheck,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'institute-lectures',
            label: 'Institute Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          }
        ];
      }

      // 3. Student with institute and class selected (but no subject) - remove enroll options
      if (selectedInstitute && selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'my-attendance',
            label: 'My Attendance',
            icon: UserCheck,
            permission: 'view-dashboard',
            alwaysShow: false
          }
        ];
      }

      // 4. Student with institute, class, and subject all selected - show subject-specific navigation
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'my-attendance',
            label: 'My Attendance',
            icon: UserCheck,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'lectures',
            label: 'Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'free-lectures',
            label: 'Free Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'homework',
            label: 'Homework',
            icon: Notebook,
            permission: 'view-homework',
            alwaysShow: false
          },
          {
            id: 'exams',
            label: 'Exams',
            icon: Award,
            permission: 'view-exams',
            alwaysShow: false
          },
          {
            id: 'subject-payments',
            label: 'Subject Payments',
            icon: CreditCard,
            permission: 'view-payments',
            alwaysShow: false
          },
          {
            id: 'subject-submissions',
            label: 'Subject Submissions',
            icon: FileText,
            permission: 'view-submissions',
            alwaysShow: false
          },
          {
            id: 'homework-submissions',
            label: 'Homework Submissions',
            icon: Notebook,
            permission: 'view-homework',
            alwaysShow: false
          }
         ];
      }
      // Return empty for any other Student states
      return [];
    }

    // Special handling for Teacher role
    if (userRole === 'Teacher') {
      // 1. Teacher without institute - only show basic options + payment
      if (!selectedInstitute) {
        return [
          {
            id: 'dashboard',
            label: 'Select Institutes',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'organizations',
            label: 'Organizations',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          }
        ];
      }

      // 2. Teacher with institute selected (but no class/subject)
      if (selectedInstitute && !selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'organizations',
            label: 'Organizations',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          },
          {
            id: 'subjects',
            label: 'All Subjects',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false,
            section: 'Main\'s'
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'institute-lectures',
            label: 'Institute Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          }
        ];
      }

      // 3. Teacher with institute and class selected (but no subject)
      if (selectedInstitute && selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            permission: 'view-students',
            alwaysShow: false
          },
        ];
      }

      // 4. Teacher with institute, class, and subject all selected
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'subject-payments',
            label: 'Subject Payments',
            icon: CreditCard,
            permission: 'view-payments',
            alwaysShow: false
          }
        ];
      }
      // Return empty for any other Teacher states
      return [];
    }

    // Special handling for InstituteAdmin role
    if (userRole === 'InstituteAdmin') {
      if (!selectedInstitute) {
        return [
          {
            id: 'dashboard',
            label: 'Select Institutes',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'organizations',
            label: 'Organizations',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          }
        ];
      }

      // If only institute is selected
      if (selectedInstitute && !selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'institute-organizations',
            label: 'Organization',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          },
          {
            id: 'institute-users',
            label: 'Institute Users',
            icon: Users,
            permission: 'view-users',
            alwaysShow: false
          },
          {
            id: 'verify-image',
            label: 'Verify Image',
            icon: ImageIcon,
            permission: 'view-users',
            alwaysShow: false
          },
          {
            id: 'parents',
            label: 'Parents',
            icon: Users,
            permission: 'view-parents',
            alwaysShow: false
          },
          {
            id: 'classes',
            label: 'All Classes',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'subjects',
            label: 'All Subjects',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          }
        ];
      }

      // If institute and class are selected (but not subject)
      if (selectedInstitute && selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'institute-organizations',
            label: 'Organization',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          },
          {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'classes',
            label: 'All Classes',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'subjects',
            label: 'All Subjects',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          }
        ];
      }

      // If institute, class, and subject are all selected
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'institute-organizations',
            label: 'Organization',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          },
          {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'classes',
            label: 'All Classes',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'subjects',
            label: 'All Subjects',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'subject-payments',
            label: 'Subject Payments',
            icon: CreditCard,
            permission: 'view-payments',
            alwaysShow: false
          }
        ];
      }
      // Return empty for any other InstituteAdmin states
      return [];
    }

    // Special handling for Parent role
    if (userRole === 'Parent') {
      // 1. Parent without institute - show My Children option before institute selection
      if (!selectedInstitute) {
        return [
          {
            id: 'my-children',
            label: 'My Children',
            icon: Users,
            permission: 'view-parents',
            alwaysShow: true
          },
          {
            id: 'dashboard',
            label: 'Select Institutes',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'transport',
            label: 'Transport',
            icon: Truck,
            permission: 'view-transport',
            alwaysShow: true,
            subItems: [
              {
                id: 'transport',
                label: 'My Transport',
                icon: Truck,
                permission: 'view-transport',
                alwaysShow: false
              },
              {
                id: 'transport-attendance',
                label: 'Transport Attendance',
                icon: UserCheck,
                permission: 'view-transport',
                alwaysShow: false
              }
            ]
          }
        ];
      }

      // 2. Parent without child selected - show Dashboard and Select Child
      if (!selectedChild) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'parents',
            label: 'Select Child',
            icon: Users,
            permission: 'view-parents',
            alwaysShow: false
          },
          {
            id: 'transport',
            label: 'Transport',
            icon: Truck,
            permission: 'view-transport',
            alwaysShow: true,
            subItems: [
              {
                id: 'transport',
                label: 'My Transport',
                icon: Truck,
                permission: 'view-transport',
                alwaysShow: false
              },
              {
                id: 'transport-attendance',
                label: 'Transport Attendance',
                icon: UserCheck,
                permission: 'view-transport',
                alwaysShow: false
              }
            ]
          }
        ];
      }

      // 2. Parent with child selected - show main sections without institute navigation
      if (selectedChild) {
        return [
          {
            id: 'child-attendance',
            label: 'Transport Attendance',
            icon: Truck,
            permission: 'view-dashboard',
            alwaysShow: true
          }
        ];
      }

      return [];
    }

    // Special handling for AttendanceMarker role - only show specific items when institute is selected
    if (userRole === 'AttendanceMarker') {
      if (!selectedInstitute) {
        return [
          {
            id: 'dashboard',
            label: 'Select Institutes',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'transport',
            label: 'Transport',
            icon: Truck,
            permission: 'view-transport',
            alwaysShow: true,
            subItems: [
              {
                id: 'transport',
                label: 'My Transport',
                icon: Truck,
                permission: 'view-transport',
                alwaysShow: false
              },
              {
                id: 'transport-attendance',
                label: 'Transport Attendance',
                icon: UserCheck,
                permission: 'view-transport',
                alwaysShow: false
              }
            ]
          }
        ];
      }

      // For AttendanceMarker with institute selected - remove attendance sections
      const baseItems = [
        {
          id: 'select-class',
          label: 'Select Class',
          icon: School,
          permission: 'view-classes',
          alwaysShow: false
        },
        {
          id: 'select-subject',
          label: 'Select Subject',
          icon: BookOpen,
          permission: 'view-subjects',
          alwaysShow: false
        }
      ];
      
      // Add Free Lectures if subject is selected
      if (selectedSubject) {
        baseItems.push({
          id: 'free-lectures',
          label: 'Free Lectures',
          icon: Video,
          permission: 'view-lectures',
          alwaysShow: false
        });
      }
      
      return baseItems;
    }

    // Base items that are always available for all other users (User role, SystemAdmin, etc.)
    const baseItems = [
      {
        id: 'dashboard',
        label: selectedInstitute ? 'Dashboard' : 'Select Institutes',
        icon: LayoutDashboard,
        permission: 'view-dashboard',
        alwaysShow: false
      },
      {
        id: 'organizations',
        label: 'Organizations',
        icon: Building2,
        permission: 'view-organizations',
        alwaysShow: true // Always show organizations for all users
      }
    ];

    // If no institute is selected, return basic navigation including organizations and transport
    if (!selectedInstitute) {
      return [
        ...baseItems,
        {
          id: 'transport',
          label: 'Transport',
          icon: Truck,
          permission: 'view-transport',
          alwaysShow: true,
          subItems: [
            {
              id: 'transport',
              label: 'My Transport',
              icon: Truck,
              permission: 'view-transport',
              alwaysShow: false
            },
            {
              id: 'transport-attendance',
              label: 'Transport Attendance',
              icon: UserCheck,
              permission: 'view-transport',
              alwaysShow: false
            }
          ]
        }
      ];
    }

    // For other roles (SystemAdmin, etc.) with institute selected, show full navigation
    return [
      ...baseItems,
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        permission: 'view-users',
        alwaysShow: false
      },
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        permission: 'view-students',
        alwaysShow: false
      },
      {
        id: 'parents',
        label: 'Parents',
        icon: Users,
        permission: 'view-parents',
        alwaysShow: false
      },
      // Remove teachers section for SystemAdmin
      ...(user?.role !== 'SystemAdmin' ? [{
        id: 'teachers',
        label: 'Teachers',
        icon: UserCheck,
        permission: 'view-teachers',
        alwaysShow: false
      }] : []),
      {
        id: 'classes',
        label: 'All Classes',
        icon: School,
        permission: 'view-classes',
        alwaysShow: false
      },
      {
        id: 'subjects',
        label: 'All Subjects',
        icon: BookOpen,
        permission: 'view-subjects',
        alwaysShow: false
      },
      // Only show selection options for non-SystemAdmin users
      ...(user?.role !== 'SystemAdmin' ? [
        {
          id: 'select-class',
          label: 'Select Class',
          icon: School,
          permission: 'view-classes',
          alwaysShow: false
        },
        {
          id: 'select-subject',
          label: 'Select Subject',
          icon: BookOpen,
          permission: 'view-subjects',
          alwaysShow: false
        }
      ] : []),
      {
        id: 'institutes',
        label: 'Institutes',
        icon: Building2,
        permission: 'view-institutes',
        alwaysShow: false
      }
    ];
  };

  const getAttendanceItems = () => {
    // For Student - no additional attendance items needed as they are in main menu
    if (userRole === 'Student') {
      return [];
    }

    // For Teacher - show specific attendance items based on selection state
    if (userRole === 'Teacher') {
      // 3. Teacher with institute and class selected (but no subject)
      if (selectedInstitute && selectedClass && !selectedSubject) {
        return [
          {
            id: 'daily-attendance',
            label: 'Daily Attendance',
            icon: UserCheck,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'qr-attendance',
            label: 'QR Attendance',
            icon: QrCode,
            permission: 'mark-attendance',
            alwaysShow: false
          },
          ...(selectedInstitute && ['InstituteAdmin', 'AttendanceMarker', 'Teacher'].includes(userRole) ? [{
            id: 'institute-mark-attendance',
            label: 'Institute Mark Attendance',
            icon: Wifi,
            permission: 'mark-attendance',
            alwaysShow: false
          }] : [])
        ];
      }

      // 4. Teacher with institute, class, and subject all selected
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'daily-attendance',
            label: 'Daily Attendance',
            icon: UserCheck,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'qr-attendance',
            label: 'QR Attendance',
            icon: QrCode,
            permission: 'mark-attendance',
            alwaysShow: false
          },
          ...(selectedInstitute && ['InstituteAdmin', 'AttendanceMarker', 'Teacher'].includes(userRole) ? [{
            id: 'institute-mark-attendance',
            label: 'Institute Mark Attendance',
            icon: Wifi,
            permission: 'mark-attendance',
            alwaysShow: false
          }] : [])
        ];
      }

      // For other teacher states, no attendance items
      return [];
    }

    // For InstituteAdmin - show specific attendance items based on selection
    if (userRole === 'InstituteAdmin') {
      if (!selectedInstitute) {
        return [];
      }

      // For InstituteAdmin with only institute selected
      if (selectedInstitute && !selectedClass && !selectedSubject) {
        return [
          {
            id: 'daily-attendance',
            label: 'Daily Attendance',
            icon: UserCheck,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'qr-attendance',
            label: 'QR Attendance',
            icon: QrCode,
            permission: 'mark-attendance',
            alwaysShow: false
          },
          ...(selectedInstitute && ['InstituteAdmin', 'AttendanceMarker', 'Teacher'].includes(userRole) ? [{
            id: 'institute-mark-attendance',
            label: 'Institute Mark Attendance',
            icon: Wifi,
            permission: 'mark-attendance',
            alwaysShow: false
          }] : [])
        ];
      }

      // For InstituteAdmin with institute and class selected (or all three selected)
      if (selectedInstitute && selectedClass) {
        return [
          {
            id: 'daily-attendance',
            label: 'Daily Attendance',
            icon: UserCheck,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'qr-attendance',
            label: 'QR Attendance',
            icon: QrCode,
            permission: 'mark-attendance',
            alwaysShow: false
          },
          ...(selectedInstitute && ['InstituteAdmin', 'AttendanceMarker', 'Teacher'].includes(userRole) ? [{
            id: 'institute-mark-attendance',
            label: 'Institute Mark Attendance',
            icon: Wifi,
            permission: 'mark-attendance',
            alwaysShow: false
          }] : [])
        ];
      }
    }

    // Default attendance items for other roles
    const attendanceItems = [
      {
        id: 'daily-attendance',
        label: 'Daily Attendance',
        icon: UserCheck,
        permission: 'view-attendance',
        alwaysShow: false
      },
      {
        id: 'attendance-markers',
        label: 'Attendance Markers',
        icon: Users,
        permission: 'manage-attendance-markers',
        alwaysShow: false
      },
      {
        id: 'qr-attendance',
        label: 'QR Attendance',
        icon: QrCode,
        permission: 'mark-attendance',
        alwaysShow: userRole === 'AttendanceMarker' // Always show for AttendanceMarker
      },
      ...(selectedInstitute && ['InstituteAdmin', 'AttendanceMarker', 'Teacher'].includes(userRole) ? [{
        id: 'institute-mark-attendance',
        label: 'Institute Mark Attendance',
        icon: Wifi,
        permission: 'mark-attendance',
        alwaysShow: false
      }] : [])
    ];

    return attendanceItems;
  };

  const getSystemItems = () => {
    // For Student - no additional system items needed as they are in main menu
    if (userRole === 'Student') {
      return [];
    }

    // For Teacher - show academic items only when institute, class, and subject are all selected
    if (userRole === 'Teacher') {
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'lectures',
            label: 'Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'free-lectures',
            label: 'Free Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'homework',
            label: 'Homework',
            icon: Notebook,
            permission: 'view-homework',
            alwaysShow: false
          },
          {
            id: 'exams',
            label: 'Exams',
            icon: FileText,
            permission: 'view-exams',
            alwaysShow: false
          }
        ];
      }
      
      // For other teacher selection states, return empty array
      return [];
    }

    // For InstituteAdmin - show academic items when institute, class, and subject are all selected
    if (userRole === 'InstituteAdmin') {
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'lectures',
            label: 'Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'free-lectures',
            label: 'Free Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'homework',
            label: 'Homework',
            icon: Notebook,
            permission: 'view-homework',
            alwaysShow: false
          },
          {
            id: 'exams',
            label: 'Exams',
            icon: FileText,
            permission: 'view-exams',
            alwaysShow: false
          }
        ];
      }
      
      // For other InstituteAdmin selection states, return empty array
      return [];
    }

    // Default system items for other roles
    const systemItems = [
      {
        id: 'grading',
        label: 'Grading',
        icon: BarChart3,
        permission: 'view-grading',
        alwaysShow: false
      },
      {
        id: 'live-lectures',
        label: 'Live Lectures',
        icon: Video,
        permission: 'view-lectures',
        alwaysShow: false
      },
      {
        id: 'homework',
        label: 'Homework',
        icon: Notebook,
        permission: 'view-homework',
        alwaysShow: false
      },
      {
        id: 'exams',
        label: 'Exams',
        icon: FileText,
        permission: 'view-exams',
        alwaysShow: false
      }
    ];

    return systemItems;
  };

  const getMyChildrenItems = () => {
    // Show "My Children" section when no institute is selected for Parent and User roles
    const userType = user?.userType?.toLowerCase();
    if (!selectedInstitute && (userType === 'parent' || userType === 'user')) {
      return [
        {
          id: 'my-children',
          label: 'My Children',
          icon: Users,
          permission: 'view-profile',
          alwaysShow: true
        }
      ];
    }
    return [];
  };

  const getChildItems = () => {
    // Show child-specific navigation when a child is selected
    if (!selectedChild) {
      return [];
    }

    const childId = selectedChild.id;
    
    return [
      {
        id: 'child/:childId/results',
        label: 'Results',
        icon: Award,
        permission: 'view-profile',
        alwaysShow: true,
        path: `/child/${childId}/results`
      },
      {
        id: 'child/:childId/attendance',
        label: 'Attendance',
        icon: UserCheck,
        permission: 'view-profile',
        alwaysShow: true,
        path: `/child/${childId}/attendance`
      },
      {
        id: 'child/:childId/transport',
        label: 'Transport',
        icon: Truck,
        permission: 'view-profile',
        alwaysShow: true,
        path: `/child/${childId}/transport`
      }
    ];
  };

  const getSystemPaymentItems = () => {
    // Show "System Payments" section when no institute is selected
    if (!selectedInstitute) {
      return [
        {
          id: 'system-payment',
          label: 'System Payments',
          icon: CreditCard,
          permission: 'view-profile',
          alwaysShow: true
        }
      ];
    }
    return [];
  };

  const getPaymentItems = () => {
    // Only show payment sections for InstituteAdmin, Teacher, Student
    if (!['InstituteAdmin', 'Teacher', 'Student'].includes(userRole)) {
      return [];
    }

    const paymentItems = [];

    // 1. When only institute is selected - show Institute Payments for all three roles
    // + My Submissions for Students only
    if (selectedInstitute && !selectedClass && !selectedSubject) {
      paymentItems.push({
        id: 'institute-payments',
        label: 'Institute Payments',
        icon: CreditCard,
        permission: 'view-profile',
        alwaysShow: false
      });

      // Add My Submissions for Students only when only institute is selected

      // Add My Submissions for Students only when only institute is selected
      if (userRole === 'Student') {
        paymentItems.push({
          id: 'my-submissions',
          label: 'My Submissions',
          icon: FileText,
          permission: 'view-profile',
          alwaysShow: false
        });
      }
    }

    // 2. When institute and class selected (but no subject) - no payment items

    // 3. When institute, class, and subject are all selected - show Subject Payments only
    if (selectedInstitute && selectedClass && selectedSubject) {
      paymentItems.push({
        id: 'subject-payments',
        label: 'Subject Payments',
        icon: CreditCard,
        permission: 'view-profile',
        alwaysShow: false
      });

      // 4. Add Subject Pay Submission for Students only when all three are selected
      if (userRole === 'Student') {
        paymentItems.push({
          id: 'subject-pay-submission',
          label: 'Subject Pay Submission',
          icon: FileText,
          permission: 'view-profile',
          alwaysShow: false
        });
      }
    }

    return paymentItems;
  };

  const getSmsItems = () => {
    const items: any[] = [];
    if (userRole === 'InstituteAdmin' && selectedInstitute) {
      items.push({
        id: 'sms',
        label: 'SMS',
        icon: MessageSquare,
        permission: 'manage-sms',
        alwaysShow: true
      });
      items.push({
        id: 'sms-history',
        label: 'SMS History',
        icon: MessageSquare,
        permission: 'manage-sms',
        alwaysShow: true
      });
    }
    return items;
  };

  const getSettingsItems = () => {
    // If organization is selected, only show Profile and Appearance
    if (selectedOrganization) {
      return [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];
    }

    // For Parent - show specific settings items based on child selection
    if (userRole === 'Parent') {
      const baseItems = [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];

      // Add System Payment only when child is selected
      if (selectedChild) {
        baseItems.push({
          id: 'system-payment',
          label: 'System Payment',
          icon: CreditCard,
          permission: 'view-profile',
          alwaysShow: false
        });
      }

      return baseItems;
    }

    // For Student - always show Profile and Appearance + Payment if no institute
    if (userRole === 'Student') {
      const baseItems = [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];

      // Add Institute Profile when institute is selected
      if (selectedInstitute) {
        baseItems.push({
          id: 'institute-profile',
          label: 'Institute Profile',
          icon: IdCard,
          permission: 'view-profile',
          alwaysShow: false
        });
      }

      // Add System Payment only when no institute is selected
      if (!selectedInstitute) {
        baseItems.push({
          id: 'system-payment',
          label: 'System Payment',
          icon: CreditCard,
          permission: 'view-profile', // Using existing permission
          alwaysShow: false
        });
      }

      return baseItems;
    }

    // For Teacher - show specific settings items based on selection state + Payment if no institute
    if (userRole === 'Teacher') {
      const baseItems = [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];

      // Add Institute Profile when institute is selected
      if (selectedInstitute) {
        baseItems.push({
          id: 'institute-profile',
          label: 'Institute Profile',
          icon: IdCard,
          permission: 'view-profile',
          alwaysShow: false
        });
      }

      // Add System Payment only when no institute is selected
      if (!selectedInstitute) {
        baseItems.push({
          id: 'system-payment',
          label: 'System Payment',
          icon: CreditCard,
          permission: 'view-profile', // Using existing permission
          alwaysShow: false
        });
      }

      return baseItems;
    }

    // For InstituteAdmin - show specific settings items + Payment if no institute
    if (userRole === 'InstituteAdmin') {
      const baseItems = [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];

      // Add System Payment only when no institute is selected
      if (!selectedInstitute) {
        baseItems.push({
          id: 'system-payment',
          label: 'System Payment',
          icon: CreditCard,
          permission: 'view-profile', // Using existing permission
          alwaysShow: false
        });
      } else {
        // Add Institute Profile and Institute Details when institute is selected
        baseItems.push({
          id: 'institute-profile',
          label: 'Institute Profile',
          icon: IdCard,
          permission: 'view-profile',
          alwaysShow: false
        });
        baseItems.push({
          id: 'institute-details',
          label: 'Institute Details',
          icon: Building2,
          permission: 'view-institute-details',
          alwaysShow: false
        });
      }

      return baseItems;
    }

    // Default settings items for other roles (including AttendanceMarker)
    const settingsItems = [
      {
        id: 'profile',
        label: 'Profile',
        icon: User,
        permission: 'view-profile',
        alwaysShow: false
      },
      {
        id: 'appearance',
        label: 'Appearance',
        icon: Palette,
        permission: 'view-appearance',
        alwaysShow: false
      },
      ...(selectedInstitute ? [{
        id: 'institute-profile',
        label: 'Institute Profile',
        icon: Building2,
        permission: 'view-profile',
        alwaysShow: false
      }] : []),
      ...(selectedInstitute ? [{
        id: 'institute-details',
        label: 'Institute Details',
        icon: Building2,
        permission: 'view-institute-details',
        alwaysShow: false
      }] : []),
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        permission: 'view-settings',
        alwaysShow: false
      }
    ];

    return settingsItems;
  };

  const menuItems = getMenuItems();
  const attendanceItems = getAttendanceItems();
  const systemItems = getSystemItems();
  const myChildrenItems = getMyChildrenItems();
  const childItems = getChildItems();
  const systemPaymentItems = getSystemPaymentItems();
  const paymentItems = getPaymentItems();
  const smsItems = getSmsItems();
  const settingsItems = getSettingsItems();

  // Ensure the active page is always visible in the sidebar even if hidden by selection rules
  const menuItemsDisplay = [...menuItems];
  const attendanceItemsDisplay = [...attendanceItems];
  const systemItemsDisplay = [...systemItems];
  const myChildrenItemsDisplay = [...myChildrenItems];
  const childItemsDisplay = [...childItems];
  const systemPaymentItemsDisplay = [...systemPaymentItems];
  const paymentItemsDisplay = [...paymentItems];
  const smsItemsDisplay = [...(smsItems || [])];
  const settingsItemsDisplay = [...settingsItems];

  const activeExists = [
    menuItemsDisplay,
    attendanceItemsDisplay,
    systemItemsDisplay,
    myChildrenItemsDisplay,
    childItemsDisplay,
    systemPaymentItemsDisplay,
    paymentItemsDisplay,
    smsItemsDisplay,
    settingsItemsDisplay
  ].some(list => list.some(i => i.id === currentPage));

  if (!activeExists && currentPage) {
    const toTitle = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const label = toTitle(currentPage);

    let target = menuItemsDisplay as any[];
    let icon: any = LayoutDashboard;
    let allowPush = true;

    // Institute-specific pages that require institute selection
    const instituteSpecificPages = /^(classes|subjects|students|teachers|users|parents|institutes|daily-attendance|qr-attendance|live-lectures|grading|exams|homework|results|lectures|free-lectures|institute-details|institute-users|verify-image|select-class|select-subject|unverified-students)$/i;
    
    // Don't show institute-specific pages in sidebar when no institute is selected
    if (!selectedInstitute && instituteSpecificPages.test(currentPage)) {
      allowPush = false;
    }

    if (/payment/i.test(currentPage)) { target = paymentItemsDisplay; icon = CreditCard; }
    else if (/sms/i.test(currentPage)) {
      if (selectedInstitute) { target = smsItemsDisplay; icon = MessageSquare; }
      else { allowPush = false; }
    }
    else if (/attendance/i.test(currentPage)) { target = attendanceItemsDisplay; icon = UserCheck; }
    else if (/(lecture|homework|exam|result|grading)/i.test(currentPage)) { target = systemItemsDisplay; icon = Video; }
    else if (/(profile|settings|appearance)/i.test(currentPage)) { target = settingsItemsDisplay; icon = Settings; }

    if (allowPush) {
      target.push({ id: currentPage, label, icon, permission: 'view-dashboard', alwaysShow: true });
    }
  }

  const filterItemsByPermission = (items: any[]) => {
    return items.filter(item => {
      // Always show items marked as alwaysShow
      if (item.alwaysShow) {
        return true;
      }
      // Otherwise check permission
      return AccessControl.hasPermission(userRole as any, item.permission);
    });
  };

  const handleItemClick = (itemId: string) => {
    console.log('Sidebar item clicked:', itemId);
    
    // Helper function for Router-agnostic navigation
    const navigateToRoute = (route: string) => {
      try {
        window.history.pushState({}, '', route);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (e) {
        window.location.assign(route);
      }
    };
    
    // Handle System Payment click - navigate to payments page
    if (itemId === 'system-payment') {
      navigateToRoute('/payments');
      onPageChange('payments');
      onClose();
      return;
    }
    
    // Handle Institute Payments click
    if (itemId === 'institute-payments') {
      navigateToRoute('/institute-payments');
      onPageChange('institute-payments');
      onClose();
      return;
    }

    // Handle Institute Organizations click
    if (itemId === 'institute-organizations') {
      navigateToRoute('/institute-organizations');
      onPageChange('institute-organizations');
      onClose();
      return;
    }
    
    // Handle Subject Payments click
    if (itemId === 'subject-payments') {
      navigateToRoute('/subject-payments');
      onPageChange('subject-payments');
      onClose();
      return;
    }
    
    // Handle Subject Submissions click (for Students only)
    if (itemId === 'subject-submissions') {
      navigateToRoute('/subject-submissions');
      onPageChange('subject-submissions');
      onClose();
      return;
    }
    
    // Handle My Submissions click (for Students only)
    if (itemId === 'my-submissions') {
      navigateToRoute('/my-submissions');
      onPageChange('my-submissions');
      onClose();
      return;
    }
    
    // Handle Subject Pay Submission click (for Students only)
    if (itemId === 'subject-pay-submission') {
      navigateToRoute('/subject-pay-submission');
      onPageChange('subject-pay-submission');
      onClose();
      return;
    }
    
    // Handle SMS click
    if (itemId === 'sms') {
      navigateToRoute('/sms');
      onPageChange('sms');
      onClose();
      return;
    }

    // Handle SMS History click
    if (itemId === 'sms-history') {
      navigateToRoute('/sms-history');
      onPageChange('sms-history');
      onClose();
      return;
    }

    // Handle QR Attendance click
    if (itemId === 'qr-attendance') {
      navigateToRoute('/qr-attendance');
      onPageChange('qr-attendance');
      onClose();
      return;
    }

    // Handle Institute Mark Attendance click
    if (itemId === 'institute-mark-attendance') {
      navigateToRoute('/institute-mark-attendance');
      onPageChange('institute-mark-attendance');
      onClose();
      return;
    }

    // Handle Daily Attendance click
    if (itemId === 'daily-attendance') {
      navigateToRoute('/daily-attendance');
      onPageChange('daily-attendance');
      onClose();
      return;
    }

    // Handle My Children click
    if (itemId === 'my-children') {
      // Clear child selection and go back to children selector
      setSelectedChild(null);
      navigateToRoute('/my-children');
      onPageChange('my-children');
      onClose();
      return;
    }

    // Handle child-results, child-attendance, child-transport clicks (keep child selected)
    if (itemId === 'child-results' || itemId === 'child-attendance' || itemId === 'child-transport') {
      onPageChange(itemId);
      onClose();
      return;
    }

    // Handle child-specific navigation clicks
    if (itemId.startsWith('child/:childId/')) {
      // Find the item to get its path
      const childItem = childItemsDisplay.find(item => item.id === itemId);
      if (childItem && (childItem as any).path) {
        navigateToRoute((childItem as any).path);
        onPageChange(itemId);
        onClose();
        return;
      }
    }
    
    // Handle Enroll Class click (for Students only)
    if (itemId === 'enroll-class') {
      navigateToRoute('/enroll-class');
      onPageChange('enroll-class');
      onClose();
      return;
    }
    
    // Handle Enroll Subject click (for Students only) 
    if (itemId === 'enroll-subject') {
      navigateToRoute('/enroll-subject');
      onPageChange('enroll-subject');
      onClose();
      return;
    }
    
    onPageChange(itemId);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleBackNavigation = () => {
    if (selectedTransport) {
      // Go back from transport attendance to transport list
      setSelectedTransport(null);
      window.history.pushState({}, '', '/transport');
      window.dispatchEvent(new PopStateEvent('popstate'));
      onPageChange('transport');
    } else if (selectedOrganization) {
      // Go back from organization level to organization selection
      setSelectedOrganization(null);
    } else if (selectedChild) {
      // Go back from child level to children selection
      setSelectedChild(null);
    } else if (selectedSubject) {
      // Go back from subject level to class level
      setSelectedSubject(null);
    } else if (selectedClass) {
      // Go back from class level to institute level
      setSelectedClass(null);
    } else if (selectedInstitute) {
      // Go back from institute level to institute selection
      setSelectedInstitute(null);
    }
  };

  const SidebarSection = ({ title, items }: { title: string; items: any[] }) => {
    const filteredItems = filterItemsByPermission(items);
    
    if (filteredItems.length === 0) return null;

    return (
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {filteredItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'} h-9 sm:h-10 text-sm ${
                currentPage === item.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-r-2 border-blue-600' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleItemClick(item.id)}
            >
              <item.icon className={`${isCollapsed ? '' : 'mr-3'} h-4 w-4 flex-shrink-0`} />
              {!isCollapsed && item.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile & Tablet Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative
        ${isCollapsed ? 'w-16' : 'w-72 sm:w-80 lg:w-72'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-all duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
        overflow-hidden
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 min-w-0">
              {selectedInstitute?.logo ? (
                <img 
                  src={selectedInstitute.logo} 
                  alt="Institute logo"
                  className="h-8 w-8 object-contain rounded flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <School className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
              )}
              <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                {selectedInstitute?.shortName || 'SurakshaLMS'}
              </span>
            </div>
          )}
          <div className={`flex items-center space-x-1 ${isCollapsed ? 'w-full justify-center' : ''}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onClose();
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <X className="h-4 w-4 lg:hidden" />
              <Menu className="h-4 w-4 hidden lg:block" />
            </Button>
          </div>
        </div>

        {/* Context Info - Child-only on child routes, otherwise full context like before */}
        {currentPage.startsWith('child/:childId/') && selectedChild ? (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Current Selection</span>
              <Button variant="ghost" size="sm" onClick={handleBackNavigation} className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800" aria-label="Go Back">
                <ArrowLeft className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1 text-xs">
              <div className="text-blue-600 dark:text-blue-400">
                <span className="font-medium">Child:</span>
                <span className="ml-1 truncate">{(selectedChild as any).name || (selectedChild?.user ? `${selectedChild.user.firstName} ${selectedChild.user.lastName}` : 'Unknown Child')}</span>
              </div>
            </div>
          </div>
        ) : (
          user?.role !== 'SystemAdmin' && (selectedInstitute || selectedClass || selectedSubject || selectedChild || selectedOrganization || selectedTransport) && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Current Selection</span>
                <Button variant="ghost" size="sm" onClick={handleBackNavigation} className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800" aria-label="Go Back">
                  <ArrowLeft className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1 text-xs">
                {selectedTransport && (
                  <div className="text-blue-600 dark:text-blue-400"><span className="font-medium">Transport:</span> <span className="ml-1 truncate">{selectedTransport.vehicleNumber}</span></div>
                )}
                {selectedOrganization && (
                  <div className="text-blue-600 dark:text-blue-400"><span className="font-medium">Organization:</span> <span className="ml-1 truncate">{selectedOrganization.name}</span></div>
                )}
                {selectedInstitute && (
                  <div className="text-blue-600 dark:text-blue-400"><span className="font-medium">Institute:</span> <span className="ml-1 truncate">{selectedInstitute.name}</span></div>
                )}
                {selectedClass && (
                  <div className="text-blue-600 dark:text-blue-400"><span className="font-medium">Class:</span> <span className="ml-1 truncate">{selectedClass.name}</span></div>
                )}
                {selectedSubject && (
                  <div className="text-blue-600 dark:text-blue-400"><span className="font-medium">Subject:</span> <span className="ml-1 truncate">{selectedSubject.name}</span></div>
                )}
                {selectedChild && (
                  <div className="text-blue-600 dark:text-blue-400"><span className="font-medium">Child:</span> <span className="ml-1 truncate">{(selectedChild as any).name || (selectedChild.user ? `${selectedChild.user.firstName} ${selectedChild.user.lastName}` : 'Unknown Child')}</span></div>
                )}
              </div>
            </div>
          )
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
          <div className="space-y-2">
            {selectedChild ? (
              <SidebarSection title="Child Sections" items={childItemsDisplay} />
            ) : currentPage === 'transport-attendance' ? (
              /* Show ONLY attendance section for transport attendance page */
              <SidebarSection title="Attendance" items={[
                {
                  id: 'transport-attendance',
                  label: 'Attendance',
                  icon: UserCheck,
                  permission: 'view-dashboard',
                  alwaysShow: true
                }
              ]} />
            ) : (
              <>
                {/* Show Main navigation items ONLY when institute is selected */}
                {selectedInstitute && (
                  <>
                    <SidebarSection title="Main" items={menuItemsDisplay.filter(item => !item.hasOwnProperty('section'))} />
                    
                    {/* Main's section for items with section property */}
                    {menuItemsDisplay.some(item => (item as any).section === "Main's") && (
                      <SidebarSection title="Main's" items={menuItemsDisplay.filter(item => (item as any).section === "Main's")} />
                    )}
                  </>
                )}
                
                {/* Show sections without "Main" label when no institute selected */}
                {!selectedInstitute && menuItemsDisplay.length > 0 && (
                  <SidebarSection title="Select Institute" items={menuItemsDisplay.filter(item => !item.hasOwnProperty('section'))} />
                )}
                
                {/* Show attendance section for Teacher based on selection state */}
                {userRole === 'Teacher' && attendanceItemsDisplay.length > 0 && (
                  <SidebarSection title="Attendance" items={attendanceItemsDisplay} />
                )}
                
                {/* Show attendance section when institute is selected for InstituteAdmin */}
                {userRole === 'InstituteAdmin' && selectedInstitute && (
                  <SidebarSection title="Attendance" items={attendanceItemsDisplay} />
                )}
                
                {/* For AttendanceMarker role, only show QR Attendance when institute is selected */}
                {userRole === 'AttendanceMarker' && selectedInstitute && (
                  <SidebarSection title="Attendance" items={attendanceItemsDisplay} />
                )}
                
                {/* For other roles, show attendance navigation based on role */}
                {userRole !== 'AttendanceMarker' && userRole !== 'InstituteAdmin' && userRole !== 'Teacher' && userRole !== 'Student' && selectedInstitute && (
                  <SidebarSection title="Attendance" items={attendanceItemsDisplay} />
                )}
                
                {/* Show academic items for Teacher only when institute, class and subject are all selected */}
                {userRole === 'Teacher' && systemItemsDisplay.length > 0 && (
                  <SidebarSection title="Academic" items={systemItemsDisplay} />
                )}
                
                {/* Show academic items for InstituteAdmin only when institute, class and subject are all selected */}
                {userRole === 'InstituteAdmin' && selectedInstitute && selectedClass && selectedSubject && (
                  <SidebarSection title="Academic" items={systemItemsDisplay} />
                )}
                
                {/* Show full academic section for other roles (excluding Student) */}
                {selectedInstitute && userRole !== 'AttendanceMarker' && userRole !== 'InstituteAdmin' && userRole !== 'Teacher' && userRole !== 'Student' && (
                  <SidebarSection title="Academic" items={systemItemsDisplay} />
                )}
                
                {/* Show My Children section before institute selection for Parents */}
                {myChildrenItemsDisplay.length > 0 && (
                  <SidebarSection title="My Children" items={myChildrenItemsDisplay} />
                )}
                
                {/* Show Child specific navigation when child is selected */}
                {childItemsDisplay.length > 0 && (
                  <SidebarSection title="Child Sections" items={childItemsDisplay} />
                )}
                
                {/* Show System Payments section before institute selection */}
                {systemPaymentItemsDisplay.length > 0 && (
                  <SidebarSection title="System Payments" items={systemPaymentItemsDisplay} />
                )}
                
                {/* Show Payment section for specific user types based on new rules */}
                {paymentItemsDisplay.length > 0 && (
                  <SidebarSection title="Payments" items={paymentItemsDisplay} />
                )}
                
                {smsItemsDisplay.length > 0 && (
                  <SidebarSection title="SMS" items={smsItemsDisplay} />
                )}
                
                <SidebarSection title="Settings" items={settingsItemsDisplay} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
              <div className="truncate">
                <span>Logged in as:</span> 
                <span className="font-medium ml-1">{user?.name}</span>
              </div>
              <div>
                <span>Role:</span> 
                <span className="font-medium ml-1">{userRole}</span>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'} text-sm hover:bg-gray-100 dark:hover:bg-gray-700 h-8 sm:h-9`}
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            {!isCollapsed && <span className="text-xs sm:text-sm">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
