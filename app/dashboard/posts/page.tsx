// app/dashboard/posts/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // Adjust path if needed
import { motion } from 'framer-motion';
import {
  FaSpinner,
  FaEdit,
  FaTrash,
  FaPlus,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { format } from 'date-fns'; // For consistent date formatting

// Define the type for a post object in the dashboard
interface Post {
  id: string; // Assuming you use UUIDs
  created_at: string;
  title: string;
  is_published: boolean;
  published_at: string | null;
  slug: string;
}

export default function PostsListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch ALL posts, not just published ones
    const { data, error } = await supabase
      .from('posts')
      .select('id, created_at, title, is_published, published_at, slug')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      setError(
        'Could not fetch blog posts. Your RLS policies should allow selecting posts if you are logged in.'
      );
    } else {
      setPosts((data as Post[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (id: string, title: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the post titled "${title}"?`
      )
    ) {
      const { error } = await supabase.from('posts').delete().eq('id', id);

      if (error) {
        console.error('Error deleting post:', error);
        alert('Could not delete the post. Please try again.');
      } else {
        // Refresh the list after successful deletion
        fetchPosts();
      }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <FaSpinner className='animate-spin text-[#bfa76f] text-3xl' />
        <span className='ml-3 text-lg text-primary-text/80'>
          Loading Posts...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-500/10 text-red-300 border border-red-500/30 p-4 rounded-md flex items-center gap-3'>
        <FaExclamationTriangle />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold font-serif text-[#bfa76f]'>
            Blog Posts
          </h1>
          <p className='text-primary-text/70 mt-1'>
            Create, edit, and manage all articles.
          </p>
        </div>
        <Link
          href='/dashboard/posts/new'
          className='inline-flex items-center gap-2 py-2 px-5 rounded-lg text-sm font-semibold text-white bg-[#bfa76f] hover:bg-opacity-85 transition-all duration-200 ease-in-out transform active:scale-95 hover:scale-105'
        >
          <FaPlus />
          Create New Post
        </Link>
      </header>

      <div className='bg-secondary-background shadow-lg rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          {posts.length > 0 ? (
            <table className='min-w-full divide-y divide-gray-700'>
              <thead className='bg-gray-800/50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                  >
                    Title
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                  >
                    Status
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                  >
                    Created
                  </th>
                  <th scope='col' className='relative px-6 py-3'>
                    <span className='sr-only'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-700'>
                {posts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    variants={tableRowVariants}
                    custom={index}
                    initial='hidden'
                    animate='visible'
                    className='hover:bg-[#bfa76f]/5 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <Link
                        href={`/dashboard/posts/edit/${post.id}`}
                        className='text-sm font-medium text-primary-text hover:text-[#bfa76f]'
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.is_published
                            ? 'bg-green-100/10 text-green-300'
                            : 'bg-yellow-100/10 text-yellow-300'
                        }`}
                      >
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-400'>
                      {format(new Date(post.created_at), 'dd MMM, yyyy')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                      <button
                        onClick={() =>
                          router.push(`/dashboard/posts/edit/${post.id}`)
                        }
                        className='p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer'
                        title='Edit Post'
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className='p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer'
                        title='Delete Post'
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className='text-center text-gray-400 py-16'>
              No blog posts found. Time to write one!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
