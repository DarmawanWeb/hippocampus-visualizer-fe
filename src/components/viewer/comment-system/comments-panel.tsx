'use client';
import { EyeOff, Filter, MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRBAC } from '@/hooks/use-rbac'; // Updated import
import type { Comment } from '@/types/auth'; // Updated import
import { AddCommentForm } from './add-comment-form';
import { CommentItem } from './comment-item';

interface CommentsPanelProps {
  comments: Comment[];
  onAddComment: (
    content: string,
    type: string,
    isPrivate: boolean,
    position?: { x: number; y: number },
  ) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onClose: () => void;
  isAddingComment: boolean;
  selectedPosition: { x: number; y: number } | null;
  onCancelAdd: () => void;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onClose,
  isAddingComment,
  selectedPosition,
  onCancelAdd,
}) => {
  const { user, permissions } = useRBAC(); // Updated hook
  const [filter, setFilter] = useState('all');

  const filteredComments = comments.filter((comment) => {
    // Filter private comments for non-authorized users
    if (comment.isPrivate && !permissions.canViewPrivateComments) {
      return comment.authorId === user?.id.toString();
    }

    // Filter by type
    if (filter !== 'all' && comment.type !== filter) {
      return false;
    }

    return true;
  });

  const handleAddComment = (
    content: string,
    type: string,
    isPrivate: boolean,
  ) => {
    onAddComment(content, type, isPrivate, selectedPosition || undefined);
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({filteredComments.length})
          </h3>
          <div className="flex items-center gap-2">
            {permissions.canAddComments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddComment('', 'note', false)}
                className="text-white hover:bg-gray-700"
                disabled={isAddingComment}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-gray-700"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-gray-600 border-gray-500 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="finding">Findings</SelectItem>
              <SelectItem value="recommendation">Recommendations</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
              <SelectItem value="question">Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {filter === 'all' ? 'No comments yet' : `No ${filter} comments`}
            </p>
            {permissions.canAddComments && (
              <p className="text-xs mt-1">Click the + button to add one</p>
            )}
          </div>
        ) : (
          filteredComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
            />
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {isAddingComment && selectedPosition && (
        <AddCommentForm
          onAdd={handleAddComment}
          onCancel={onCancelAdd}
          position={selectedPosition}
        />
      )}

      {/* User Info */}
      <div className="p-3 border-t border-gray-700 bg-gray-750">
        <div className="text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>Logged in as: {user?.name}</span>
            <span className="capitalize">{user?.role}</span>
          </div>
          <div className="mt-1 text-gray-500">
            {permissions.canAddComments
              ? 'Can add comments'
              : 'Read-only access'}
          </div>
        </div>
      </div>
    </div>
  );
};
