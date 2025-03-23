import React from 'react';
import { formatDate } from '../../utils/helpers';
import { PROBLEM_CATEGORIES, REQUEST_STATUS } from '../../utils/constants';
import { CloudinaryImageGallery } from '../../image/ImageGallery';

export const RepairRequestDetails = ({ request }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Repair Request Details
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Submitted on {formatDate(request.createdAt)}
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Device</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {request.deviceBrand} {request.deviceModel}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">IMEI Number</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {request.imeiNumber || 'Not provided'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Problem Category</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {PROBLEM_CATEGORIES[request.problemCategory]}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
              {request.problemDescription}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 sm:mt-0 sm:col-span-2">
              <span className={`px-2 py-1 text-sm font-semibold rounded-full 
                ${request.status === REQUEST_STATUS.COMPLETED ? 'bg-green-100 text-green-800' : 
                  request.status === REQUEST_STATUS.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 
                  request.status === REQUEST_STATUS.PENDING ? 'bg-yellow-100 text-yellow-800' :
                  request.status === REQUEST_STATUS.REJECTED ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}`}>
                {request.status}
              </span>
              {request.status === REQUEST_STATUS.PENDING && (
                <p className="mt-2 text-sm text-yellow-700">Your request is pending review. We typically respond within 24 hours.</p>
              )}
              {request.status === REQUEST_STATUS.IN_PROGRESS && (
                <p className="mt-2 text-sm text-blue-700">Your device is currently being repaired. We'll update you when it's ready.</p>
              )}
            </dd>
          </div>
          {request.imageUrls?.length > 0 && (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Images</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <CloudinaryImageGallery images={request.imageUrls} />
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};