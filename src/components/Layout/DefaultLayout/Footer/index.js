import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";

function Footer() {
    return (
        <footer className="bg-black text-white py-12 z-10 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div className="space-y-4">
                        <h5 className="text-xl font-semibold mb-6">GET IN TOUCH</h5>
                        <ul className="space-y-3">
                            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-300">FAQs</li>
                            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-300">Give us feedback</li>
                            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-300">Contact us</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-xl font-semibold mb-6">ABOUT US</h5>
                        <ul className="space-y-3">
                            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-300">About us</li>
                            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-300">Find us</li>
                            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-300">News</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-xl font-semibold mb-6">LEGAL STUFF</h5>
                        <ul className="space-y-3">
                            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-300">Terms & Conditions</li>
                            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-300">Private policy</li>
                            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-300">Cookie policy</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-xl font-semibold mb-6">CONNECT WITH US</h5>
                        <ul className="space-y-3">
                            <li>
                                <a href="https://www.facebook.com/daylahoangnguyen/" target="_blank" rel="noreferrer" 
                                   className="flex items-center hover:text-blue-500 transition-colors duration-300">
                                    <FontAwesomeIcon icon={faFacebook} className="mr-3 text-2xl" />
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a href="https://www.instagram.com/hoangng.135/" target="_blank" rel="noreferrer" 
                                   className="flex items-center hover:text-pink-500 transition-colors duration-300">
                                    <FontAwesomeIcon icon={faInstagram} className="mr-3 text-2xl" />
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a href="https://twitter.com/HoangNguyen151" target="_blank" rel="noreferrer" 
                                   className="flex items-center hover:text-blue-400 transition-colors duration-300">
                                    <FontAwesomeIcon icon={faTwitter} className="mr-3 text-2xl" />
                                    Twitter
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-8"></div>

                {/* Copyright */}
                <div className="text-center">
                    <span className="text-sm text-gray-400">2025 © HN Fishing</span>
                    <span className="text-sm font-semibold text-gray-300 ml-2">Hoang Nguyen Huy</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
