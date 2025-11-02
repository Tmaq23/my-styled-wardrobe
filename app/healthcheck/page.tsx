export const dynamic = 'force-static';

export default function HealthcheckPage() {
  return (
    <main style={{fontFamily:'sans-serif',padding:'2rem'}}>
      <h1>Healthcheck</h1>
      <p>Status: OK (static page rendered)</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </main>
  );
}
