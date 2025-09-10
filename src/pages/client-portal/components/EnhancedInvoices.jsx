// Enhanced Invoices Section with Filtering and Sorting
import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { apiClient } from '../../../data/api';

const EnhancedInvoices = ({ invoices, loading, projectId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = invoice.number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.issueDate) - new Date(a.issueDate);
        case 'oldest':
          return new Date(a.issueDate) - new Date(b.issueDate);
        case 'amount_high':
          return parseFloat(b.total || 0) - parseFloat(a.total || 0);
        case 'amount_low':
          return parseFloat(a.total || 0) - parseFloat(b.total || 0);
        default:
          return 0;
      }
    });
  }, [invoices, searchTerm, filterStatus, sortBy]);

  const formatCurrency = (amount, currency = 'AED') => {
    const formatted = parseFloat(amount || 0).toLocaleString('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return currency === 'AED' ? `AED ${formatted}` : `$${formatted}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      const pdfBlob = await apiClient.generateInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.number}_Invoice.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
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
              placeholder="Search by invoice number..."
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
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            className="w-full sm:w-48"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Highest Amount</option>
            <option value="amount_low">Lowest Amount</option>
          </Select>
        </div>
      </div>

      {/* Invoices List */}
      {filteredAndSortedInvoices.length > 0 ? (
        <div className="grid gap-6">
          {filteredAndSortedInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{invoice.number}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Line Items Summary */}
                  {invoice.lineItems && invoice.lineItems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Items ({invoice.lineItems.length})</p>
                      <div className="space-y-1">
                        {invoice.lineItems.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.description}</span>
                            <span className="text-gray-600">
                              {item.quantity} × {formatCurrency(item.rate, invoice.currency)}
                            </span>
                          </div>
                        ))}
                        {invoice.lineItems.length > 3 && (
                          <p className="text-sm text-gray-500 italic">
                            +{invoice.lineItems.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {invoice.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-sm text-gray-700">{invoice.notes}</p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col space-y-3">
                  <Button
                    onClick={() => handleDownloadPDF(invoice)}
                    className="flex items-center space-x-2"
                  >
                    <Icon name="Download" size={16} />
                    <span>Download PDF</span>
                  </Button>

                  {invoice.status === 'Pending' && (
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Icon name="CreditCard" size={16} />
                      <span>Pay Now</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Payment Progress Bar (if applicable) */}
              {invoice.status === 'Pending' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Payment Due</span>
                    <span>{Math.ceil((new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${Math.max(0, Math.min(100, 100 - (Math.ceil((new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) / 30 * 100)))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="Receipt" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No invoices found' : 'No invoices yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Invoices will appear here when they are generated for your project.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedInvoices;