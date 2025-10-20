"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, GraduationCap, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Lessons", href: "/lessons", icon: BookOpen, label: "レッスン" },
    { name: "Quiz", href: "/quiz", icon: GraduationCap, label: "クイズ" },
    { name: "AI Tutor", href: "/chat", icon: MessageSquare, label: "先生" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/logo.png"
                alt="NihonGo Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="relative w-16 h-10 sm:w-20 sm:h-12 hidden xs:block">
              <Image
                src="/logo-text.png"
                alt="NihonGo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  asChild
                  className="gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Link href={item.href}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500">
                      ({item.label})
                    </span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md">
              C
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-700"
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

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.label}</div>
                  </div>
                </Link>
              );
            })}

            {/* User Info - Mobile */}
            <div className="pt-4 border-t mt-4 flex items-center px-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  A
                </div>
                <div>
                  <div className="font-medium text-gray-900">Alex</div>
                  <div className="text-sm text-gray-500">Beginner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
