import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Plus, BookOpen, Edit, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BlogList() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Blog & SEO</h1>
        <Link 
          href="/admin/blog/new"
          className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-sky-700 transition-colors"
        >
          <Plus size={18} />
          Créer un article
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center">
            <BookOpen size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">Aucun article de blog</p>
            <p>Commencez à écrire pour attirer plus de visiteurs via Google.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    <div className="text-xs text-gray-500">/blog/{post.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                    <a href={`/fr/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-sky-600">
                      <Eye size={18} />
                    </a>
                    <Link href={`/admin/blog/${post.id}`} className="text-gray-400 hover:text-indigo-600">
                      <Edit size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
