/** Se muestra con token/cookie inválidos: no se anuncia que el panel existe. */
export default function NotFound() {
    return (
        <div className="container" style={{ textAlign: "center", minHeight: "50vh", paddingTop: "4rem" }}>
            <h1 style={{ fontFamily: "var(--font-playfair)", color: "var(--color-aquila-green)", fontSize: "2rem", marginBottom: "1rem" }}>
                404
            </h1>
            <p>Page not found · Página no encontrada</p>
        </div>
    );
}
