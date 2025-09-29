import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter, ShoppingBag, BarChart3, Globe, ShieldCheck, Mail, Phone, MapPin, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";

// Mock Data for Vistula Global Capital
const VGC_DATA = {
    FIRM_NAME: "Vistula Global Capital",
    TAGLINE: "Strategic Asset Allocation to the World.",
    ABOUT: {
        TITLE: "Our Foundation: Expertise & Global Reach",
        P1: "Vistula Global Capital (VGC) is a boutique portfolio management firm based in Warsaw, Poland, committed to delivering superior, risk-adjusted returns for high-net-worth individuals and institutional clients globally. Founded in 2018, our investment philosophy is rooted in rigorous quantitative analysis and a deep understanding of geopolitical risk.",
        P2: "We specialize in diversified global equity, fixed income, and alternative asset strategies. Our team leverages advanced macroeconomic models to identify secular growth trends, ensuring our portfolios are resilient across various market cycles."
    },
    METRICS: [
        { value: "€5.2B", label: "Assets Under Management", description: "Across global equity and fixed income mandates." },
        { value: "+14.8%", label: "Average Annual Return (5Y)", description: "Net of fees, compared to a blended benchmark." },
        { value: "40+", label: "Countries Invested", description: "Diversification across developed and emerging markets." },
        { value: "AA-", label: "Risk Rating (Internal)", description: "Commitment to capital preservation and stability." },
    ],
    PORTFOLIO_FOCUS: [
        { title: "Global Equity", icon: Globe, description: "Exposure to high-growth sectors across North America, Europe, and Asia." },
        { title: "Emerging Markets", icon: BarChart3, description: "Targeted investments in rapidly developing economies with strong fundamentals." },
        { title: "Fixed Income & Hedging", icon: ShieldCheck, description: "Utilizing derivatives and treasury bonds for stability and downside protection." },
    ],
    CONTACT: {
        ADDRESS: "Złota 44, 00-120 Warszawa, Polska",
        EMAIL: "inquire@vistulaglobal.com",
        PHONE: "+48 22 123 4567"
    }
};

// --- Custom Tailwind Configuration (Simulating shadcn/ui variables) ---
// Using specific Tailwind classes to define a corporate aesthetic.
// NOTE: Tailwind does not recognize interpolated strings (e.g., `text-${primary}`) in production/build environments.
// We replace the variable usage with the hardcoded class names for proper compilation.

const primary = 'indigo-700';
const primaryHover = 'indigo-800';
const accent = 'amber-400';
const background = 'gray-50';
const muted = 'gray-100';
const foreground = 'gray-900';
const mutedForeground = 'gray-500';

// --- Components ---

// 1. Navigation Component
const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navItems = [
        { name: "Home", href: "#home" },
        { name: "Firm", href: "#about" },
        { name: "Portfolio", href: "#portfolio" },
        { name: "Metrics", href: "#metrics" },
        { name: "Contact", href: "#contact" },
    ];

    return (
        <nav className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Name */}
                    <div className="flex-shrink-0">
                        {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                        <span className={`text-2xl font-bold text-indigo-700 tracking-tight`}>
                            VGC
                        </span>
                        <span className="text-sm font-light text-gray-500 ml-1 hidden sm:inline"> | Global Portfolio Management</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:space-x-8 items-center">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                // Corrected: Replaced hover:text-${primary} with hover:text-indigo-700
                                className={`text-base font-medium text-gray-600 hover:text-indigo-700 transition-colors`}
                            >
                                {item.name}
                            </a>
                        ))}
                        <Link
                            to="/login"
                            // Corrected: Replaced bg-${primary} and hover:bg-${primaryHover} with hardcoded classes
                            // This is where the text color (text-white) was conflicting due to the dynamic class not being picked up.
                            className={`px-4 py-2 text-sm font-semibold bg-indigo-700 text-white rounded-full hover:bg-indigo-800 transition-colors shadow-lg`}
                        >
                            Client Login
                        </Link>
                        <Link
                            to="/register"
                            // Corrected: Replaced bg-${primary} and hover:bg-${primaryHover} with hardcoded classes
                            // This is where the text color (text-white) was conflicting due to the dynamic class not being picked up.
                            className={`px-4 py-2 text-sm font-semibold bg-indigo-700 text-white rounded-full hover:bg-indigo-800 transition-colors shadow-lg`}
                        >
                            Register
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-700" // Added focus:ring-indigo-700
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {isOpen && (
                <div className="md:hidden bg-white shadow-lg border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                // Corrected: Replaced hover:text-${primary} with hover:text-indigo-700
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
                            >
                                {item.name}
                            </a>
                        ))}
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            // Corrected: Replaced bg-${primary} and hover:bg-${primaryHover} with hardcoded classes
                            className={`block px-3 py-2 mt-2 rounded-md text-base font-medium bg-indigo-700 text-white text-center hover:bg-indigo-800`}
                        >
                            Client Login
                        </Link>
                        <Link
                            to="/register"
                            onClick={() => setIsOpen(false)}
                            // Corrected: Replaced bg-${primary} and hover:bg-${primaryHover} with hardcoded classes
                            className={`block px-3 py-2 mt-2 rounded-md text-base font-medium bg-indigo-700 text-white text-center hover:bg-indigo-800`}
                        >
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

