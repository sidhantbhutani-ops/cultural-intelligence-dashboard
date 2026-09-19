import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Toast } from './Toast';
import { addTag, deleteTag } from '../api';

export const TagsSection = ({ trendId }) => {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableTags = ['content-idea', 'event-potential', 'brand-collab', 'social-angle'];

  const handleAddTag = async () => {
    if (!selectedTag) return;

    setSubmitting(true);
    try {
      await addTag(trendId, selectedTag);
      Toast.success('Tag added');
      setTags([...tags, selectedTag]);
      setSelectedTag('');
    } catch (error) {
      Toast.error('Failed to add tag');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTag = async (tag) => {
    try {
      await deleteTag(trendId, tag);
      Toast.success('Tag removed');
      setTags(tags.filter(t => t !== tag));
    } catch (error) {
      Toast.error('Failed to remove tag');
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4 space-y-4">
      <h3 className="text-16 font-semibold text-gray-900">Tags</h3>
      
      <div className="space-y-2">
        <select 
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-14"
        >
          <option value="">Add a tag...</option>
          {availableTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <Button 
          onClick={handleAddTag}
          variant="secondary" 
          size="sm"
          className="w-full"
          loading={submitting}
        >
          Add Tag
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <div key={tag} className="bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-12 flex items-center gap-2">
            {tag}
            <button 
              onClick={() => handleDeleteTag(tag)}
              className="text-blue-900 hover:text-blue-700 font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
