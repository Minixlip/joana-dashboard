// app/dashboard/posts/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase'; // Adjust path if needed
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaSave,
  FaPaperPlane,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import '../../../../node_modules/react-markdown/lib/index';
import dynamic from 'next/dynamic';

// Dynamically import the MDEditor to avoid SSR issues with its internal dependencies
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Define the validation schema using Zod
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
  tags: z.string().optional(), // Will be handled as comma-separated string
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

// Infer the TypeScript type from the schema
type PostFormData = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);

  // Get the current user's ID
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setAuthorId(user.id);
      }
    };
    getUser();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  // Auto-generate slug from title
  const titleValue = watch('title');
  useEffect(() => {
    if (titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [titleValue, setValue]);

  const onSubmit: SubmitHandler<PostFormData> = async (data, event) => {
    const submitter = (event?.nativeEvent as SubmitEvent).submitter;
    const isPublishing = submitter?.id === 'publish-button';

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    if (!authorId) {
      setFormError(
        'Could not identify the author. Please try logging in again.'
      );
      setIsSubmitting(false);
      return;
    }

    // Prepare the data for submission
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submissionData: any = {
      ...data,
      author_id: authorId,
      author_name: 'Joana Agostinho', // Or get from user metadata
      tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()) : [],
      is_published: isPublishing,
      published_at: isPublishing ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    };

    // **THE FIX**: If cover_image_url is empty, delete the key
    // so that Supabase applies its own default value.
    if (!submissionData.cover_image_url) {
      delete submissionData.cover_image_url;
    }

    const { data: insertedData, error } = await supabase
      .from('posts')
      .insert([submissionData])
      .select()
      .single();

    if (error) {
      setFormError(`Failed to create post: ${error.message}`);
    } else {
      setFormSuccess(
        `Post "${insertedData.title}" has been created successfully!`
      );
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/posts');
      }, 2000);
    }

    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className='mb-8'>
        <h1 className='text-3xl font-bold font-serif text-[#bfa76f]'>
          Create New Post
        </h1>
        <p className='text-primary-text/70 mt-1'>
          Fill out the details below to add a new article to your blog.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6 bg-secondary-background p-6 rounded-lg shadow-lg'
      >
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

        {/* --- More fields can be wrapped in a details/accordion for better UI --- */}
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
        {/* --- End of Optional Fields --- */}

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
            id='save-draft-button'
            disabled={isSubmitting}
            className='w-full flex items-center justify-center gap-2 py-2.5 px-6 border border-[#bfa76f]/50 rounded-lg text-sm font-semibold text-[#bfa76f] hover:bg-[#bfa76f]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
          >
            {isSubmitting ? <FaSpinner className='animate-spin' /> : <FaSave />}
            Save as Draft
          </button>
          <button
            type='submit'
            id='publish-button'
            disabled={isSubmitting}
            className='w-full flex items-center justify-center gap-2 py-2.5 px-6 border border-transparent rounded-lg text-sm font-semibold text-white bg-[#bfa76f] hover:bg-opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
          >
            {isSubmitting ? (
              <FaSpinner className='animate-spin' />
            ) : (
              <FaPaperPlane />
            )}
            Publish Post
          </button>
        </div>
      </form>
    </motion.div>
  );
}