// 2. Hero Section Component
const HeroSection = () => (
    // Corrected: Replaced bg-${background} with bg-gray-50
    <div className={`pt-20 pb-28 bg-gray-50 relative overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Corrected: Replaced text-${foreground} with text-gray-900 */}
            <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900`}>
                {VGC_DATA.FIRM_NAME}:
                {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                <span className={`block mt-3 text-4xl md:text-5xl text-indigo-700`}>
                    {VGC_DATA.TAGLINE}
                </span>
            </h1>
            {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
            <p className={`mt-6 max-w-2xl mx-auto text-xl text-gray-500`}>
                We build and manage sophisticated investment portfolios tailored to the unique goals of global investors, leveraging over a decade of experience in strategic cross-market allocation.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                    to="/login"
                    // Corrected: Replaced bg-${primary} and hover:bg-${primaryHover} with hardcoded classes
                    className={`inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-lg shadow-xl text-white bg-indigo-700 hover:bg-indigo-800 transition-colors`}
                >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <a
                    href="#about"
                    // Corrected: Replaced border-${primary}, text-${primary} and hover:bg-${muted} with hardcoded classes
                    className={`inline-flex items-center justify-center px-8 py-4 border-2 border-indigo-700 text-base font-semibold rounded-lg text-indigo-700 bg-white hover:bg-gray-100 transition-colors`}
                >
                    Explore Our Strategy
                </a>
            </div>
        </div>
    </div>
);

// 3. About/Firm Section Component (using ProfileSection slot)
const FirmSection = () => (
    <div className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-6">
                    {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                    <h2 className={`text-base font-semibold leading-7 text-indigo-700 uppercase`}>
                        About VGC
                    </h2>
                    {/* Corrected: Replaced text-${foreground} with text-gray-900 */}
                    <p className={`mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl`}>
                        {VGC_DATA.ABOUT.TITLE}
                    </p>
                </div>
                <div className="mt-8 lg:mt-0 lg:col-span-6 space-y-6">
                    {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                    <p className={`text-lg leading-8 text-gray-500`}>
                        {VGC_DATA.ABOUT.P1}
                    </p>
                    {/* Corrected: Replaced text-${mutedForeground} and border-${accent} with hardcoded classes */}
                    <p className={`text-lg leading-8 text-gray-500 border-l-4 pl-4 border-amber-400`}>
                        {VGC_DATA.ABOUT.P2}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

// 4. Portfolio Section Component (Focus/Strategy)
const PortfolioSection = () => (
    // Corrected: Replaced bg-${muted} with bg-gray-100
    <div className={`py-24 sm:py-32 bg-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
            <h2 className={`text-base font-semibold leading-7 text-indigo-700 uppercase`}>
                Investment Pillars
            </h2>
            {/* Corrected: Replaced text-${foreground} with text-gray-900 */}
            <p className={`mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl`}>
                Our Core Investment Strategies
            </p>
            {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
            <p className={`mt-4 text-xl text-gray-500 max-w-3xl mx-auto`}>
                We manage capital across multiple distinct strategies designed to meet diverse risk profiles and return objectives.
            </p>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                {VGC_DATA.PORTFOLIO_FOCUS.map((item, index) => (
                    <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                        {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                        <item.icon className={`h-10 w-10 mx-auto text-indigo-700 mb-4`} />
                        {/* Corrected: Replaced text-${foreground} with text-gray-900 */}
                        <h3 className={`text-xl font-semibold text-gray-900 mb-3`}>{item.title}</h3>
                        {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                        <p className={`text-base text-gray-500`}>{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// 5. Metrics Section Component
const MetricsSection = () => (
    <div className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                <h2 className={`text-base font-semibold leading-7 text-indigo-700 uppercase`}>
                    Performance Snapshot
                </h2>
                {/* Corrected: Replaced text-${foreground} with text-gray-900 */}
                <p className={`mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl`}>
                    Quantifiable Trust and Results
                </p>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-b border-gray-200 py-10">
                {VGC_DATA.METRICS.map((metric, index) => (
                    <div key={index} className="text-center">
                        {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                        <p className={`text-4xl md:text-5xl font-extrabold text-indigo-700 tracking-tight`}>
                            {metric.value}
                        </p>
                        {/* Corrected: Replaced text-${foreground} with text-gray-900 */}
                        <p className={`mt-2 text-lg font-medium text-gray-900`}>{metric.label}</p>
                        {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                        <p className={`text-sm text-gray-500 mt-1`}>{metric.description}</p>
                    </div>
                ))}
            </div>
            <p className={`mt-10 text-center text-sm text-gray-500 italic`}>
                *Past performance is not indicative of future results. Disclosures available upon request.
            </p>
        </div>
    </div>
);

// 6. Testimonials Section Component (Included for completeness)
const TestimonialsSection = () => {
    const testimonial = {
        quote: "Since partnering with VGC, our foundation's endowment has achieved consistent growth with significantly optimized risk exposure. Their team's diligence and clear communication set them apart.",
        name: "Dr. Anna Kowalczyk",
        title: "Director, European Endowment Fund"
    };
    
    return (
        // Corrected: Replaced bg-${muted} with bg-gray-100
        <div className={`py-24 sm:py-32 bg-gray-100`}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                    <h2 className={`text-base font-semibold leading-7 text-indigo-700 uppercase`}>
                        Client Confidence
                    </h2>
                    <blockquote className="mt-6">
                        {/* Corrected: Replaced text-${foreground} with text-gray-900 */}
                        <p className={`text-2xl font-medium text-gray-900 leading-relaxed italic`}>
                            "{testimonial.quote}"
                        </p>
                        <footer className="mt-6">
                            {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                            <p className={`text-lg font-semibold text-indigo-700`}>{testimonial.name}</p>
                            {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                            <p className={`text-base text-gray-500`}>{testimonial.title}</p>
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}

// 7. Contact Section Component
const ContactSection = () => (
    <div className="py-24 sm:py-32 bg-white" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                <div className="lg:col-span-1 mb-10 lg:mb-0">
                    {/* Corrected: Replaced text-${foreground} with text-gray-900 */}
                    <h2 className={`text-3xl font-bold tracking-tight text-gray-900`}>
                        Connect with Our Team
                    </h2>
                    {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                    <p className={`mt-4 text-lg text-gray-500`}>
                        Schedule a private consultation to discuss your strategic investment needs.
                    </p>
                    <div className="mt-8 space-y-6">
                        <div className="flex items-start">
                            {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                            <Mail className={`h-6 w-6 flex-shrink-0 text-indigo-700 mr-3`} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Email</h3>
                                {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                                <p className={`text-gray-500`}>{VGC_DATA.CONTACT.EMAIL}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                            <Phone className={`h-6 w-6 flex-shrink-0 text-indigo-700 mr-3`} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Phone (Warsaw)</h3>
                                {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                                <p className={`text-gray-500`}>{VGC_DATA.CONTACT.PHONE}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            {/* Corrected: Replaced text-${primary} with text-indigo-700 */}
                            <MapPin className={`h-6 w-6 flex-shrink-0 text-indigo-700 mr-3`} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Headquarters</h3>
                                {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                                <p className={`text-gray-500`}>{VGC_DATA.CONTACT.ADDRESS}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Simple Contact Form Placeholder */}
                <div className="lg:col-span-2 bg-gray-50 p-8 rounded-xl shadow-lg border border-gray-100">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <input
                                type="text"
                                placeholder="Your Full Name"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <input
                                type="email"
                                placeholder="Your Corporate Email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Subject of Inquiry (e.g., Institutional Mandate)"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <textarea
                            placeholder="How can VGC assist your portfolio objectives?"
                            rows="5"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>
                        <button
                            type="submit"
                            // Corrected: Replaced bg-${primary} and hover:bg-${primaryHover} with hardcoded classes
                            className={`w-full py-3 text-base font-semibold rounded-lg text-white bg-indigo-700 hover:bg-indigo-800 transition-colors shadow-md`}
                        >
                            Submit Inquiry
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
);

// 8. Main Component
const HomePage = () => {
    // Style for the primary text that looks like a gradient/highlight
    // The variables are now only used for the gradient-text inline style, which is fine since it's inside `style jsx global`.
    // Corrected the inline variable use here as well, though the global style block is the primary fix.
    // The gradientText string still uses interpolation, which is fine for the CSS-in-JS block, but not for direct Tailwind classes.
    const gradientText = `text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-amber-400`;

    return (
        // Corrected: Replaced bg-${background} with bg-gray-50
        <div className={`min-h-screen bg-gray-50 font-inter`}>
            {/* Tailwind utility class setup */}
            <style jsx global>{`
                .gradient-text {
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-image: linear-gradient(to right, #4F46E5, #FBBF24); /* Indigo-700 (#4F46E5) to Amber-400 (#FBBF24) */
                }
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
            
            <Navigation />

            <main className="overflow-hidden">
                <section id="home">
                    <HeroSection />
                </section>

                <section id="about">
                    <FirmSection />
                </section>

                <section id="metrics">
                    <MetricsSection />
                </section>
                
                <section id="portfolio">
                    <PortfolioSection />
                </section>
                
                <section id="testimonials">
                    <TestimonialsSection />
                </section>

                <section id="contact">
                    <ContactSection />
                </section>

                {/* Client Portal Button Section (Replaces 'Shop' button) */}
                {/* Corrected: Replaced bg-${primary} with bg-indigo-700 */}
                <section className={`py-20 text-center bg-indigo-700`}>
                    <h3 className="text-3xl font-bold text-white mb-6">
                        Ready to Partner with Vistula Global Capital?
                    </h3>
                    <Link
                        to="/dashboard"
                        // Corrected: Replaced text-${primary} with text-indigo-700
                        className={`inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-indigo-700 font-bold hover:bg-gray-100 transition-colors shadow-2xl text-lg`}
                    >
                        <ShoppingBag size={20} /> {/* Using ShoppingBag as a generic "Access" icon */}
                        Access Client Portal
                    </Link>
                </section>
            </main>

            {/* Footer */}
            <footer className={`border-t border-gray-200 py-12 bg-white`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mb-6">
                            {/* Kept gradientText which uses the global style block */}
                            <h3 className={`font-extrabold text-3xl mb-2 gradient-text`}>Vistula Global Capital</h3>
                            {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                            <p className={`text-gray-500`}>Strategic Asset Management | Warsaw, Poland</p>
                        </div>

                        {/* Footer Links */}
                        <div className="flex flex-wrap justify-center space-x-6 sm:space-x-10 mb-8">
                            <a
                                href="#"
                                // Corrected: Replaced text-${mutedForeground} and hover:text-${primary} with hardcoded classes
                                className={`text-gray-500 hover:text-indigo-700 transition-colors font-medium text-sm`}
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="#"
                                // Corrected: Replaced text-${mutedForeground} and hover:text-${primary} with hardcoded classes
                                className={`text-gray-500 hover:text-indigo-700 transition-colors font-medium text-sm`}
                            >
                                Terms of Service
                            </a>
                            <a
                                href="#contact"
                                // Corrected: Replaced text-${mutedForeground} and hover:text-${primary} with hardcoded classes
                                className={`text-gray-500 hover:text-indigo-700 transition-colors font-medium text-sm`}
                            >
                                Investor Relations
                            </a>
                            <a
                                href="/careers"
                                // Corrected: Replaced text-${mutedForeground} and hover:text-${primary} with hardcoded classes
                                className={`text-gray-500 hover:text-indigo-700 transition-colors font-medium text-sm`}
                            >
                                Careers
                            </a>
                        </div>

                        {/* Social Icons */}
                        <div className="flex justify-center space-x-6 mb-6">
                            <a
                                href="#"
                                // Corrected: Replaced text-${mutedForeground} and hover:text-${primary} with hardcoded classes
                                className={`text-gray-500 hover:text-indigo-700 transition-colors`}
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={22} />
                            </a>
                            <a
                                href="#"
                                // Corrected: Replaced text-${mutedForeground} and hover:text-${primary} with hardcoded classes
                                className={`text-gray-500 hover:text-indigo-700 transition-colors`}
                                aria-label="Twitter"
                            >
                                <Twitter size={22} />
                            </a>
                            <a
                                href="#"
                                // Corrected: Replaced text-${mutedForeground} and hover:text-${primary} with hardcoded classes
                                className={`text-gray-500 hover:text-indigo-700 transition-colors`}
                                aria-label="Global Research"
                            >
                                <Globe size={22} />
                            </a>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            {/* Corrected: Replaced text-${mutedForeground} with text-gray-500 */}
                            <p className={`text-sm text-gray-500`}>
                                © {new Date().getFullYear()} Vistula Global Capital. All rights reserved. Registered in Poland.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;