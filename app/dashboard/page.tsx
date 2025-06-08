// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path if needed
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaSpinner,
  FaFileAlt,
  FaCheckCircle,
  FaPencilAlt,
  FaEnvelope,
  FaPlus,
  FaArrowRight,
  FaExclamationTriangle,
} from 'react-icons/fa';

// Define the structure for our dashboard stats
interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalMessages: number;
  unreadMessages: number; // Added for unread messages
}

// A reusable component for displaying a statistic
const StatCard = ({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}) => (
  <div className='bg-[#161616] p-6 rounded-xl shadow-lg flex items-center space-x-4'>
    <div className={`p-3 rounded-full ${color}`}>
      <div className='text-white'>{icon}</div>
    </div>
    <div>
      <p className='text-sm font-medium text-primary-text/70'>{title}</p>
      <p className='text-2xl font-bold text-primary-text'>{value}</p>
    </div>
  </div>
);

export default function DashboardHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all stats in parallel for efficiency
      const [
        { count: totalPosts },
        { count: publishedPosts },
        { count: draftPosts },
        { count: totalMessages },
        { count: unreadMessages }, // Fetch unread messages
      ] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true),
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', false),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        // Query for messages where 'read' is false
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('read', false),
      ]);

      setStats({
        totalPosts: totalPosts ?? 0,
        publishedPosts: publishedPosts ?? 0,
        draftPosts: draftPosts ?? 0,
        totalMessages: totalMessages ?? 0,
        unreadMessages: unreadMessages ?? 0, // Set the unread count
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError('Could not load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <FaSpinner className='animate-spin text-accent text-3xl' />
        <span className='ml-3 text-lg text-primary-text/80'>
          Loading Dashboard...
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
    <motion.div variants={containerVariants} initial='hidden' animate='visible'>
      <motion.header variants={itemVariants} className='mb-10'>
        <h1 className='text-3xl font-bold font-serif text-[#bfa76f]'>
          Dashboard Overview
        </h1>
        <p className='text-primary-text/70 mt-1'>
          A quick look at your website&apos;s activity.
        </p>
      </motion.header>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-5'
      >
        <motion.div variants={itemVariants}>
          <StatCard
            icon={<FaEnvelope size={20} />}
            title='Unread Messages'
            value={stats?.unreadMessages ?? 0}
            color='bg-pink-500/80'
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={<FaFileAlt size={20} />}
            title='Total Posts'
            value={stats?.totalPosts ?? 0}
            color='bg-blue-500/80'
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={<FaCheckCircle size={20} />}
            title='Published Posts'
            value={stats?.publishedPosts ?? 0}
            color='bg-green-500/80'
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={<FaPencilAlt size={20} />}
            title='Drafts'
            value={stats?.draftPosts ?? 0}
            color='bg-yellow-500/80'
          />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className='text-xl font-semibold text-primary-text mb-4'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Link
            href='/dashboard/posts/new'
            className='group bg-[#161616] p-6 rounded-xl shadow-lg hover:bg-accent/10 transition-colors flex justify-between items-center'
          >
            <div>
              <h3 className='font-bold text-lg text-accent'>Create New Post</h3>
              <p className='text-sm text-primary-text/60'>
                Start writing a new article for your blog.
              </p>
            </div>
            <FaPlus className='text-accent/50 group-hover:text-accent transition-colors' />
          </Link>
          <Link
            href='/dashboard/posts'
            className='group bg-[#161616] p-6 rounded-xl shadow-lg hover:bg-accent/10 transition-colors flex justify-between items-center'
          >
            <div>
              <h3 className='font-bold text-lg text-accent'>Manage Posts</h3>
              <p className='text-sm text-primary-text/60'>
                Edit, publish, or delete existing posts.
              </p>
            </div>
            <FaArrowRight className='text-accent/50 group-hover:text-accent transition-colors' />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
