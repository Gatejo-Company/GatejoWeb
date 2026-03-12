import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-gray-500">Page not found.</p>
      <Link to="/" className="mt-6 text-indigo-600 hover:underline">
        Back to Dashboard
      </Link>
    </div>
  );
}
