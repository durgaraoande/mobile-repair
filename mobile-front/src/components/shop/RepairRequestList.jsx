import React, { useState } from 'react';
import { Button } from '../common/Button';
import { REQUEST_STATUS } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/helpers';

export const RepairRequestList = ({ requests, onStatusUpdate, onQuoteSubmit }) => {
  const [quoteForm, setQuoteForm] = useState({
    requestId: null,
    estimatedCost: '',
    description: '',
    estimatedDays: ''
  });

  const handleQuoteSubmit = (requestId) => {
    onQuoteSubmit({
      ...quoteForm,
      repairRequestId: requestId
    });
    setQuoteForm({
      requestId: null,
      estimatedCost: '',
      description: '',
      estimatedDays: ''
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {requests.length === 0 ? (
        <div className="bg-blue-50 text-blue-700 rounded-lg p-6 text-center">
          <p className="text-lg font-medium">No repair requests available</p>
          <p className="text-sm mt-2">New requests will appear here when customers submit them</p>
        </div>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition duration-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {request.deviceBrand} {request.deviceModel}
                </h3>
                <p className="text-sm text-gray-500">
                  Submitted: {formatDate(request.createdAt)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${
                request.status === REQUEST_STATUS.PENDING
                  ? 'bg-yellow-100 text-yellow-800'
                  : request.status === REQUEST_STATUS.IN_PROGRESS
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {request.status}
              </span>
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Problem:</strong> {request.problemCategory}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Description:</strong> {request.problemDescription}
              </p>
            </div>

            {request.status === REQUEST_STATUS.PENDING && (
              <div className="mt-6 bg-indigo-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-indigo-800 mb-3">Submit Quote</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Estimated cost"
                      value={quoteForm.estimatedCost}
                      onChange={(e) => setQuoteForm({
                        ...quoteForm,
                        estimatedCost: e.target.value
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Estimated days"
                      value={quoteForm.estimatedDays}
                      onChange={(e) => setQuoteForm({
                        ...quoteForm,
                        estimatedDays: e.target.value
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <textarea
                    placeholder="Quote description (include parts and labor details)"
                    value={quoteForm.description}
                    onChange={(e) => setQuoteForm({
                      ...quoteForm,
                      description: e.target.value
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    rows={3}
                  />
                  <div className="text-xs text-indigo-700 mb-2">
                    Tip: Detailed quotes with clear breakdowns typically get higher acceptance rates
                  </div>
                  <Button
                    onClick={() => handleQuoteSubmit(request.id)}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Submit Quote
                  </Button>
                </div>
              </div>
            )}

            {request.status === REQUEST_STATUS.IN_PROGRESS && (
              <div className="mt-6">
                <Button
                  onClick={() => onStatusUpdate(request.id, REQUEST_STATUS.COMPLETED)}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  Mark as Completed
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Only mark as completed when all work is done and ready for pickup
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};