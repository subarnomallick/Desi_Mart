import React from 'react';
import { Truck, Clock, MapPin, ShieldCheck } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center space-x-1.5 bg-forest-50 text-forest-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <Truck className="h-4 w-4" />
          <span>Logistics & Fulfillment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Shipping & Delivery Policy</h1>
        <p className="text-slate-500 text-xs mt-1">Last Updated: September 9, 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Highlight Banner */}
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 flex items-start space-x-3">
          <Clock className="h-5 w-5 text-forest-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-forest-900">
            <strong className="block text-sm font-bold text-slate-900 mb-0.5">
              Standard Estimated Delivery: 3 to 7 Business Days
            </strong>
            Fresh local crops are delivered within 24 to 48 hours, while certified seeds, organic fertilizers, and farming equipment are delivered pan-India within 3 to 7 business days.
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Serviceable Locations</h2>
          <p>
            DeshiMart ships across India covering most serviceable PIN codes through verified regional courier and agricultural freight logistics partners. If a specific rural PIN code is non-serviceable, you will be notified at checkout or contacted by our dispatch team.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Delivery Timelines by Product Category</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Product Category</th>
                  <th className="p-3">Estimated Transit Time</th>
                  <th className="p-3">Packaging Standards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-650">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Fresh Produce & Crops</td>
                  <td className="p-3">24 to 48 hours (Direct farm harvest)</td>
                  <td className="p-3">Ventilated eco-friendly agri-crates</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Seeds & Bio-Fertilizers</td>
                  <td className="p-3">3 to 5 business days</td>
                  <td className="p-3">Moisture-proof sealed packaging</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Farming Tools & Equipment</td>
                  <td className="p-3">4 to 7 business days</td>
                  <td className="p-3">Heavy-duty corrugated protective boxing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Shipping Fees & Transparent Charges</h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-650">
            <li><strong>Standard Orders:</strong> Free doorstep shipping on qualified marketplace orders over ₹499.</li>
            <li><strong>Nominal Packing Charge:</strong> A standard agricultural packaging and hygiene handling fee of ₹20 is clearly listed on the order invoice prior to payment.</li>
            <li>No hidden surcharges are levied at delivery time.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Order Tracking & Dispatch Alerts</h2>
          <p>
            Once your order is picked and dispatched, an automated confirmation message containing the tracking link and logistics partner details is sent via Email and SMS to your registered contact information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Damaged or Lost in Transit</h2>
          <p>
            In the rare event that your package is damaged during transit, please photograph the parcel and notify us within 24 hours of receipt at <a href="mailto:support@deshimart.org" className="text-forest-600 underline">support@deshimart.org</a>. We will immediately dispatch a replacement or initiate a full refund.
          </p>
        </section>
      </div>
    </div>
  );
}
