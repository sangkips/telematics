import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu,
    X,
    Mail,
    Phone,
    MessageCircle,
    Truck,
    Route,
    Shield,
    TrendingUp,
} from 'lucide-react';
import { Button } from './ui/button';

export const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const services = [
        {
            icon: Truck,
            title: 'Fleet Management',
            description: 'We manage your fleet for efficiency, safety, and compliance.',
        },
        {
            icon: Route,
            title: 'Logistics Optimization',
            description: 'Smart routing and planning to save time and reduce costs.',
        },
        {
            icon: Shield,
            title: 'Safety Compliance',
            description: 'Ensuring your operations meet all legal and safety standards.',
        },
        {
            icon: TrendingUp,
            title: 'Financial Advisory',
            description: 'Expert guidance to make your logistics business profitable.',
        },
    ];

    const handleAjaxSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormStatus('submitting');

        const form = e.currentTarget;
        const data = new FormData(form);

        try {
            const response = await fetch("https://formspree.io/f/xeeljykb", {
                method: "POST",
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setFormStatus('success');
                form.reset();
                setTimeout(() => setFormStatus('idle'), 5000);
            } else {
                setFormStatus('error');
            }
        } catch (error) {
            setFormStatus('error');
        }
    };

    const scrollToContact = () => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 bg-[#1a1f36]">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt="Nura Logistics"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-white text-lg font-medium">Nura Logistics Consultancy Ltd</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#home" className="text-white hover:text-gray-300 transition-colors text-sm font-medium">
                            Home
                        </a>
                        <a href="#services" className="text-white hover:text-gray-300 transition-colors text-sm font-medium">
                            Services
                        </a>
                        <Link to="/login" className="text-white hover:text-gray-300 transition-colors text-sm font-medium">
                            Demo
                        </Link>
                        <a href="#contact" className="text-white hover:text-gray-300 transition-colors text-sm font-medium">
                            Contact
                        </a>
                    </div>
                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>
                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-[#1a1f36] border-t border-white/10 shadow-lg z-50">
                        <div className="px-4 py-4 space-y-3">
                            <a
                                href="#home"
                                className="block py-2 text-white hover:text-gray-300 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </a>
                            <a
                                href="#services"
                                className="block py-2 text-white hover:text-gray-300 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Services
                            </a>
                            <Link
                                to="/login"
                                className="block py-2 text-white hover:text-gray-300 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Demo
                            </Link>
                            <a
                                href="#contact"
                                className="block py-2 text-white hover:text-gray-300 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contact
                            </a>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section
                id="home"
                className="relative min-h-screen flex items-center justify-center pt-16"
                style={{
                    backgroundImage: 'url(/background.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40" />

                <div className="relative z-10 text-center px-4 sm:px-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight max-w-4xl mx-auto">
                        Efficient, Safe, and Reliable Logistics Solutions
                    </h1>
                    <Button
                        onClick={scrollToContact}
                        className="px-8 py-4 text-base sm:text-lg bg-[#e6b800] hover:bg-[#d4a800] text-[#1a1f36] font-semibold rounded-full shadow-lg transition-all"
                    >
                        Get in Touch
                    </Button>
                </div>
            </section>

            {/* Our Services Section */}
            <section id="services" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
                        Our Services
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="bg-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                                    <service.icon className="w-7 h-7 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                                <p className="text-gray-600 text-sm">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Experience Our Solutions Section */}
            <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 bg-gray-100">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        Experience Our Solutions
                    </h2>
                    <p className="text-gray-600 mb-8">
                        See our fleet management and logistics platform in action. Explore the dashboard and features now.
                    </p>
                    <Link to="/login">
                        <Button className="px-8 py-4 text-base bg-[#e6b800] hover:bg-[#d4a800] text-[#1a1f36] font-semibold rounded-full shadow-lg transition-all">
                            View Live Demo
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
                        Contact Us
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Get in Touch Card */}
                        <div className="bg-[#f5f5f0] rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h3>
                            <p className="text-gray-600 mb-8">
                                We'd love to hear from you. Please fill out this form or reach out to us using the contact details below.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Email</p>
                                        <a href="mailto:nura.consultingsolutionsltd@gmail.com" className="text-gray-600 text-sm hover:text-[#1a1f36] transition-colors">
                                            nura.consultingsolutionsltd@gmail.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Phone</p>
                                        <a href="tel:+254112424103" className="text-gray-600 text-sm hover:text-[#1a1f36] transition-colors">
                                            +254 112 424 103
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">WhatsApp</p>
                                        <a href="https://wa.me/254112424103" className="text-gray-600 text-sm hover:text-[#1a1f36] transition-colors">
                                            +254 112 424 103
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <form onSubmit={handleAjaxSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="Your name"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1a1f36] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            placeholder="Your email"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1a1f36] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        required
                                        placeholder="Subject"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1a1f36] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        placeholder="Your message"
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1a1f36] focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={formStatus === 'submitting'}
                                    className="w-full py-4 bg-[#1a1f36] hover:bg-[#2a2f46] text-white font-semibold rounded-lg transition-all disabled:opacity-70"
                                >
                                    {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                                </Button>
                                {formStatus === 'success' && (
                                    <p className="text-green-600 text-sm text-center">
                                        Thank you! Your message has been sent successfully.
                                    </p>
                                )}
                                {formStatus === 'error' && (
                                    <p className="text-red-600 text-sm text-center">
                                        Oops! Something went wrong. Please try again later.
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-[#1a1f36] py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
                                <img
                                    src="/logo.png"
                                    alt="Nura Logistics"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-white font-medium">Nura Logistics Consultancy Ltd</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} Nura Logistics Consultancy Ltd. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
