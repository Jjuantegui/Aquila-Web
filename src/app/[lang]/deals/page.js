import DealsView from '../../../components/deals/DealsView';
import { getDictionary, alternatesFor } from '../../../i18n';

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const dict = getDictionary(lang);
    return {
        title: { absolute: dict.meta.deals.title },
        description: dict.meta.deals.description,
        alternates: alternatesFor('/deals'),
    };
}

export default async function DealsPage({ params }) {
    const { lang } = await params;
    const dict = getDictionary(lang);
    return <DealsView lang={lang} dict={dict} />;
}
