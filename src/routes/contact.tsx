import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { generateSEO } from '@/backend/features/seo';
import { MapPin, Phone, Mail } from 'lucide-react';

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: generateSEO({
      title: "Contact Us | Shailraj Travels",
      description:
        "Get in touch with Shailraj Travels for tour bookings, custom packages, and inquiries. Located in Pune, Maharashtra.",
      canonicalUrl: "https://www.shailrajtravels.com/contact",
    }),
    links: [{ rel: "canonical", href: "https://www.shailrajtravels.com/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    honeypot: "", // Anti-spam
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    // Log conversion event
    window.dataLayer?.push({ event: "contact_form_submit" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form");
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "", honeypot: "" });
    } catch (err: any) {
      console.error("Contact Form Error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again or call us.");
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (
        (target.tagName === "INPUT" && (target as HTMLInputElement).type !== "button" && (target as HTMLInputElement).type !== "submit") ||
        target.tagName === "SELECT"
      ) {
        const form = e.currentTarget;
        const inputs = Array.from(
          form.querySelectorAll("input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled])")
        ) as HTMLElement[];
        
        const index = inputs.indexOf(target);
        if (index > -1 && index < inputs.length - 1) {
          e.preventDefault();
          inputs[index + 1].focus();
        }
      }
    }
  };

  return (
    <main className="w-full bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-deep mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Reach out to us for any tour inquiries, custom packages, or
            support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details & Map */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
              <div className="flex items-start gap-4 text-gray-700">
                <MapPin className="w-6 h-6 text-brand-orange shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Our Office</h3>
                  <p>
                    Shailraj Travels, Gopal Patti Manjri budruk,
                    <br />
                    Hadapsar, Pune, Maharashtra 412307, India
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-gray-700">
                <Phone className="w-6 h-6 text-brand-orange shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <p>+91 97634 33556</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-gray-700">
                <Mail className="w-6 h-6 text-brand-orange shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p>shailrajtravels9999@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 h-[300px] overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=Shailraj%20Travels%2C%20Gopal%20Patti%2C%20Manjri%20budruk%2C%20Hadapsar%2C%20Pune%2C%20Maharashtra%20412307&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "0.75rem" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Sent!</h2>
                <p className="text-gray-600 mb-8 max-w-sm">
                  Thank you for reaching out. A member of our team will get back to you within 24
                  hours.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                {status === "error" && (
                  <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
                    {errorMessage}
                  </div>
                )}
                <form
                  className="space-y-6"
                  onSubmit={handleSubmit}
                  onKeyDown={handleFormKeyDown}
                >
                  {/* Honeypot Field */}
                  <input
                    type="text"
                    name="honeypot"
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.honeypot}
                    onChange={handleChange}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow"
                      placeholder="Your Name"
                      required
                      disabled={status === "loading"}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow"
                        placeholder="you@example.com"
                        required
                        disabled={status === "loading"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        type="tel"
                        className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow"
                        placeholder="+91"
                        required
                        disabled={status === "loading"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow"
                      placeholder="How can we help?"
                      required
                      disabled={status === "loading"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-shadow"
                      placeholder="Your message here..."
                      required
                      disabled={status === "loading"}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center py-4 bg-brand-blue-deep text-white font-bold rounded-lg hover:bg-brand-blue transition-colors shadow-md text-lg disabled:opacity-70"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
