import type { Comment } from '@/lib/types';

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-gray-500 mb-6">ยังไม่มีความคิดเห็น</p>;
  }

  return (
    <ul className="space-y-3 mb-6">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-medium text-sm">{comment.authorName}</span>
            <time className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {comment.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
