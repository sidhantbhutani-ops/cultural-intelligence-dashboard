import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { Badge } from '../components/Badge';

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [newSource, setNewSource] = useState({
    name: '',
    source_type: 'rss',
    base_url: '',
    api_key: '',
    scrape_strategy: 'rss',
    priority: 5,
    is_active: true,
    description: ''
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await api('/admin/sources');
      setSources(response.data || []);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to fetch sources' });
      console.error('Fetch sources error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/sources', {
        method: 'POST',
        body: JSON.stringify(newSource),
      });
      setToast({ type: 'success', message: 'Source added successfully' });
      setShowAddModal(false);
      setNewSource({
        name: '',
        source_type: 'rss',
        base_url: '',
        api_key: '',
        scrape_strategy: 'rss',
        priority: 5,
        is_active: true,
        description: ''
      });
      fetchSources();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to add source' });
      console.error('Add source error:', error);
    }
  };

  const handleUpdateSource = async (id) => {
    try {
      const sourceToUpdate = sources.find(s => s.id === id);
      await api(`/admin/sources/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(sourceToUpdate),
      });
      setToast({ type: 'success', message: 'Source updated successfully' });
      setEditingId(null);
      fetchSources();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update source' });
      console.error('Update source error:', error);
    }
  };

  const handleDeleteSource = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api(`/admin/sources/${id}`, {
          method: 'DELETE',
        });
        setToast({ type: 'success', message: 'Source deleted' });
        fetchSources();
      } catch (error) {
        setToast({ type: 'error', message: 'Failed to delete source' });
        console.error('Delete source error:', error);
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sources</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Source</Button>
      </div>

      <div className="grid gap-4">
        {sources.map(source => (
          <div key={source.id} className="border rounded p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{source.name}</h3>
                <p className="text-sm text-gray-600">{source.description}</p>
              </div>
              <Badge>{source.is_active ? 'Active' : 'Inactive'}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div><span className="font-medium">Type:</span> {source.source_type}</div>
              <div><span className="font-medium">Strategy:</span> {source.scrape_strategy}</div>
              <div><span className="font-medium">Priority:</span> {source.priority}</div>
              <div><span className="font-medium">URL:</span> <code className="text-xs bg-gray-100 px-1">{source.base_url}</code></div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditingId(source.id)}>Edit</Button>
              <Button variant="danger" size="sm" onClick={() => handleDeleteSource(source.id)}>Delete</Button>
            </div>

            {editingId === source.id && (
              <EditModal
                source={source}
                onClose={() => setEditingId(null)}
                onSave={() => handleUpdateSource(source.id)}
                onChange={(field, value) => {
                  const updated = sources.map(s => s.id === source.id ? { ...s, [field]: value } : s);
                  setSources(updated);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSource} className="space-y-4">
            <h2 className="text-xl font-bold">Add Source</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                placeholder="e.g., Wired"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Source Type *</label>
              <select
                value={newSource.source_type}
                onChange={(e) => {
                  const type = e.target.value;
                  setNewSource({ 
                    ...newSource, 
                    source_type: type,
                    scrape_strategy: type === 'rss' ? 'rss' : type === 'news' ? 'api' : 'html'
                  });
                }}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="rss">RSS Feed</option>
                <option value="news">News API</option>
                <option value="html">HTML Scraper</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Base URL *</label>
              <input
                type="url"
                placeholder="https://..."
                value={newSource.base_url}
                onChange={(e) => setNewSource({ ...newSource, base_url: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            {newSource.source_type === 'news' && (
              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <input
                  type="password"
                  placeholder="Leave blank if not required"
                  value={newSource.api_key || ''}
                  onChange={(e) => setNewSource({ ...newSource, api_key: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Priority (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newSource.priority || 5}
                onChange={(e) => setNewSource({ ...newSource, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                placeholder="What's this source about?"
                value={newSource.description || ''}
                onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded font-medium">Add Source</button>
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function EditModal({ source, onClose, onSave, onChange }) {
  return (
    <Modal onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-3">
        <h3 className="text-lg font-bold">Edit {source.name}</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <input
            type="number"
            min="1"
            max="10"
            value={source.priority}
            onChange={(e) => onChange('priority', parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={source.is_active}
              onChange={(e) => onChange('is_active', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Active</span>
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded font-medium">Save</button>
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
