import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";

function Footer() {
    return (
        <footer className="bg-black text-white py-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                    <h5 className="text-xl font-semibold mb-4">GET IN TOUCH</h5>
                    <ul>
                        <li className="cursor-pointer hover:text-blue-600 mb-2">FAQs</li>
                        <li className="cursor-pointer hover:text-blue-600 mb-2">Give us feedback</li>
                        <li className="cursor-pointer hover:text-blue-600 mb-2">Contact us</li>
                    </ul>
                </div>

                <div>
                    <h5 className="text-xl font-semibold mb-4">ABOUT US</h5>
                    <ul>
                        <li className="cursor-pointer hover:text-blue-600 mb-2">About us</li>
                        <li className="cursor-pointer hover:text-blue-600 mb-2">Find us</li>
                        <li className="cursor-pointer hover:text-blue-600 mb-2">News</li>
                    </ul>
                </div>

                <div>
                    <h5 className="text-xl font-semibold mb-4">LEGAL STUFF</h5>
                    <ul>
                        <li className="cursor-pointer hover:text-blue-600 mb-2">Terms & Conditions</li>
                        <li className="cursor-pointer hover:text-blue-600 mb-2">Private policy</li>
                        <li className="cursor-pointer hover:text-blue-600 mb-2">Cookie policy</li>
                    </ul>
                </div>

                <div>
                    <h5 className="text-xl font-semibold mb-4">CONNECT WITH US</h5>
                    <ul>
                        <li className="mb-2">
                            <a href="https://www.facebook.com/daylahoangnguyen/" target="_blank" rel="noreferrer" className="flex items-center hover:text-blue-600">
                                <FontAwesomeIcon icon={faFacebook} className="mr-2 text-2xl" />
                                Facebook
                            </a>
                        </li>
                        <li className="mb-2">
                            <a href="https://www.instagram.com/hoangng.135/" target="_blank" rel="noreferrer" className="flex items-center hover:text-pink-600">
                                <FontAwesomeIcon icon={faInstagram} className="mr-2 text-2xl" />
                                Instagram
                            </a>
                        </li>
                        <li className="mb-2">
                            <a href="https://twitter.com/HoangNguyen151" target="_blank" rel="noreferrer" className="flex items-center hover:text-blue-400">
                                <FontAwesomeIcon icon={faTwitter} className="mr-2 text-2xl" />
                                Twitter
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Copyright */}
            <div className="text-center mt-8">
                <span className="text-sm">2025 © HN Fishing</span>
                <span className="text-sm font-semibold ml-2">Hoang Nguyen Huy</span>
            </div>
        </footer>
    );
}

export default Footer;
