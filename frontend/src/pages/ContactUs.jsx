import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ShieldAlert, Send, CheckCircle2 } from 'lucide-react';

export default function ContactUs() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Contact Us</h1>
        <p className="text-slate-500 text-sm">
          Have a question about your order, farmer listings, or delivery? Reach out to our dedicated support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Details Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Customer Support & Headquarters
            </h2>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-forest-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Operating Address</strong>
                  <span>DeshiMart Operations, Kolkata, West Bengal – 700001, India</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-forest-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Customer Support Email</strong>
                  <a href="mailto:support@deshimart.org" className="text-forest-600 hover:underline">
                    support@deshimart.org
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-forest-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Customer Support Helpline</strong>
                  <span>+91 98765 43210</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-forest-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Business Hours</strong>
                  <span>Monday to Saturday: 9:00 AM – 6:00 PM IST</span>
                  <span className="block text-xs text-slate-400 mt-0.5">Closed on National Holidays</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grievance Redressal Officer (Mandatory under Consumer Protection E-Commerce Rules 2020) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <span>Grievance Redressal Officer</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology Act, 2000, details of the Grievance Officer are published below:
            </p>
            <div className="text-xs text-slate-800 space-y-1 bg-white/80 p-3 rounded-xl border border-amber-100">
              <p><strong>Name:</strong> Subarno Mallick</p>
              <p><strong>Designation:</strong> Grievance Officer</p>
              <p><strong>Email:</strong> <a href="mailto:grievance@deshimart.org" className="text-forest-600 hover:underline">grievance@deshimart.org</a></p>
              <p><strong>Escalation Window:</strong> Acknowledged within 48 hours, resolution within 30 days.</p>
            </div>
          </div>
        </div>

        {/* Message Inquiry Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Send Us a Message</h2>

          {formSubmitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
              <h3 className="font-bold text-base">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-600">
                Thank you for contacting DeshiMart. Our support team will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Your Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Subject / Query Type</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Order Tracking, Farmer Listing, Refund"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Your Message</label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your inquiry or issue in detail..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-forest-400 focus:bg-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-forest-500 hover:bg-forest-600 text-white font-bold py-3 rounded-xl shadow-sm hover:shadow transition-all text-xs flex items-center justify-center space-x-1.5"
              >
                <Send className="h-4 w-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
