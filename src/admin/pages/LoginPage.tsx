import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleForgot() {
    if (!email.trim()) {
      setError('Type your email above first, then tap "Forgot password?".');
      return;
    }
    // TODO: Firebase — sendPasswordResetEmail(auth, email)
    setError('');
    setResetSent(true);
  }

  const inputClass =
    'mt-2 block w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="text-center text-2xl font-extrabold uppercase tracking-tight text-primary">VendorLift</p>
        <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-ink/60">Owner dashboard</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-ink">Email</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-ink">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </div>

            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {resetSent && <p role="status" className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">If that email has an account, a reset link is on its way.</p>}

            <button type="submit" disabled={loading} className="w-full rounded-full bg-primary px-6 py-3.5 font-semibold text-white transition hover:bg-accent hover:text-ink disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <button type="button" onClick={handleForgot} className="mt-4 w-full text-center text-sm font-medium text-primary hover:underline">
            Forgot password?
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-ink/50">There is no public sign-up. Ask your developer for access.</p>
      </div>
    </div>
  );
}