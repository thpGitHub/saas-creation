interface Post {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  network: string;
}

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun post publié
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{post.title}</h3>
            <span className="text-sm text-blue-600">{post.network}</span>
          </div>
          <p className="text-gray-600 mb-2">{post.content}</p>
          <div className="text-sm text-gray-500">
            Publié le {new Date(post.publishedAt).toLocaleString('fr-FR')}
          </div>
        </div>
      ))}
    </div>
  );
} 