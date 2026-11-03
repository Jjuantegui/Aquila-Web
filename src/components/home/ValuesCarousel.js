import Ribbon from '../motion/Ribbon';

// Cinta de valores (reel B), Playfair itálica salvia sobre verde profundo. Mismo contenido que el carrusel anterior;
// se pausa al pasar el ratón y queda estática con movimiento reducido.
const ValuesCarousel = ({ values = [] }) => <Ribbon items={values} size="large" />;

export default ValuesCarousel;
