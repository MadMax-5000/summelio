import { Facebook, Twitter, Linkedin, Github } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 py-12 px-6 md:px-16">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Brand & Social Icons */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold text-indigo-500">Summelio</h2>
          <div className="flex justify-center md:justify-start gap-4 mt-4">
            <a
              href="#"
              className="text-gray-500 hover:text-indigo-500 transition"
            >
              <Facebook size={22} />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-indigo-500 transition"
            >
              <Twitter size={22} />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-indigo-500 transition"
            >
              <Linkedin size={22} />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-indigo-500 transition"
            >
              <Github size={22} />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex gap-6 text-sm text-gray-600 mt-6 md:mt-0">
          <a href="#" className="hover:text-indigo-500 transition">
            Home
          </a>
          <a href="#" className="hover:text-indigo-500 transition">
            Features
          </a>
          <a href="#" className="hover:text-indigo-500 transition">
            Pricing
          </a>
          <a href="#" className="hover:text-indigo-500 transition">
            Contact
          </a>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="container mx-auto mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="flex gap-4">
          <a href="#" className="hover:text-indigo-500 transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-indigo-500 transition">
            Terms of Service
          </a>
        </div>
        <p className="mt-4 md:mt-0">
          © {new Date().getFullYear()} Summelio. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
