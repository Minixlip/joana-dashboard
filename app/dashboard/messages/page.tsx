// app/dashboard/messages/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase'; // Adjust path if needed
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSpinner,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns'; // For user-friendly dates

// Define the type for a message object
interface Message {
  id: number;
  created_at: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
}

// A separate component for the message detail modal
const MessageDetailModal = ({
  message,
  onClose,
}: {
  message: Message;
  onClose: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black z-50 flex items-center justify-center p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className='bg-secondary-background w-full max-w-2xl rounded-xl shadow-2xl p-6 sm:p-8 relative'
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <motion.button
          whileHover={{ color: 'white' }}
          transition={{
            ease: 'easeInOut',
            duration: 3,
          }}
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-accent transition-colors cursor-pointer'
        >
          <FaTimes size={20} />
        </motion.button>
        <div className='border-b border-gray-700 pb-4 mb-4'>
          <h3 className='text-xl font-bold text-accent'>
            {message.subject || '(No Subject)'}
          </h3>
          <p className='text-sm text-primary-text/80 mt-1'>
            From:{' '}
            <span className='font-medium text-primary-text'>
              {message.name}
            </span>{' '}
            ({message.email})
          </p>
          <p className='text-xs text-gray-400 mt-1'>
            Received: {new Date(message.created_at).toLocaleString()}
          </p>
        </div>
        <div className='prose prose-sm prose-invert max-w-none max-h-[60vh] overflow-y-auto custom-scrollbar pr-2'>
          {/* Using prose classes to style the message content for readability */}
          <p>{message.message}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      setError(
        'Could not fetch messages. Please check your connection and RLS policies.'
      );
    } else {
      setMessages((data as Message[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this message? This action cannot be undone.'
      )
    ) {
      const { error } = await supabase.from('messages').delete().eq('id', id);

      if (error) {
        console.error('Error deleting message:', error);
        alert('Could not delete the message. Please try again.');
      } else {
        // Remove the message from the local state to update the UI instantly
        setMessages((currentMessages) =>
          currentMessages.filter((msg) => msg.id !== id)
        );
      }
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <FaSpinner className='animate-spin text-accent text-3xl' />
        <span className='ml-3 text-lg text-primary-text/80'>
          Loading Messages...
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence>
        {selectedMessage && (
          <MessageDetailModal
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
          />
        )}
      </AnimatePresence>

      <header className='mb-8'>
        <h1 className='text-3xl font-bold font-serif text-accent'>
          Contact Messages
        </h1>
        <p className='text-primary-text/70 mt-1'>
          Review and manage submissions from your public website.
        </p>
      </header>

      <div className='bg-secondary-background shadow-lg rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          {messages.length > 0 ? (
            <table className='min-w-full divide-y divide-gray-700'>
              <thead className='bg-gray-800/50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                  >
                    From
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                  >
                    Subject
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                  >
                    Received
                  </th>
                  <th scope='col' className='relative px-6 py-3'>
                    <span className='sr-only'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-700'>
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className='hover:bg-accent/5 cursor-pointer transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-primary-text'>
                        {message.name}
                      </div>
                      <div className='text-sm text-gray-400'>
                        {message.email}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-primary-text/90'>
                      {message.subject || (
                        <span className='italic text-gray-500'>No Subject</span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-400'>
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent modal from opening when deleting
                          handleDelete(message.id);
                        }}
                        className='p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer'
                        title='Delete Message'
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className='text-center text-gray-400 py-16'>
              You have no messages yet.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
