"use client";

import { useState } from "react";
import Link from "next/link";
import {
  School,
  Users,
  DollarSign,
  ClipboardCheck,
  Calendar,
  BarChart3,
  Shield,
  Menu,
  X,
  CheckCircle,
  TrendingUp,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="font-sans antialiased text-gray-800">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <School className="text-indigo-600 h-8 w-8 mr-2" />
                <span className="text-xl font-bold text-indigo-600">
                  eSchool
                </span>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Testimonials
              </a>
            </div>
            <div className="flex items-center">
              <Button asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#features"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Testimonials
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Digital Management for School Extracurriculars
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Simplify member management, attendance tracking, and financial
                administration for your school&apos;s extracurricular
                activities.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/dashboard">Start Free Trial</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-indigo-600"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-300 rounded-full opacity-20"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-300 rounded-full opacity-20"></div>
                <Card className="relative shadow-2xl">
                  <CardHeader className="bg-indigo-500 text-white rounded-t-xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <span className="text-sm font-medium ml-4">
                        eSchool Dashboard
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">
                        Basketball Club
                      </h3>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-indigo-50 p-2 rounded text-center">
                        <div className="text-indigo-600 font-bold text-xl">
                          24
                        </div>
                        <div className="text-xs text-gray-600">Members</div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded text-center">
                        <div className="text-purple-600 font-bold text-xl">
                          85%
                        </div>
                        <div className="text-xs text-gray-600">Attendance</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-green-600 font-bold text-xl">
                          Rp1.2M
                        </div>
                        <div className="text-xs text-gray-600">Balance</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Next Session</span>
                        <span>Wed, 15 Mar 2023</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full w-[70%]"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        Take Attendance
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Members
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Cloud */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase text-gray-500 tracking-wide mb-8">
            Trusted by schools across Indonesia
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="col-span-1 flex justify-center">
                <div className="h-12 w-32 bg-gray-300 rounded opacity-70 flex items-center justify-center text-gray-500 text-sm">
                  School {i}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need to Manage Extracurriculars
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Comprehensive tools designed specifically for school
              extracurricular management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Member Management",
                description:
                  "Easily add, remove, and track members across all your extracurricular activities with detailed profiles.",
                color: "indigo",
              },
              {
                icon: DollarSign,
                title: "Financial Tracking",
                description:
                  "Manage monthly dues, track income and expenses, and generate financial reports with ease.",
                color: "purple",
              },
              {
                icon: ClipboardCheck,
                title: "Attendance System",
                description:
                  "Simple daily attendance recording with comprehensive history and reporting features.",
                color: "green",
              },
              {
                icon: Calendar,
                title: "Scheduling",
                description:
                  "Set and manage schedules for each extracurricular activity with automatic reminders.",
                color: "blue",
              },
              {
                icon: BarChart3,
                title: "Reporting",
                description:
                  "Generate detailed reports for attendance, finances, and member participation.",
                color: "yellow",
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                description:
                  "Different access levels for school owners, coordinators, and treasurers.",
                color: "red",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div
                    className={`flex items-center justify-center h-12 w-12 rounded-md bg-${feature.color}-50 text-${feature.color}-600 mb-4`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How eSchool Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Simple steps to digitize your extracurricular management
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-0 left-1/2 h-full w-1 bg-indigo-200 transform -translate-x-1/2"></div>

            {[
              {
                step: 1,
                title: "Register Your School",
                description:
                  "School owners can quickly register their institution and set up the admin account.",
                reverse: false,
              },
              {
                step: 2,
                title: "Create Extracurriculars",
                description:
                  "Add all your school's extracurricular activities with schedules, fees, and assign coordinators.",
                reverse: true,
              },
              {
                step: 3,
                title: "Enroll Members",
                description:
                  "Add students to each extracurricular and maintain their profiles with contact information.",
                reverse: false,
              },
              {
                step: 4,
                title: "Manage & Monitor",
                description:
                  "Track attendance, collect fees, record expenses, and generate reports all in one platform.",
                reverse: true,
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`relative mb-16 md:flex md:items-center md:justify-between ${
                  item.reverse ? "md:flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`md:w-5/12 ${
                    item.reverse ? "md:pl-8" : "md:pr-8"
                  } mb-8 md:mb-0`}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-indigo-600 mb-2">
                        {item.step}. {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="hidden md:flex md:items-center md:justify-center md:w-2/12">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 text-white text-xl font-bold shadow-lg">
                    {item.step}
                  </div>
                </div>
                <div
                  className={`md:w-5/12 ${
                    item.reverse ? "md:pr-8" : "md:pl-8"
                  }`}
                >
                  <div className="h-48 bg-gray-300 rounded-lg shadow-md flex items-center justify-center text-gray-500">
                    Step {item.step} Preview
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Roles */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Designed for Your School Team
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Tailored interfaces for each role in your extracurricular
              management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "School Owner",
                color: "indigo",
                features: [
                  "Register and manage school profile",
                  "Create and oversee all extracurriculars",
                  "Assign coordinators and treasurers",
                  "Monitor overall activities and reports",
                ],
              },
              {
                title: "Coordinator",
                color: "purple",
                features: [
                  "Manage assigned extracurriculars",
                  "Add and organize members",
                  "Record daily attendance",
                  "View attendance reports",
                ],
              },
              {
                title: "Treasurer",
                color: "green",
                features: [
                  "Collect monthly membership fees",
                  "Record income and expenses",
                  "Track payment status per member",
                  "Generate financial reports",
                ],
              },
            ].map((role, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className={`bg-${role.color}-600 text-white`}>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`flex items-center justify-center h-16 w-16 rounded-full bg-${role.color}-100 text-${role.color}-600`}
                    >
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {role.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Start for free and upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "Rp0",
                description: "Perfect for trying out eSchool",
                features: [
                  "1 Extracurricular",
                  "Up to 30 members",
                  "Basic attendance",
                  "Financial tracking",
                  "Basic reporting",
                ],
                buttonText: "Get Started",
                popular: false,
              },
              {
                name: "Professional",
                price: "Rp99,000",
                description: "For growing schools",
                features: [
                  "Up to 10 Extracurriculars",
                  "Up to 500 members",
                  "Advanced attendance",
                  "Complete financial management",
                  "Advanced reporting",
                  "Email support",
                ],
                buttonText: "Start Free Trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Rp299,000",
                description: "For large institutions",
                features: [
                  "Unlimited Extracurriculars",
                  "Unlimited members",
                  "All features included",
                  "Priority support",
                  "Custom integrations",
                  "Dedicated account manager",
                ],
                buttonText: "Contact Sales",
                popular: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular ? "ring-2 ring-indigo-600" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/dashboard">{plan.buttonText}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Schools Are Saying
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Hear from educators who have transformed their extracurricular
              management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "eSchool has completely transformed how we manage our 15 extracurricular activities. The attendance tracking alone saves us hours every week.",
                author: "Sarah Johnson",
                role: "Principal",
                school: "Jakarta International School",
              },
              {
                quote:
                  "The financial tracking feature is incredible. We can now see exactly where every rupiah goes and generate reports for parents instantly.",
                author: "Ahmad Rahman",
                role: "Coordinator",
                school: "SMA Negeri 1 Bandung",
              },
              {
                quote:
                  "As a treasurer, I love how easy it is to track payments and expenses. The automated reminders have improved our collection rate by 40%.",
                author: "Maria Santos",
                role: "Treasurer",
                school: "Binus School Serpong",
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <blockquote className="text-gray-600 mb-4">
                    &quot;{testimonial.quote}&quot;
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}, {testimonial.school}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-200">
              Start your free trial today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">Get started</Link>
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-indigo-600"
              >
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <School className="text-indigo-400 h-8 w-8 mr-2" />
                <span className="text-xl font-bold text-white">eSchool</span>
              </div>
              <p className="text-gray-300 mb-4">
                Simplifying extracurricular management for schools across
                Indonesia.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <div className="h-6 w-6 bg-gray-400 rounded"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <div className="h-6 w-6 bg-gray-400 rounded"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <div className="h-6 w-6 bg-gray-400 rounded"></div>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-300 hover:text-white"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-300 hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-gray-400 text-sm text-center">
              © 2024 eSchool. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
