import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ProjectTeam = ({ projectId }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('Designer');
  const [loading, setLoading] = useState(false);

  // Available roles as per specification
  const roleOptions = [
    { value: 'Manager', label: 'Manager' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Contractor', label: 'Contractor' },
    { value: 'Other', label: 'Other' }
  ];

  // Fetch team members and available users on component mount
  useEffect(() => {
    fetchTeamMembers();
    fetchAvailableUsers();
  }, [projectId]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/team/project/${projectId}`);
      if (response.data.success) {
        setTeamMembers(response.data.data || []);
      } else {
        console.error('Failed to fetch team members:', response.data.error);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axios.get('/api/team/users');
      if (response.data.success) {
        setAvailableUsers(response.data.data || []);
      } else {
        console.error('Failed to fetch users:', response.data.error);
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setAvailableUsers([]);
    }
  };

  const userOptions = availableUsers
    .filter(user => !teamMembers.some(member => member.userId === user.id))
    .map(user => ({
      value: user.id,
      label: `${user.name} (${user.specialization || user.role})`
    }));

  const handleAddMember = async () => {
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/team', {
        projectId,
        userId: selectedUserId,
        role: selectedRole
      });

      if (response.data.success) {
        await fetchTeamMembers(); // Refresh team members list
        setIsAddModalOpen(false);
        setSelectedUserId('');
        setSelectedRole('Designer');
        console.log('Team member added successfully');
      } else {
        alert('Failed to add team member: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        setLoading(true);
        const response = await axios.delete(`/api/team/${memberId}`);
        if (response.data.success) {
          await fetchTeamMembers(); // Refresh team members list
          console.log('Team member removed successfully');
        } else {
          alert('Failed to remove team member: ' + response.data.error);
        }
      } catch (error) {
        console.error('Error removing team member:', error);
        alert('Failed to remove team member: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/team/${memberId}`, { role: newRole });
      if (response.data.success) {
        await fetchTeamMembers(); // Refresh team members list
        console.log('Team member role updated successfully');
      } else {
        alert('Failed to update role: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error updating team member role:', error);
      alert('Failed to update role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Manager': return 'bg-blue-100 text-blue-700';
      case 'Designer': return 'bg-green-100 text-green-700';
      case 'Contractor': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Project Team</h3>
          <p className="text-sm text-text-secondary">Manage team members and their roles</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="flex items-center space-x-2"
          disabled={availableUsers.length === 0}
        >
          <Icon name="UserPlus" size={16} />
          <span>Add Member</span>
        </Button>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        {teamMembers.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Icon name="Users" size={48} className="mx-auto text-text-secondary mb-4" />
            <h4 className="font-medium text-primary mb-2">No Team Members</h4>
            <p className="text-text-secondary mb-4">Add team members to collaborate on this project</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              variant="outline"
              disabled={availableUsers.length === 0}
            >
              Add Team Member
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-card border border-border rounded-lg p-6">
                {/* Member Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center overflow-hidden">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.userName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="User" size={24} className="text-accent-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary">{member.userName}</h4>
                    <p className="text-sm text-text-secondary">{member.specialization}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${member.isOnline ? 'bg-success' : 'bg-gray-400'}`}></div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="Mail" size={14} />
                    <span>{member.userEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="Phone" size={14} />
                    <span>{member.userPhone}</span>
                  </div>
                </div>

                {/* Role Management */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">Role</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Select
                      value={member.role}
                      onChange={(newRole) => handleChangeRole(member.id, newRole)}
                      options={roleOptions}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="px-3"
                    >
                      <Icon name="UserMinus" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Add Team Member</h2>
                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Team Member <span className="text-red-500">*</span>
                </label>
                {userOptions.length > 0 ? (
                  <Select
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    options={[{ value: '', label: 'Select a user to add' }, ...userOptions]}
                    placeholder="Select a user to add"
                  />
                ) : (
                  <div className="text-sm text-text-secondary p-3 bg-muted rounded-md">
                    All available users are already on this project team.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedRole}
                  onChange={setSelectedRole}
                  options={roleOptions}
                />
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={!selectedUserId}>
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTeam;