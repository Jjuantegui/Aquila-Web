import ServicesDetailed from '../../../components/services/ServicesDetailed';
import { getDictionary, alternatesFor } from '../../../i18n';

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const dict = getDictionary(lang);
    return {
        title: { absolute: dict.meta.services.title },
        description: dict.meta.services.description,
        alternates: alternatesFor('/services'),
    };
}

export default async function ServicesPage({ params }) {
    const { lang } = await params;
    const dict = getDictionary(lang);
    return (
        <main style={{ paddingTop: '6rem', minHeight: '100vh', backgroundColor: 'var(--color-aquila-beige)' }}>
            <ServicesDetailed lang={lang} dict={dict.services} />
        </main>
    );
}
