// app/dashboard/posts/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../../lib/supabase'; // Adjust path if needed
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaSave,
  FaPaperPlane,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowLeft,
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Define the validation schema using Zod (same as new post page)
const postSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long.' }),
  slug: z
    .string()
    .min(3, 'Slug is required.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (e.g., 'my-first-post')."
    ),
  content: z.string().min(10, { message: 'Content is too short.' }).optional(),
  excerpt: z.string().optional(),
  cover_image_url: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .or(z.literal('')),
  tags: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

// Infer the TypeScript type from the schema
type PostFormData = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, dirtyFields }, // Get dirtyFields to check for manual slug edits
    reset, // Use reset to populate form
    setValue,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  // Auto-generate slug from title, but only if the user hasn't manually edited the slug
  useEffect(() => {
    if (!dirtyFields.slug) {
      const newSlug = postTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single
      setValue('slug', newSlug, { shouldValidate: true });
    }
  }, [postTitle, setValue, dirtyFields.slug]);

  // Fetch existing post data
  const fetchPost = useCallback(async () => {
    if (!postId) return;
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !data) {
      setFormError('Could not fetch post data. It might not exist.');
      console.error('Error fetching post:', error);
    } else {
      // Populate the form with the fetched data
      const tagsString = Array.isArray(data.tags) ? data.tags.join(', ') : '';
      setPostTitle(data.title);
      reset({
        ...data,
        tags: tagsString,
      });
      setIsPublished(data.is_published);
    }
    setIsLoadingData(false);
  }, [postId, reset]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const onSubmit: SubmitHandler<PostFormData> = async (data, event) => {
    const submitter = (event?.nativeEvent as SubmitEvent).submitter;
    const isPublishing = submitter?.id === 'publish-button';
    const isUnpublishing = submitter?.id === 'unpublish-button';

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    // Determine the new published state
    let newPublishedState = isPublished;
    if (isPublishing) newPublishedState = true;
    if (isUnpublishing) newPublishedState = false;

    const { data: updatedData, error } = await supabase
      .from('posts')
      .update({
        ...data,
        tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : [],
        is_published: newPublishedState,
        published_at: newPublishedState ? new Date().toISOString() : null,
        // updated_at can be handled by a database trigger or manually:
        // updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      setFormError(`Failed to update post: ${error.message}`);
    } else {
      setFormSuccess(
        `Post "${updatedData.title}" has been updated successfully!`
      );
      setIsPublished(updatedData.is_published);
      // Optional: Redirect after a delay
      setTimeout(() => {
        router.push('/dashboard/posts');
      }, 2000);
    }

    setIsSubmitting(false);
  };

  if (isLoadingData) {
    return (
      <div className='flex items-center justify-center h-full'>
        <FaSpinner className='animate-spin text-accent text-3xl' />
        <span className='ml-3 text-lg text-primary-text/80'>
          Loading Post Editor...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold font-serif text-accent'>
            Edit Post
          </h1>
          <p className='text-primary-text/70 mt-1'>
            Modify the details of your article below.
          </p>
        </div>
        <Link
          href='/dashboard/posts'
          className='flex items-center gap-2 text-sm text-accent hover:underline'
        >
          <FaArrowLeft />
          Back to Posts
        </Link>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6 bg-secondary-background p-6 rounded-lg shadow-lg'
      >
        {/* --- Form fields are identical to the 'new' page form --- */}
        <div>
          <label
            htmlFor='title'
            className='block text-sm font-medium text-primary-text/80 mb-1'
          >
            Title
          </label>
          <input
            id='title'
            {...register('title')}
            className='form-input'
            placeholder='Your Amazing Post Title'
            value={postTitle}
            onChange={(e) => {
              setPostTitle(e.target.value);
              setValue('title', e.target.value, { shouldValidate: true });
            }}
          />
          {errors.title && (
            <p className='text-red-400 text-xs mt-1'>{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='slug'
            className='block text-sm font-medium text-primary-text/80 mb-1'
          >
            URL Slug
          </label>
          <input
            id='slug'
            {...register('slug')}
            className='form-input'
            placeholder='your-amazing-post-title'
          />
          {errors.slug && (
            <p className='text-red-400 text-xs mt-1'>{errors.slug.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='content'
            className='block text-sm font-medium text-primary-text/80 mb-1'
          >
            Content (Markdown)
          </label>
          <Controller
            name='content'
            control={control}
            render={({ field }) => (
              <div className='bg-gray-900 rounded-md' data-color-mode='dark'>
                <MDEditor height={400} {...field} />
              </div>
            )}
          />
          {errors.content && (
            <p className='text-red-400 text-xs mt-1'>
              {errors.content.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='excerpt'
            className='block text-sm font-medium text-primary-text/80 mb-1'
          >
            Excerpt
          </label>
          <textarea
            id='excerpt'
            {...register('excerpt')}
            rows={3}
            className='form-textarea'
            placeholder='A short, catchy summary for post previews.'
          />
        </div>

        <details className='bg-black/10 p-4 rounded-lg'>
          <summary className='cursor-pointer text-sm font-medium text-primary-text/90'>
            Optional: Cover Image, Tags & SEO
          </summary>
          <div className='space-y-4 mt-4'>
            <div>
              <label
                htmlFor='cover_image_url'
                className='block text-sm font-medium text-primary-text/80 mb-1'
              >
                Cover Image URL
              </label>
              <input
                id='cover_image_url'
                {...register('cover_image_url')}
                className='form-input'
                placeholder='https://example.com/image.jpg'
              />
              {errors.cover_image_url && (
                <p className='text-red-400 text-xs mt-1'>
                  {errors.cover_image_url.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor='tags'
                className='block text-sm font-medium text-primary-text/80 mb-1'
              >
                Tags (comma-separated)
              </label>
              <input
                id='tags'
                {...register('tags')}
                className='form-input'
                placeholder='e.g., Egyptology, Research, History'
              />
            </div>
            <div>
              <label
                htmlFor='meta_title'
                className='block text-sm font-medium text-primary-text/80 mb-1'
              >
                Meta Title (SEO)
              </label>
              <input
                id='meta_title'
                {...register('meta_title')}
                className='form-input'
                placeholder='Custom title for search engines'
              />
            </div>
            <div>
              <label
                htmlFor='meta_description'
                className='block text-sm font-medium text-primary-text/80 mb-1'
              >
                Meta Description (SEO)
              </label>
              <textarea
                id='meta_description'
                {...register('meta_description')}
                rows={2}
                className='form-textarea'
                placeholder='Custom description for search engines'
              />
            </div>
          </div>
        </details>

        {/* --- Feedback Messages --- */}
        <AnimatePresence>
          {formError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='text-sm text-red-400 bg-red-500/10 p-3 rounded-md flex items-center gap-2'
            >
              <FaExclamationTriangle /> {formError}
            </motion.p>
          )}
          {formSuccess && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='text-sm text-green-300 bg-green-500/10 p-3 rounded-md flex items-center gap-2'
            >
              <FaCheckCircle /> {formSuccess}
            </motion.p>
          )}
        </AnimatePresence>

        {/* --- Action Buttons --- */}
        <div className='flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-700'>
          <button
            type='submit'
            id='save-button'
            disabled={isSubmitting}
            className='w-full flex items-center justify-center gap-2 py-2.5 px-6 border border-accent/50 rounded-lg text-sm font-semibold text-accent hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
          >
            {isSubmitting ? <FaSpinner className='animate-spin' /> : <FaSave />}
            Save Changes
          </button>
          {isPublished ? (
            <button
              type='submit'
              id='unpublish-button'
              disabled={isSubmitting}
              className='w-full flex items-center justify-center gap-2 py-2.5 px-6 border border-yellow-500/50 rounded-lg text-sm font-semibold text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
            >
              {isSubmitting ? (
                <FaSpinner className='animate-spin' />
              ) : (
                <FaPaperPlane />
              )}
              Convert to Draft
            </button>
          ) : (
            <button
              type='submit'
              id='publish-button'
              disabled={isSubmitting}
              className='w-full flex items-center justify-center gap-2 py-2.5 px-6 border border-transparent rounded-lg text-sm font-semibold text-white bg-accent hover:bg-opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
            >
              {isSubmitting ? (
                <FaSpinner className='animate-spin' />
              ) : (
                <FaPaperPlane />
              )}
              Publish Post
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
