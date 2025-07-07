// components/viewer/comment-system/comment-item.tsx - UPDATED with better layout
'use client';
import {
  Brain,
  Edit,
  Heart,
  Info,
  MessageSquare,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/ui/role-badge';
import { Textarea } from '@/components/ui/text-area';
import { useRBAC } from '@/hooks/use-rbac';
import type { Comment } from '@/types/auth';

interface CommentItemProps {
  comment: Comment;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
}

// Type-safe role type
type UserRole = 'admin' | 'doctor' | 'staff' | 'patient';

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onEdit,
  onDelete,
}) => {
  const { user, permissions } = useRBAC();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'finding':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'recommendation':
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'note':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'question':
        return <Info className="h-4 w-4 text-orange-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'finding':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recommendation':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'note':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'question':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canEditComment =
    permissions.canEditComments &&
    (user?.id.toString() === comment.authorId || user?.role === 'admin');

  const canDeleteComment =
    permissions.canDeleteComments &&
    (user?.id.toString() === comment.authorId || user?.role === 'admin');

  const handleSaveEdit = () => {
    if (editContent.trim() !== comment.content && onEdit) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleEditContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setEditContent(event.target.value);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {comment.author
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-white text-sm">
                {comment.author}
              </span>
              <RoleBadge
                role={comment.role as UserRole}
                className="text-xs flex-shrink-0"
              />
            </div>
            <p className="text-xs text-gray-400">{comment.timestamp}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {getCommentIcon(comment.type)}
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className={`text-xs ${getCommentTypeColor(comment.type)}`}
        >
          {comment.type}
        </Badge>
        {comment.isPrivate && (
          <Badge
            variant="outline"
            className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Private
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={handleEditContentChange}
              className="min-h-[80px] bg-gray-600 border-gray-500 text-white"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-gray-300">
            {comment.content}
          </p>
        )}
      </div>

      {/* Position Info */}
      {comment.position && (
        <div className="text-xs text-gray-400">
          {comment.position.view} • Slice {comment.position.slice} • (
          {comment.position.x}, {comment.position.y})
        </div>
      )}

      {/* Actions */}
      {(canEditComment || canDeleteComment) && !isEditing && (
        <div className="flex gap-2">
          {canEditComment && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-white"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          {canDeleteComment && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete?.(comment.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
