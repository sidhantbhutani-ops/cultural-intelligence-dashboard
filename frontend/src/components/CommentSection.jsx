import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { getComments, addComment, deleteComment } from '../api';

export const CommentSection = ({ trendId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [trendId]);

  const loadComments = async () => {
    try {
      const data = await getComments(trendId);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      await addComment(trendId, newComment);
      Toast.success('Comment added');
      setNewComment('');
      loadComments();
    } catch (error) {
      Toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(trendId, commentId);
      Toast.success('Comment deleted');
      loadComments();
    } catch (error) {
      Toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4 space-y-4">
      <h3 className="text-16 font-semibold text-gray-900">Comments ({comments.length})</h3>
      
      <div className="space-y-2">
        <textarea 
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-14 focus:border-blue-500"
          rows={3}
        />
        <div className="flex justify-between items-center">
          <span className="text-12 text-gray-500">{newComment.length}/500</span>
          <Button 
            onClick={handleAddComment} 
            variant="secondary" 
            size="sm"
            loading={submitting}
          >
            Add Comment
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner size="sm" />
      ) : comments.length === 0 ? (
        <p className="text-12 text-gray-500">No comments yet</p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-md space-y-1">
              <div className="flex justify-between items-start">
                <p className="text-12 font-semibold text-gray-900">{comment.user_id}</p>
                <span className="text-11 text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-14 text-gray-700">{comment.content}</p>
              <button 
                onClick={() => handleDelete(comment.id)}
                className="text-11 text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
