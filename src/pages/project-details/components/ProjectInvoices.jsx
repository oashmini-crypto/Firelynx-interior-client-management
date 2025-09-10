import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ProjectInvoices = ({ projectId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'USD',
    lineItems: [{ description: '', quantity: 1, rate: 0, taxPercent: 8.25 }],
    notes: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [projectId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/invoices/project/${projectId}`);
      if (response.data.success) {
        setInvoices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Sent': return 'bg-blue-100 text-blue-700';
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, rate: 0, taxPercent: 8.25 }]
    }));
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    let subtotal = 0;
    let taxTotal = 0;
    
    formData.lineItems.forEach(item => {
      const amount = item.quantity * item.rate;
      subtotal += amount;
      taxTotal += amount * (item.taxPercent / 100);
    });
    
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  };

  const handleCreateInvoice = async () => {
    try {
      setLoading(true);
      const { subtotal, taxTotal, total } = calculateTotal();
      
      const invoiceData = {
        ...formData,
        projectId,
        dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now if not specified
      };
      
      const response = await axios.post('/api/invoices', invoiceData);
      
      if (response.data.success) {
        await fetchInvoices(); // Refresh invoice list
        setIsCreateModalOpen(false);
        // Reset form
        setFormData({
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          currency: 'USD',
          lineItems: [{ description: '', quantity: 1, rate: 0, taxPercent: 8.25 }],
          notes: ''
        });
        console.log('Invoice created successfully:', response.data.data.number);
      } else {
        alert('Failed to create invoice: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      // Open the professional HTML template in a new window for printing/PDF save
      const printWindow = window.open(`/api/pdf/invoice/${invoiceId}/preview`, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          // Wait a moment for styles to load, then trigger print dialog
          setTimeout(() => {
            printWindow.print();
          }, 1000);
        };
      } else {
        alert('Please allow pop-ups for this site to download PDFs. You can also right-click the Preview button and select "Open in new tab" to print.');
      }
      
    } catch (error) {
      console.error('Error opening invoice PDF preview:', error);
      alert('Failed to open PDF preview. Please try the Preview button instead.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Project Invoices</h3>
          <p className="text-sm text-text-secondary">Billing and payment tracking</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Icon name="Plus" size={16} />
          <span>Create Invoice</span>
        </Button>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Icon name="Receipt" size={48} className="mx-auto text-text-secondary mb-4" />
            <h4 className="font-medium text-primary mb-2">No Invoices</h4>
            <p className="text-text-secondary mb-4">No invoices have been created for this project</p>
            <Button 
              variant="outline"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create First Invoice
            </Button>
          </div>
        ) : (
          invoices.map(invoice => (
            <div key={invoice.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-primary">{invoice.number}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{invoice.notes || 'No description'}</p>
                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <span>Issue: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(parseFloat(invoice.total || 0))}</div>
                  <div className="text-xs text-text-secondary">{invoice.currency}</div>
                </div>
              </div>
              
              {/* Invoice Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/api/pdf/invoice/${invoice.id}/preview`, '_blank')}
                >
                  <Icon name="Eye" size={14} className="mr-2" />
                  View Invoice
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadPDF(invoice.id, invoice.number)}
                >
                  <Icon name="Download" size={14} className="mr-2" />
                  Download PDF
                </Button>
                {invoice.status === 'Draft' && (
                  <Button size="sm">
                    <Icon name="Send" size={14} className="mr-2" />
                    Send Invoice
                  </Button>
                )}
                {invoice.status === 'Sent' && (
                  <Button size="sm" variant="success">
                    <Icon name="Check" size={14} className="mr-2" />
                    Mark Paid
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Create New Invoice</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-auto space-y-6">
              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Issue Date"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  required
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
                <Select
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'GBP', label: 'GBP' }
                  ]}
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-primary">Line Items</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addLineItem}
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-muted/30 rounded-lg">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Tax %"
                          value={item.taxPercent}
                          onChange={(e) => updateLineItem(index, 'taxPercent', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          ${(item.quantity * item.rate).toFixed(2)}
                        </span>
                        {formData.lineItems.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="mt-6 bg-muted/20 rounded-lg p-4">
                  <div className="text-right space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${calculateTotal().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${calculateTotal().taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                      <span>Total:</span>
                      <span>${calculateTotal().total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Add any additional notes or payment terms..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateInvoice}
                  disabled={loading || formData.lineItems.some(item => !item.description)}
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectInvoices;