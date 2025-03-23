import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { repairRequestApi } from '../../api/repairRequests';
import { RepairRequestList } from '../../components/repair/RepairRequestList';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';

export const Customer = () => {
  const { user } = useAuth();
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await repairRequestApi.getCustomerRequests();
        setRequests(data);
      } catch (err) {
        setError('Failed to load repair requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
              Welcome back, {user.fullName}
            </h1>
            <p className="text-blue-600">
              Manage your repair requests and track their progress
            </p>
          </div>
          <Link to="/repair-requests/new">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              New Repair Request
            </Button>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-xl font-semibold text-blue-900">Your Repair Requests</h2>
          </div>
          
          {requests.length > 0 ? (
            <RepairRequestList requests={requests} />
          ) : (
            <div className="p-12 text-center">
              <p className="text-blue-600 mb-4">No repair requests yet</p>
              <Link 
                to="/repair-requests/new"
                className="text-blue-700 hover:text-blue-800 font-medium"
              >
                Create your first repair request →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};