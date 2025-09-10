// Enhanced Variations (Change Requests) Section with PDF Downloads
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { apiClient } from '../../../data/api';
import ClientVariationApproval from '../../../components/variations/ClientVariationApproval';

const EnhancedVariations = ({ variations, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort variations
  const filteredAndSortedVariations = React.useMemo(() => {
    let filtered = variations.filter(variation => {
      const matchesSearch = 
        variation.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variation.changeDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variation.changeReference?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || variation.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'number':
          return a.number?.localeCompare(b.number) || 0;
        default:
          return 0;
      }
    });
  }, [variations, searchTerm, filterStatus, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownloadPDF = async (variation) => {
    try {
      const pdfBlob = await apiClient.generateVariationPdf(variation.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${variation.number}_ChangeRequest.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const formatCurrency = (amount, currency = 'AED') => {
    if (!amount) return 'No cost impact';
    const formatted = parseFloat(amount).toLocaleString('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return currency === 'AED' ? `AED ${formatted}` : `$${formatted}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search change requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            className="w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            className="w-full sm:w-48"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="number">By Number</option>
          </Select>
        </div>
      </div>

      {/* Variations List */}
      {filteredAndSortedVariations.length > 0 ? (
        <div className="grid gap-6">
          {filteredAndSortedVariations.map((variation) => {
            // Use new approval interface for submitted variations
            if (variation.status === 'submitted') {
              return (
                <ClientVariationApproval
                  key={variation.id}
                  variation={variation}
                  onDecisionComplete={(decision) => {
                    console.log(`Variation ${variation.number} ${decision}`);
                    // Refresh variations data
                    window.location.reload();
                  }}
                />
              );
            }
            
            // Use existing display for other statuses
            return (
            <div key={variation.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{variation.number}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(variation.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          variation.status === 'Approved' ? 'bg-green-400' :
                          variation.status === 'Rejected' ? 'bg-red-400' :
                          variation.status === 'Under Review' ? 'bg-blue-400' :
                          'bg-yellow-400'
                        }`}></div>
                        {variation.status}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-800 mb-2">
                      {variation.title || variation.changeReference || 'Change Request'}
                    </h4>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Date: {new Date(variation.date).toLocaleDateString()}</span>
                      {variation.changeRequestor && <span>By: {variation.changeRequestor}</span>}
                      {variation.changeArea && <span>Area: {variation.changeArea}</span>}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-3">
                    <Button
                      onClick={() => handleDownloadPDF(variation)}
                      className="flex items-center space-x-2"
                    >
                      <Icon name="Download" size={16} />
                      <span>Download PDF</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {variation.changeDescription && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Change Description</h5>
                        <p className="text-sm text-gray-700">{variation.changeDescription}</p>
                      </div>
                    )}

                    {variation.reasonDescription && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Reason</h5>
                        <p className="text-sm text-gray-700">{variation.reasonDescription}</p>
                      </div>
                    )}

                    {/* Work Types */}
                    {variation.workTypes && variation.workTypes.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Work Types</h5>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(variation.workTypes) ? variation.workTypes : JSON.parse(variation.workTypes || '[]')).map((type, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {variation.categories && variation.categories.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Categories</h5>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(variation.categories) ? variation.categories : JSON.parse(variation.categories || '[]')).map((category, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {variation.technicalChanges && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Technical Changes</h5>
                        <p className="text-sm text-gray-700">{variation.technicalChanges}</p>
                      </div>
                    )}

                    {variation.resourcesAndCosts && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Resources & Costs</h5>
                        <p className="text-sm text-gray-700">{variation.resourcesAndCosts}</p>
                      </div>
                    )}

                    {/* Cost Impact */}
                    {variation.priceImpact && parseFloat(variation.priceImpact) !== 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Cost Impact</h5>
                        <p className={`text-lg font-bold ${
                          parseFloat(variation.priceImpact) > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {parseFloat(variation.priceImpact) > 0 ? '+' : ''}{formatCurrency(variation.priceImpact, variation.currency)}
                        </p>
                      </div>
                    )}

                    {/* Time Impact */}
                    {variation.timeImpact && parseInt(variation.timeImpact) !== 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Time Impact</h5>
                        <p className={`text-sm font-medium ${
                          parseInt(variation.timeImpact) > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {parseInt(variation.timeImpact) > 0 ? '+' : ''}{variation.timeImpact} days
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Disposition */}
                {variation.disposition && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Decision</h5>
                        <p className={`text-sm font-medium ${
                          variation.disposition === 'Approved' ? 'text-green-700' :
                          variation.disposition === 'Rejected' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>
                          {variation.disposition}
                        </p>
                        {variation.dispositionReason && (
                          <p className="text-sm text-gray-600 mt-1">{variation.dispositionReason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="GitBranch" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No change requests found' : 'No change requests yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Change requests will appear here when modifications to the original project are needed.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedVariations;