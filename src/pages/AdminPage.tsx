import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin/login');
      } else if (location.pathname === '/admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
}
