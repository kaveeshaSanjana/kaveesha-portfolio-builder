import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus, RefreshCw, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { transportApi, type TransportEnrollment } from '@/api/transport.api';

const ChildTransportPage = () => {
  const navigate = useNavigate();
  const { selectedChild, setSelectedTransport } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<TransportEnrollment[]>([]);

  const loadEnrollments = async () => {
    if (!selectedChild?.id) {
      toast({
        title: "No Child Selected",
        description: "Please select a child to view transport",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await transportApi.getStudentEnrollments(selectedChild.id, {
        page: 1,
        limit: 10
      });
      
      setEnrollments(response.data.enrollments);
      toast({
        title: "Success",
        description: `Loaded ${response.data.enrollments.length} enrollments`,
      });
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast({
        title: "Error",
        description: "Failed to load transport enrollments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleSelectTransport = (enrollment: TransportEnrollment) => {
    setSelectedTransport({
      id: enrollment.id,
      vehicleNumber: enrollment.vehicleNumber,
      bookhireId: enrollment.bookhireId
    });
    navigate('/transport-attendance');
  };

  return (
    <div className="min-h-screen space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Bus className="h-6 w-6" />
              Transport Information
            </CardTitle>
            <Button onClick={loadEnrollments} disabled={loading} size="sm">
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Load Enrollments
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="relative flex w-80 flex-col rounded-xl bg-white dark:bg-card bg-clip-border text-gray-700 dark:text-foreground shadow-md">
                  <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-blue-gray-500 bg-clip-border text-white shadow-lg shadow-blue-gray-500/40 bg-gradient-to-r from-blue-500 to-blue-600">
                    {enrollment.imageUrl ? (
                      <img
                        src={enrollment.imageUrl}
                        alt={enrollment.bookhireTitle || 'Transport vehicle'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bus className="h-16 w-16 text-white/90" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h5 className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 dark:text-foreground antialiased">
                      {enrollment.bookhireTitle}
                    </h5>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-0 px-3 py-1">
                        {enrollment.vehicleNumber}
                      </Badge>
                      <Badge className={`text-sm px-3 py-1 ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased mb-3">
                      <span className="font-medium">Pickup: </span>
                      {enrollment.pickupLocation || 'Not specified'}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-border">
                      <span className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Monthly Fee:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                        Rs. {enrollment.monthlyFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleSelectTransport(enrollment)}
                      className="select-none rounded-lg bg-blue-500 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none w-full"
                    >
                      Select Transport
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Click "Load Enrollments" to view transport information
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildTransportPage;
