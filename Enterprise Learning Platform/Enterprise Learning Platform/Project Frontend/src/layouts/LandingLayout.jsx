import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * Layout wrapper for the public landing page.
 */
export default function LandingLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
