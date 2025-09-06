import React from "react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="bg-black/95 border border-white/10 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-white/70 mb-4">
            Welcome to APEX. By using our site and services, you agree to the
            following terms and conditions. Please read them carefully.
          </p>
          <section className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              1. Use of Service
            </h2>
            <p className="text-white/70">
              You agree to use the service in compliance with all applicable
              laws and not to engage in prohibited activities.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              2. Orders & Payment
            </h2>
            <p className="text-white/70">
              Orders are subject to availability and confirmation. Payment must
              be completed per checkout instructions.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              3. Returns & Refunds
            </h2>
            <p className="text-white/70">
              Our refund policy applies to returned items. Contact support for
              returns and refunds.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              4. Intellectual Property
            </h2>
            <p className="text-white/70">
              All content on this site is the property of APEX or its licensors.
            </p>
          </section>

          <div className="mt-6">
            <Link to="/" className="text-brand-red hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
