
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Users, User, Calendar, Phone, Heart, AlertTriangle } from 'lucide-react';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface Child {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
}

interface ParentData {
  parentId: string;
  parentName: string;
  children: Child[];
}

const ParentChildrenSelector = () => {
  const { user, setSelectedChild } = useAuth();
  const { toast } = useToast();
  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');


  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return {};
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchParentChildren = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/parents/${user.id}/children`, {
        headers: getApiHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Parent children data:', data);
        setParentData(data);
      } else {
        throw new Error(`Failed to fetch children: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching parent children:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch children');
      toast({
        title: "Error",
        description: "Failed to load children information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParentChildren();
  }, [user?.id]);

  const handleChildSelect = (child: Child) => {
    console.log('Selected child:', child);
    const childForAuth = {
      id: child.id,
      name: child.name,
      relationship: child.relationship
    };
    setSelectedChild(childForAuth as any);
    
    // Navigate to child dashboard with actual child ID
    window.history.pushState({}, '', `/child/${child.id}/dashboard`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    toast({
      title: "Child Selected",
      description: `Now viewing ${child.name}'s information`,
    });
  };

  const getAllChildren = () => {
    if (!parentData) return [];
    return parentData.children;
  };

  const getRelationshipLabel = (child: Child) => {
    return child.relationship.charAt(0).toUpperCase() + child.relationship.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading children...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !parentData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Unable to Load Children
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'Failed to load children information'}
              </p>
              <Button onClick={fetchParentChildren}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allChildren = getAllChildren();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Select Your Child
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a child to view their academic information, attendance, and results.
        </p>
      </div>

      {/* Parent Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Parent Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-lg font-medium">{parentData.parentName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Parent ID: {parentData.parentId}</p>
          </div>
        </CardContent>
      </Card>

      {allChildren.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Children Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No children are currently associated with your account.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allChildren.map((child) => (
            <Card 
              key={child.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-800"
              onClick={() => handleChildSelect(child)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={`https://images.unsplash.com/photo-1535268647677-300dbf3d78d1`} 
                      alt={child.name}
                    />
                    <AvatarFallback className="text-lg">
                      {child.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {child.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Child ID: {child.id}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {getRelationshipLabel(child)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Phone: {child.phoneNumber}
                  </span>
                </div>
                
                <Button className="w-full mt-4">
                  View {child.name.split(' ')[0]}'s Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentChildrenSelector;
