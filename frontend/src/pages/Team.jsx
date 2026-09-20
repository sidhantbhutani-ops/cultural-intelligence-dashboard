import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from '../api';

export const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getTeamMembers();
      setMembers(data.team_members || []);
    } catch (error) {
      Toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      avatar: '',
    });
    setShowAddModal(true);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      avatar: member.avatar || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const submitAdd = async () => {
    try {
      if (!formData.name || !formData.email) {
        Toast.error('Name and email are required');
        return;
      }
      setSubmitting(true);
      await addTeamMember(formData);
      Toast.success('Team member added');
      setShowAddModal(false);
      loadMembers();
    } catch (error) {
      Toast.error(error.message || 'Failed to add team member');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    try {
      if (!formData.name || !formData.email) {
        Toast.error('Name and email are required');
        return;
      }
      setSubmitting(true);
      await updateTeamMember(selectedMember.id, formData);
      Toast.success('Team member updated');
      setShowEditModal(false);
      loadMembers();
    } catch (error) {
      Toast.error(error.message || 'Failed to update team member');
    } finally {
      setSubmitting(false);
    }
  };

  const submitDelete = async () => {
    try {
      setSubmitting(true);
      await deleteTeamMember(selectedMember.id);
      Toast.success('Team member deleted');
      setShowDeleteModal(false);
      loadMembers();
    } catch (error) {
      Toast.error(error.message || 'Failed to delete team member');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-28 font-bold text-gray-900">Team Members</h1>
          <Button onClick={handleAdd} variant="primary">
            Add Member
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-13 text-gray-900 font-medium">{member.name}</td>
                    <td className="px-6 py-4 text-13 text-gray-700">{member.email}</td>
                    <td className="px-6 py-4 text-13">
                      <span className={`px-3 py-1 rounded-full text-12 font-semibold ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-13 text-gray-700">
                      {new Date(member.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-13 space-x-2">
                      <button onClick={() => handleEdit(member)} className="text-blue-600 hover:text-blue-700 font-semibold">Edit</button>
                      <button onClick={() => handleDelete(member)} className="text-red-600 hover:text-red-700 font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {members.length === 0 && (
            <div className="text-center py-12">
              <p className="text-14 text-gray-600">No team members found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Team Member">
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <Input label="Avatar URL (optional)" value={formData.avatar} onChange={(e) => setFormData({...formData, avatar: e.target.value})} />
          <div className="flex gap-3 pt-4">
            <Button onClick={submitAdd} variant="primary" disabled={submitting} fullWidth>{submitting ? 'Adding...' : 'Add Member'}</Button>
            <Button onClick={() => setShowAddModal(false)} variant="secondary" fullWidth>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Team Member">
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <Input label="Avatar URL (optional)" value={formData.avatar} onChange={(e) => setFormData({...formData, avatar: e.target.value})} />
          <div className="flex gap-3 pt-4">
            <Button onClick={submitEdit} variant="primary" disabled={submitting} fullWidth>{submitting ? 'Updating...' : 'Update Member'}</Button>
            <Button onClick={() => setShowEditModal(false)} variant="secondary" fullWidth>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Team Member">
        <div className="space-y-4">
          <p className="text-14 text-gray-700">Are you sure you want to delete <strong>{selectedMember?.name}</strong>? This action cannot be undone.</p>
          <div className="flex gap-3 pt-4">
            <Button onClick={submitDelete} variant="danger" disabled={submitting} fullWidth>{submitting ? 'Deleting...' : 'Delete'}</Button>
            <Button onClick={() => setShowDeleteModal(false)} variant="secondary" fullWidth>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
