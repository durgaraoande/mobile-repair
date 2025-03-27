import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { shopApi } from '../../api/shops';
import { ShopTabs } from '../../components/shop/ShopTabs';
import { ShopProfile } from '../../components/shop/ShopProfile';
import { PendingRepairs } from '../shop/PendingRepairs';
import { ActiveRepairs } from '../shop/ActiveRepairs';
import { CompletedRepairs } from '../shop/CompletedRepairs';
import { Loading } from '../../components/common/Loading';
import { Navigate } from 'react-router-dom';

export const ShopOwnerDashboard = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('pending');
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const shopData = await shopApi.getShopByOwnerId(user.id);
        setShop(shopData);
      } catch (error) {
        if (error.response?.status === 404) {
          setShouldRedirect(true);
        } else {
          setError('Failed to load shop data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/shop-registration" replace />;
  }

  // If shop is not verified, show pending approval message
  if (shop && !shop.verified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-700 font-semibold">
            Your shop is currently pending admin approval. 
            We are reviewing your shop details and will notify you once approved.
          </p>
        </div>
      </div>
    );
  }

  if (!shop) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
              {shop.name}
            </h1>
            <p className="text-blue-600">
              Manage your repair shop and customer requests
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <ShopTabs 
          currentTab={currentTab} 
          onTabChange={setCurrentTab}
          className="px-6 pt-4"
        />

        <div className="p-6">
          {currentTab === 'pending' && <PendingRepairs />}
          {currentTab === 'repairs' && <ActiveRepairs />}
          {currentTab === 'completed' && <CompletedRepairs />}
          {currentTab === 'profile' && (
            <ShopProfile 
              shop={shop} 
              onUpdate={handleUpdateShop}
              // isLoading={loading}
              // setIsLoading={setLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};