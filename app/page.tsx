import { redirect } from 'next/navigation';

export default function Home() {
  // Permanently redirect to the dashboard
  redirect('/dashboard');
}
