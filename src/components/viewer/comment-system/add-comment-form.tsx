// components/viewer/comment-system/add-comment-form.tsx - UPDATED with existing auth
'use client';
import { Send, X } from 'lucide-react';
import { type SetStateAction, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/text-area';
import { useRBAC } from '@/hooks/use-rbac'; // Updated import

interface AddCommentFormProps {
  onAdd: (content: string, type: string, isPrivate: boolean) => void;
  onCancel: () => void;
  position?: { x: number; y: number } | null;
}

export const AddCommentForm: React.FC<AddCommentFormProps> = ({
  onAdd,
  onCancel,
  position,
}) => {
  const { permissions } = useRBAC(); // Updated hook
  const [content, setContent] = useState('');
  const [type, setType] = useState('note');
  const [isPrivate, setIsPrivate] = useState(false);

  if (!permissions.canAddComments) {
    return (
      <div className="p-4 bg-gray-750 border-t border-gray-700">
        <div className="text-center text-gray-400">
          <p className="text-sm">You don't have permission to add comments</p>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="mt-2 bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    if (content.trim()) {
      onAdd(content.trim(), type, isPrivate);
      setContent('');
      setType('note');
      setIsPrivate(false);
    }
  };

  return (
    <div className="p-4 border-t border-gray-700 bg-gray-750">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white text-sm">Add Comment</h4>
          {position && (
            <span className="text-xs text-gray-400">
              Position: ({position.x}, {position.y})
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="finding">Finding</SelectItem>
              <SelectItem value="recommendation">Recommendation</SelectItem>
              <SelectItem value="question">Question</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <label htmlFor="private" className="text-sm text-white">
              Private
            </label>
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setContent(e.target.value)
          }
          placeholder="Enter your comment..."
          className="min-h-[80px] bg-gray-600 border-gray-500 text-white placeholder-gray-400"
        />

        <div className="flex gap-2">
          <Button
            onClick={handleAdd}
            disabled={!content.trim()}
            size="sm"
            className="flex-1"
          >
            <Send className="h-3 w-3 mr-1" />
            Add Comment
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
