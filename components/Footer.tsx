"use client";

import Link from "next/link";
import { Flame, Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="footer-logo">
            <span className="footer-logo-icon"><Flame size={15} color="var(--midnight)" /></span>
            <span className="nav-logo-text">Firee</span>
          </Link>
          <p className="footer-desc">Decentralized marketplace — trade freely, own truly.</p>
        </div>

        <div>
          <p className="footer-heading">Platform</p>
          <Link href="/#features">Features</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/about">About</Link>
          <Link href="/support">Support</Link>
        </div>

        <div>
          <p className="footer-heading">Account</p>
          <Link href="/login">Login</Link>
          <Link href="/create">Create</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/order">Orders</Link>
        </div>

        <div>
          <p className="footer-heading">Connect</p>
          <div className="footer-social">
            <a href="https://github.com/dimasdew" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={16} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={16} /></a>
            <a href="mailto:hello@firee.app" aria-label="Email"><Mail size={16} /></a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Firee. Built by dimasdew.</p>
        <p className="mono" style={{ fontSize: 11, opacity: 0.5 }}>Settled in USDC</p>
      </div>
    </footer>
  );
}
