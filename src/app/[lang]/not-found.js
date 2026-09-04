import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container section" style={{ textAlign: 'center', minHeight: '50vh' }}>
            <h1 style={{ color: 'var(--color-aquila-green)', fontSize: '2rem', marginBottom: '1rem' }}>404</h1>
            <p style={{ marginBottom: '2rem' }}>Page not found · Página no encontrada</p>
            <Link href="/" className="btn btn-primary">Home / Inicio</Link>
        </div>
    );
}
