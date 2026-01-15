import ServicesDetailed from '../../components/services/ServicesDetailed';

export const metadata = {
    title: 'Our Services | Aquila Sports Management',
    description: 'Comprehensive representation, intermediation, and sponsorship services for elite football professionals.',
};

export default function ServicesPage() {
    return (
        <main style={{ paddingTop: '6rem', minHeight: '100vh', backgroundColor: 'var(--color-aquila-beige)' }}>
            <ServicesDetailed />
        </main>
    );
}
