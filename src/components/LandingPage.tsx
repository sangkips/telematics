import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Truck,
    MapPin,
    Fuel,
    Activity,
    Bell,
    BarChart3,
    Shield,
    Zap,
    Settings,
    ChevronRight,
    Check,
    Globe,
    Smartphone,
    Clock,
    Menu,
    X,
} from 'lucide-react';
import { Button } from './ui/button';

export const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const features = [
        {
            icon: MapPin,
            title: 'Real-Time GPS Tracking',
            description: 'Track your entire fleet with precision GPS. Know exactly where every vehicle is, 24/7.',
            color: 'bg-blue-500',
            lightBg: 'bg-blue-50',
        },
        {
            icon: Fuel,
            title: 'Fuel Monitoring',
            description: 'Monitor fuel consumption in real-time. Detect theft, optimize routes, and reduce costs.',
            color: 'bg-amber-500',
            lightBg: 'bg-amber-50',
        },
        {
            icon: Activity,
            title: 'Driver Behavior Analysis',
            description: 'Track harsh braking, speeding, and acceleration. Improve safety and reduce wear.',
            color: 'bg-rose-500',
            lightBg: 'bg-rose-50',
        },
        {
            icon: Bell,
            title: 'Smart Alerts',
            description: 'Customizable alerts for geofencing, speed limits, maintenance, and more.',
            color: 'bg-violet-500',
            lightBg: 'bg-violet-50',
        },
        {
            icon: BarChart3,
            title: 'Fleet Analytics',
            description: 'Comprehensive reports and insights to optimize your fleet performance.',
            color: 'bg-sky-500',
            lightBg: 'bg-sky-50',
        },
        {
            icon: Shield,
            title: 'Geofencing',
            description: 'Create virtual boundaries and get instant alerts when vehicles enter or exit zones.',
            color: 'bg-indigo-500',
            lightBg: 'bg-indigo-50',
        },
    ];

    const stats = [
        { value: '10K+', label: 'Vehicles Tracked' },
        { value: '50M+', label: 'KM Monitored' },
        { value: '30%', label: 'Fuel Savings' },
        { value: '99.9%', label: 'Uptime' },
    ];

    const howItWorks = [
        {
            icon: Settings,
            step: '01',
            title: 'Connect',
            description: 'Install our compact telematics device in your vehicles. Quick, easy, and non-invasive.',
        },
        {
            icon: Globe,
            step: '02',
            title: 'Monitor',
            description: 'Access real-time data from anywhere—desktop, tablet, or mobile. Always stay connected.',
        },
        {
            icon: Zap,
            step: '03',
            title: 'Optimize',
            description: 'Use actionable insights to reduce costs, improve safety, and maximize efficiency.',
        },
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Background decorative elements */}
            {/* Background decorative elements - hidden for clean white look */}

            {/* Navigation */}
            <nav className="relative z-50 px-4 sm:px-6 py-4 bg-white backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-gray-900">Nura Logistics</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                            How It Works
                        </a>
                        <a href="#stats" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                            Why Us
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="hidden sm:block">
                            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6">
                                Sign In
                            </Button>
                        </Link>
                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-900" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-900" />
                            )}
                        </button>
                    </div>
                </div>
                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
                        <div className="px-4 py-4 space-y-3">
                            <a
                                href="#features"
                                className="block py-2 text-gray-600 hover:text-gray-900 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="block py-2 text-gray-600 hover:text-gray-900 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How It Works
                            </a>
                            <a
                                href="#stats"
                                className="block py-2 text-gray-600 hover:text-gray-900 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Why Us
                            </a>
                            <Link to="/login" className="block">
                                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-24 md:pt-24 md:pb-32">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Complete Visibility.
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Total Control.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                            Advanced vehicle telematics that gives you real-time insights into your fleet.
                            Track location, monitor fuel, analyze driver behavior, and reduce operational costs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/login">
                                <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg transition-all">
                                    Get Started Free
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <a href="#features">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto px-8 py-6 text-lg border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full transition-all"
                                >
                                    See Features
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="mt-16 md:mt-24 relative max-w-5xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xl shadow-gray-200/50">
                            <div className="bg-gray-900 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-xs text-gray-400 ml-4">dashboard.nura-telematics</span>
                                </div>
                                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Truck className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-400">Active Vehicles</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">128</p>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-4 h-4 text-green-400" />
                                            <span className="text-xs text-gray-400">On Route</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">94</p>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Fuel className="w-4 h-4 text-amber-400" />
                                            <span className="text-xs text-gray-400">Fuel Level</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">67%</p>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bell className="w-4 h-4 text-rose-400" />
                                            <span className="text-xs text-gray-400">Alerts</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">3</p>
                                    </div>
                                </div>
                                {/* Map preview */}
                                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 mx-6 mb-6 rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-50">
                                        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
                                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                                        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                                    </div>
                                    <span className="text-gray-500 text-sm">Live Fleet Map</span>
                                </div>
                            </div>
                        </div>
                        {/* Floating elements */}
                        <div className="hidden md:block absolute -left-12 top-1/4 bg-white rounded-xl border border-gray-200 p-4 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Vehicle Arrived</p>
                                    <p className="text-sm font-medium text-gray-900">KBC 234A • Nairobi</p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block absolute -right-12 bottom-1/4 bg-white rounded-xl border border-gray-200 p-4 shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Fuel className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Low Fuel Alert</p>
                                    <p className="text-sm font-medium text-gray-900">KDG 567B • 15%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Manage Your Fleet
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
                            Powerful features designed to give you complete control and visibility over your entire vehicle fleet.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`group ${feature.lightBg} rounded-2xl border border-gray-100 p-5 sm:p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300`}
                            >
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Simple Setup, Powerful Results
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
                            Get started in minutes. Our telematics system is designed for simplicity without sacrificing power.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-8">
                        {howItWorks.map((item, index) => (
                            <div key={index} className="relative text-center">
                                {/* Connection line */}
                                {index < howItWorks.length - 1 && (
                                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-[2px] bg-gradient-to-r from-gray-300 to-transparent" />
                                )}
                                <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 mb-6">
                                    <div className="absolute inset-0 bg-gray-100 rounded-full animate-pulse" />
                                    <div className="absolute inset-3 sm:inset-4 bg-white rounded-full border-2 border-gray-200 shadow-sm" />
                                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900 relative z-10" />
                                    <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 max-w-xs mx-auto">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Trusted by Fleet Operators
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
                            Join thousands of businesses that rely on Nura Logistics to manage their vehicles.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-8 text-center hover:shadow-lg transition-all"
                            >
                                <p className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-xs sm:text-base text-gray-600">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Features */}
            <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                                Access Your Fleet
                                <br />
                                <span className="text-gray-900">
                                    Anywhere, Anytime
                                </span>
                            </h2>
                            <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
                                Our platform is designed to work seamlessly across all your devices.
                                Monitor your fleet from the office, home, or on the go.
                            </p>
                            <div className="space-y-3 sm:space-y-4">
                                {[
                                    { icon: Globe, text: 'Web-based dashboard • No installation required' },
                                    { icon: Smartphone, text: 'Mobile-responsive design • Works on any device' },
                                    { icon: Clock, text: 'Real-time updates • Always stay informed' },
                                    { icon: Shield, text: 'Enterprise security • Your data is protected' },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-gray-900" />
                                        </div>
                                        <p className="text-gray-700">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-2xl">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                            Ready to Transform Your Fleet Management?
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                            Start your free trial today. No credit card required. Set up in minutes.
                        </p>
                        <Link to="/login">
                            <Button className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg bg-white hover:bg-gray-100 text-gray-900 rounded-full shadow-lg transition-all">
                                Get Started Now
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-gray-900">

                {/* Footer columns */}
                <div className="px-4 sm:px-6 py-8 sm:py-12 border-b border-gray-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
                            {/* Products */}
                            <div>
                                <h4 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Products</h4>
                                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GPS Tracking</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Fuel Monitoring</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Driver Analytics</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Fleet Reports</a></li>
                                </ul>
                            </div>

                            {/* Industries */}
                            <div>
                                <h4 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Industries</h4>
                                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Logistics</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Delivery Services</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Construction</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Public Transport</a></li>
                                </ul>
                            </div>

                            {/* Resources */}
                            <div className="col-span-2 sm:col-span-1">
                                <h4 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Resources</h4>
                                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About us</a></li>
                                    <li><a href="#stats" className="text-gray-400 hover:text-white transition-colors">Nura Impact</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer bottom */}
                <div className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center">
                                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-900" />
                            </div>
                            <span className="text-white font-semibold text-sm sm:text-base">Nura Logistics</span>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm">
                            © {new Date().getFullYear()} Nura Logistics. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
