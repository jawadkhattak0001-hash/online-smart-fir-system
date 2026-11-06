// src/lib/firUtils.js
export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'status-pending';
    case 'approved': return 'status-approved';
    case 'rejected': return 'status-rejected';
    case 'under_investigation': return 'status-investigation';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getCaseStatusColor = (status) => {
  switch (status) {
    case 'under_investigation': return 'bg-blue-100 text-blue-800';
    case 'charges_filed': return 'bg-orange-100 text-orange-800';
    case 'closed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};