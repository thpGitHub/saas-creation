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
      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-cartoon-dark rounded-cartoon p-8 bg-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 bg-cartoon-bg rounded-full border-2 border-cartoon-dark flex items-center justify-center shadow-cartoon">
            <span className="text-cartoon-dark text-2xl font-bold">📝</span>
          </div>
          <p className="text-cartoon-dark font-bold">Aucun post publié</p>
          <p className="text-sm text-gray-500 mt-2">Créez votre premier post pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div 
          key={post.id} 
          className={`post-card hover:translate-y-[-2px] transition-all duration-300 ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'}`}
        >
          <div className="post-header">
            <h3 className="post-title">{post.title}</h3>
            <span className="badge-published float-right">LinkedIn</span>
          </div>
          <p className="post-content whitespace-pre-wrap">{post.content}</p>
          <div className="text-sm text-cartoon-blue mt-3 font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Publié le {new Date(post.publishedAt).toLocaleString('fr-FR')}
          </div>
        </div>
      ))}
    </div>
  );
} 