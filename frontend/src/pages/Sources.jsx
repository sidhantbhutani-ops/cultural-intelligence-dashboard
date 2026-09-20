import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import { getSources, addSource, updateSource, deleteSource, testSource } from '../api';

const getSourceStatus = (source) => {
  if (!source.is_active) return { status: 'red', label: 'Inactive' };
  if (source.consecutive_failures >= 3) return { status: 'red', label: 'Failed' };
  if (source.consecutive_failures > 0) return { status: 'orange', label: 'Issues' };
  if (!source.last_successful_fetch) return { status: 'orange', label: 'No Data' };
  
  const lastFetch = new Date(source.last_successful_fetch);
  const now = new Date();
  const daysSince = (now - lastFetch) / (1000 * 60 * 60 * 24);
  
  if (daysSince > 7) return { status: 'orange', label: 'Stale' };
  return { status: 'green', label: 'Healthy' };
};

const StatusDot = ({ status }) => {
  const colors = {
    red: 'bg-red-500',
    orange: 'bg-yellow-500',
    green: 'bg-green-500',
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${colors[status]}`}></div>
    </div>
  );
};

export const Sources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadSources = async () => {
    try {
      setLoading(true);
      const data = await getSources();
      setSources(data.sources || []);
    } catch (error) {
      Toast.error('Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleAdd = () => {
    setFormData({
      name: '',
      source_type: 'rss',
      base_url: '',
      api_key: '',
      headers: '{}',
      query_params: '{}',
      scrape_strategy: 'rss',
      rate_limit_per_hour: 100,
      concurrent_requests: 3,
      is_active: true,
      priority: 1,
      description: '',
    });
    setShowAddModal(true);
  };

  const handleEdit = (source) => {
    setSelectedSource(source);
    setFormData({
      ...source,
      headers: typeof source.headers === 'string' ? source.headers : JSON.stringify(source.headers || {}),
      query_params: typeof source.query_params === 'string' ? source.query_params : JSON.stringify(source.query_params || {}),
    });
    setShowEditModal(true);
  };

  const handleDelete = (source) => {
    setSelectedSource(source);
    setShowDeleteModal(true);
  };

  const submitAdd = async () => {
    try {
      setSubmitting(true);
      await addSource(formData);
      Toast.success('Source added');
      setShowAddModal(false);
      loadSources();
    } catch (error) {
      Toast.error(error.message || 'Failed to add source');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    try {
      setSubmitting(true);
      await updateSource(selectedSource.id, formData);
      Toast.success('Source updated');
      setShowEditModal(false);
      loadSources();
    } catch (error) {
      Toast.error(error.message || 'Failed to update source');
    } finally {
      setSubmitting(false);
    }
  };

  const submitDelete = async () => {
    try {
      setSubmitting(true);
      await deleteSource(selectedSource.id);
      Toast.success('Source deleted');
      setShowDeleteModal(false);
      loadSources();
    } catch (error) {
      Toast.error(error.message || 'Failed to delete source');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTest = async (sourceId) => {
    try {
      setTesting(prev => ({ ...prev, [sourceId]: true }));
      const result = await testSource(sourceId);
      Toast.success(result.message || 'Test successful');
      loadSources();
    } catch (error) {
      Toast.error(error.message || 'Test failed');
    } finally {
      setTesting(prev => ({ ...prev, [sourceId]: false }));
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-28 font-bold text-gray-900">Scraper Sources</h1>
          <Button onClick={handleAdd} variant="primary">
            Add Source
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Priority</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Last Fetch</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Failures</th>
                  <th className="px-6 py-4 text-left text-13 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sources.map(source => {
                  const statusInfo = getSourceStatus(source);
                  return (
                    <tr key={source.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-13">
                        <div className="flex items-center gap-2">
                          <StatusDot status={statusInfo.status} />
                          <span className="text-12 font-semibold text-gray-700">{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-13 text-gray-900 font-medium">{source.name}</td>
                      <td className="px-6 py-4 text-13 text-gray-700">{source.source_type}</td>
                      <td className="px-6 py-4 text-13 text-gray-700">{source.priority || '-'}</td>
                      <td className="px-6 py-4 text-13 text-gray-700">{source.last_successful_fetch ? new Date(source.last_successful_fetch).toLocaleDateString() : 'Never'}</td>
                      <td className="px-6 py-4 text-13 text-gray-700">{source.consecutive_failures || 0}</td>
                      <td className="px-6 py-4 text-13 space-x-2">
                        <button onClick={() => handleTest(source.id)} disabled={testing[source.id]} className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50">
                          {testing[source.id] ? 'Testing...' : 'Test'}
                        </button>
                        <button onClick={() => handleEdit(source)} className="text-blue-600 hover:text-blue-700 font-semibold">Edit</button>
                        <button onClick={() => handleDelete(source)} className="text-red-600 hover:text-red-700 font-semibold">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-14 text-gray-600">No sources found</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <p className="text-13 text-gray-700">
            <strong>Status legend:</strong> 🟢 Healthy (active, no failures, recently fetched) | 🟠 Issues (inactive, has failures, or stale data) | 🔴 Failed (3+ consecutive failures)
          </p>
        </div>
      </div>

      {/* Add Source Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Source">
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <div>
            <label className="block text-13 font-semibold text-gray-900 mb-2">Source Type</label>
            <select value={formData.source_type} onChange={(e) => setFormData({...formData, source_type: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-14">
              <option value="rss">RSS</option>
              <option value="news">News API</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <Input label="Base URL" value={formData.base_url} onChange={(e) => setFormData({...formData, base_url: e.target.value})} />
          <Input label="API Key" value={formData.api_key} onChange={(e) => setFormData({...formData, api_key: e.target.value})} />
          <div>
            <label className="block text-13 font-semibold text-gray-900 mb-2">Scrape Strategy</label>
            <select value={formData.scrape_strategy} onChange={(e) => setFormData({...formData, scrape_strategy: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-14">
              <option value="rss">RSS</option>
              <option value="html">HTML</option>
              <option value="api">API</option>
            </select>
          </div>
          <Input label="Rate Limit (per hour)" type="number" value={formData.rate_limit_per_hour} onChange={(e) => setFormData({...formData, rate_limit_per_hour: parseInt(e.target.value)})} />
          <Input label="Concurrent Requests" type="number" value={formData.concurrent_requests} onChange={(e) => setFormData({...formData, concurrent_requests: parseInt(e.target.value)})} />
          <Input label="Priority" type="number" value={formData.priority} onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})} />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
            <label className="text-13 font-semibold text-gray-900">Active</label>
          </div>
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <div className="flex gap-3 pt-4">
            <Button onClick={submitAdd} variant="primary" disabled={submitting} fullWidth>{submitting ? 'Adding...' : 'Add Source'}</Button>
            <Button onClick={() => setShowAddModal(false)} variant="secondary" fullWidth>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Source Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Source">
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <div>
            <label className="block text-13 font-semibold text-gray-900 mb-2">Source Type</label>
            <select value={formData.source_type} onChange={(e) => setFormData({...formData, source_type: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-14">
              <option value="rss">RSS</option>
              <option value="news">News API</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <Input label="Base URL" value={formData.base_url} onChange={(e) => setFormData({...formData, base_url: e.target.value})} />
          <Input label="API Key" value={formData.api_key} onChange={(e) => setFormData({...formData, api_key: e.target.value})} />
          <div>
            <label className="block text-13 font-semibold text-gray-900 mb-2">Scrape Strategy</label>
            <select value={formData.scrape_strategy} onChange={(e) => setFormData({...formData, scrape_strategy: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-14">
              <option value="rss">RSS</option>
              <option value="html">HTML</option>
              <option value="api">API</option>
            </select>
          </div>
          <Input label="Rate Limit (per hour)" type="number" value={formData.rate_limit_per_hour} onChange={(e) => setFormData({...formData, rate_limit_per_hour: parseInt(e.target.value)})} />
          <Input label="Concurrent Requests" type="number" value={formData.concurrent_requests} onChange={(e) => setFormData({...formData, concurrent_requests: parseInt(e.target.value)})} />
          <Input label="Priority" type="number" value={formData.priority} onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})} />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
            <label className="text-13 font-semibold text-gray-900">Active</label>
          </div>
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <div className="flex gap-3 pt-4">
            <Button onClick={submitEdit} variant="primary" disabled={submitting} fullWidth>{submitting ? 'Updating...' : 'Update Source'}</Button>
            <Button onClick={() => setShowEditModal(false)} variant="secondary" fullWidth>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Source">
        <div className="space-y-4">
          <p className="text-14 text-gray-700">Are you sure you want to delete <strong>{selectedSource?.name}</strong>? This action cannot be undone.</p>
          <div className="flex gap-3 pt-4">
            <Button onClick={submitDelete} variant="danger" disabled={submitting} fullWidth>{submitting ? 'Deleting...' : 'Delete'}</Button>
            <Button onClick={() => setShowDeleteModal(false)} variant="secondary" fullWidth>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
