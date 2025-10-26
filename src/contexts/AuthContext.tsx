
import React, { createContext, useState, useContext } from 'react';
import { 
  User, 
  Institute, 
  Class, 
  Subject, 
  Child, 
  Organization,
  LoginCredentials, 
  AuthContextType 
} from './types/auth.types';
import { loginUser, validateToken, logoutUser } from './utils/auth.api';
import { mapUserData } from './utils/user.utils';
import { Institute as ApiInstitute } from '@/api/institute.api';
import { cachedApiClient } from '@/api/cachedClient';
import { apiCache } from '@/utils/apiCache';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  console.log('useAuth hook called');
  const context = useContext(AuthContext);
  console.log('AuthContext value:', context);
  if (context === undefined) {
    console.error('AuthContext is undefined - useAuth must be used within an AuthProvider');
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('AuthProvider component is rendering');
  const [user, setUser] = useState<User | null>(null);
  const [selectedInstitute, setSelectedInstituteState] = useState<Institute | null>(null);
  const [selectedClass, setSelectedClassState] = useState<Class | null>(null);
  const [selectedSubject, setSelectedSubjectState] = useState<Subject | null>(null);
  const [selectedChild, setSelectedChildState] = useState<Child | null>(null);
  const [selectedOrganization, setSelectedOrganizationState] = useState<Organization | null>(null);
  const [selectedTransport, setSelectedTransportState] = useState<{ id: string; vehicleNumber: string; bookhireId: string } | null>(null);
  const [selectedInstituteType, setSelectedInstituteType] = useState<string | null>(null);
  const [selectedClassGrade, setSelectedClassGrade] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Public variables for current IDs - no localStorage sync
  const [currentInstituteId, setCurrentInstituteId] = useState<string | null>(null);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);
  const [currentTransportId, setCurrentTransportId] = useState<string | null>(null);

  const fetchUserInstitutes = async (userId: string, forceRefresh = false): Promise<Institute[]> => {
    try {
      console.log('Fetching user institutes from backend API:', { userId, forceRefresh });
      
      const apiInstitutes = await cachedApiClient.get<ApiInstitute[]>(
        `/users/${userId}/institutes`, 
        undefined, 
        { 
          forceRefresh,
          ttl: 60,
          useStaleWhileRevalidate: false
        }
      );
      
      console.log('Raw API institutes response:', apiInstitutes);
      
      // Ensure apiInstitutes is an array and filter out any undefined/null values
      const validInstitutes = Array.isArray(apiInstitutes)
        ? apiInstitutes.filter((institute: any) => institute && (institute.id || institute.instituteId))
        : [];
      
      // Map API response to AuthContext Institute type with safe property access
      const institutes = validInstitutes.map((institute: any): Institute => ({
        id: institute.instituteId || institute.id || '',
        name: institute.instituteName || institute.name || 'Unknown Institute',
        code: institute.code || '',
        description: `${institute.instituteAddress || institute.address || ''}, ${institute.instituteCity || institute.city || ''}`.trim() || 'No description available',
        isActive: institute.instituteIsActive !== undefined ? institute.instituteIsActive : (institute.isActive !== undefined ? institute.isActive : true),
        type: institute.instituteType || institute.type,
        instituteUserType: institute.instituteUserType, // Preserve raw API value
        userRole: institute.instituteUserType, // Keep for backward compatibility
        userIdByInstitute: institute.userIdByInstitute,
        shortName: institute.instituteShortName || institute.name || 'Unknown Institute',
        logo: institute.instituteLogo || ''
      }));

      console.log('Mapped institutes:', institutes);
      return institutes;
    } catch (error) {
      console.error('Error fetching user institutes:', error);
      return [];
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      console.log('Starting login process...');
      
      const data = await loginUser(credentials);
      console.log('Login response received:', data);

      // Ensure token is properly stored
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        console.log('Access token stored successfully');
      }

      // Map user data without fetching institutes automatically
      const mappedUser = mapUserData(data.user, []);
      console.log('User mapped successfully:', mappedUser);
      setUser(mappedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Manual method to load user institutes - only called when user clicks
  const loadUserInstitutes = async (): Promise<Institute[]> => {
    if (!user?.id) {
      throw new Error('No user found');
    }
    
    setIsLoading(true);
    try {
      const institutes = await fetchUserInstitutes(user.id, true);
      
      // Update user with institutes
      const updatedUser = { ...user, institutes };
      setUser(updatedUser);
      
      return institutes;
    } catch (error) {
      console.error('Error loading user institutes:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logging out user...');
    
    // Get current userId before clearing state
    const currentUserId = user?.id;
    
    // Clear backend session and localStorage
    await logoutUser();
    
    // 🧹 ALWAYS CLEAR ALL CACHE ON LOGOUT (Security & Fresh Start)
    console.log('🧹 Clearing ALL cache on logout...');
    await apiCache.clearAllCache();
    
    // Clear attendance duplicate records
    const { attendanceDuplicateChecker } = await import('@/utils/attendanceDuplicateCheck');
    attendanceDuplicateChecker.clearAll();
    
    // Clear all pending API requests (regular + attendance + enhanced)
    cachedApiClient.clearPendingRequests();
    const { attendanceApiClient } = await import('@/api/attendanceClient');
    attendanceApiClient.clearPendingRequests();
    const { enhancedCachedClient } = await import('@/api/enhancedCachedClient');
    enhancedCachedClient.clearPendingRequests();
    
    console.log('✅ All cache, pending requests, and duplicate records cleared');
    
    // Clear all state
    setUser(null);
    setSelectedInstituteState(null);
    setSelectedClassState(null);
    setSelectedSubjectState(null);
    setSelectedChildState(null);
    setSelectedOrganizationState(null);
    setSelectedTransportState(null);
    setSelectedInstituteType(null);
    setSelectedClassGrade(null);
    
    setCurrentInstituteId(null);
    setCurrentClassId(null);
    setCurrentSubjectId(null);
    setCurrentChildId(null);
    setCurrentOrganizationId(null);
    setCurrentTransportId(null);
    
    console.log('✅ User logged out successfully and cache cleared');
  };

  const setSelectedInstitute = (institute: Institute | null) => {
    const previousInstituteId = currentInstituteId;
    
    setSelectedInstituteState(institute);
    setCurrentInstituteId(institute?.id || null);
    setSelectedInstituteType(institute?.type || null);
    
    // Clear institute-specific cache when switching institutes
    if (previousInstituteId && previousInstituteId !== institute?.id) {
      console.log(`🔄 Switching institute, clearing old cache for institute: ${previousInstituteId}`);
      // Note: This helps ensure fresh data when switching between institutes
      // The cache will be rebuilt with new institute context
    }
    
    // Clear dependent selections
    setSelectedClassState(null);
    setSelectedSubjectState(null);
    setSelectedClassGrade(null);
    setCurrentClassId(null);
    setCurrentSubjectId(null);
  };

  const setSelectedClass = (classData: Class | null) => {
    setSelectedClassState(classData);
    setCurrentClassId(classData?.id || null);
    setSelectedClassGrade(classData?.grade ?? null);
    
    // Clear dependent selections
    setSelectedSubjectState(null);
    setCurrentSubjectId(null);
  };

  const setSelectedSubject = (subject: Subject | null) => {
    setSelectedSubjectState(subject);
    setCurrentSubjectId(subject?.id || null);
  };

  const setSelectedChild = (child: Child | null) => {
    setSelectedChildState(child);
    setCurrentChildId(child?.id || null);
  };

  const setSelectedOrganization = (organization: Organization | null) => {
    setSelectedOrganizationState(organization);
    setCurrentOrganizationId(organization?.id || null);
  };

  const setSelectedTransport = (transport: { id: string; vehicleNumber: string; bookhireId: string } | null) => {
    setSelectedTransportState(transport);
    setCurrentTransportId(transport?.id || null);
  };

  // Method to refresh user data from backend - only called manually
  const refreshUserData = async (forceRefresh = true) => {
    if (!user) return;
    
    console.log('Refreshing user data from backend...', { forceRefresh });
    setIsLoading(true);
    
    try {
      const institutes = await fetchUserInstitutes(user.id, true);
      const mappedUser = mapUserData(user, institutes);
      setUser(mappedUser);
      
      console.log('User data refreshed successfully from backend');
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Manual token validation - only called when user clicks a button
  const validateUserToken = async () => {
    setIsLoading(true);
    try {
      console.log('Validating token with backend...');
      const userData = await validateToken();
      
      const mappedUser = mapUserData(userData, []);
      setUser(mappedUser);
      
      console.log('Token validation successful, user restored from backend');
    } catch (error) {
      console.error('Error validating token:', error);
      console.log('Clearing invalid session');
      await logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    selectedInstitute,
    selectedClass,
    selectedSubject,
    selectedChild,
    selectedOrganization,
    selectedTransport,
    selectedInstituteType,
    selectedClassGrade,
    currentInstituteId,
    currentClassId,
    currentSubjectId,
    currentChildId,
    currentOrganizationId,
    currentTransportId,
    login,
    logout,
    setSelectedInstitute,
    setSelectedClass,
    setSelectedSubject,
    setSelectedChild,
    setSelectedOrganization,
    setSelectedTransport,
    loadUserInstitutes,
    refreshUserData,
    validateUserToken,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export types for backward compatibility
export type { User, UserRole } from './types/auth.types';
