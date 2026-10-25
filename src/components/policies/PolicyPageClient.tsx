"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface PolicySection {
  title: string;
  content: string;
  bullets?: string[];
  numberedList?: string[];
  afterBullets?: string;
}

interface ContactInfo {
  brand: string;
  legalName: string;
  website: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  grievanceEmail?: string;
  grievancePhone?: string;
}

interface PolicyPageClientProps {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  introParagraph: string;
  sections: PolicySection[];
  contactInfo: ContactInfo;
  contactTitle: string;
  contactSubtitle?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function PolicyPageClient({
  heroTitle,
  heroSubtitle,
  heroDescription,
  introParagraph,
  sections,
  contactInfo,
  contactTitle,
  contactSubtitle,
}: PolicyPageClientProps) {
  return (
    <div className="bg-background min-h-screen">
      {/* ──── Hero Section ──── */}
      <section className="relative w-full min-h-[420px] md:min-h-[480px] flex flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 w-full h-full z-0 bg-gray-900 flex items-center justify-center">
          <Image
            src="/images/fridge-obsidian.png"
            alt="FATHOM policy background"
            width={800}
            height={800}
            priority
            className="object-contain opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-5 pt-28 pb-16">
          {/* Gold accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-16 h-[2px] bg-accent origin-center"
          />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl lg:text-6xl font-poppins font-bold text-white tracking-wide uppercase"
            dangerouslySetInnerHTML={{ __html: heroTitle }}
          />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-lg md:text-2xl font-poppins font-medium text-accent"
          >
            {heroSubtitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm md:text-base text-gray-300 max-w-2xl font-inter leading-relaxed"
          >
            {heroDescription}
          </motion.p>

          {/* Gold accent line bottom */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="w-10 h-[2px] bg-accent/50 origin-center"
          />
        </div>
      </section>

      {/* ──── Content Section ──── */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Intro paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="relative bg-surface rounded-2xl border border-gray-100 p-8 md:p-10 shadow-sm">
            <div className="absolute top-0 left-8 w-12 h-[3px] bg-accent rounded-full -translate-y-1/2" />
            <p
              className="text-sm md:text-base text-slate leading-relaxed font-inter"
              dangerouslySetInnerHTML={{ __html: introParagraph }}
            />
          </div>
        </motion.div>

        {/* Policy sections */}
        <div className="space-y-12 md:space-y-16">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              className="group"
            >
              {/* Section header with gold accent */}
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <h3 className="text-lg md:text-xl font-poppins font-semibold text-primary tracking-wide">
                  {section.title}
                </h3>
              </div>

              {/* Section content */}
              <div className="pl-6 border-l-2 border-gray-100 group-hover:border-accent/30 transition-colors duration-500">
                {section.content.split("\n\n").map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-sm md:text-[15px] text-slate leading-relaxed font-inter mb-4 last:mb-0"
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ))}

                {/* Bullet list */}
                {section.bullets && (
                  <ul className="mt-4 space-y-3">
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-accent/70" />
                        <span
                          className="text-sm md:text-[15px] text-slate leading-relaxed font-inter"
                          dangerouslySetInnerHTML={{ __html: bullet }}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {/* Numbered list */}
                {section.numberedList && (
                  <ol className="mt-4 space-y-3 counter-reset-custom">
                    {section.numberedList.map((item, nIdx) => (
                      <li key={nIdx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center mt-0.5">
                          {nIdx + 1}
                        </span>
                        <span className="text-sm md:text-[15px] text-slate leading-relaxed font-inter">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                {/* After bullets content */}
                {section.afterBullets && (
                  <div className="mt-4">
                    {section.afterBullets.split("\n\n").map((paragraph, aIdx) => (
                      <p
                        key={aIdx}
                        className="text-sm md:text-[15px] text-slate leading-relaxed font-inter mb-4 last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ──── Contact Section ──── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 md:mt-24"
        >
          <div className="relative bg-primary rounded-2xl p-8 md:p-12 overflow-hidden">
            {/* Subtle gold gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <h3 className="text-lg md:text-xl font-poppins font-semibold text-white tracking-wide">
                  {contactTitle}
                </h3>
              </div>

              {contactSubtitle && (
                <p className="text-sm text-gray-400 font-inter mb-6 pl-6">
                  {contactSubtitle}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-6">
                <ContactItem label="Brand" value={contactInfo.brand} />
                <ContactItem label="Legal Business Name" value={contactInfo.legalName} />
                <ContactItem
                  label="Website"
                  value={contactInfo.website}
                  href={contactInfo.website}
                />
                <ContactItem
                  label="Email"
                  value={contactInfo.email}
                  href={`mailto:${contactInfo.email}`}
                />
                <ContactItem
                  label="Phone"
                  value={contactInfo.phone}
                  href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                />
                <ContactItem
                  label="WhatsApp"
                  value={contactInfo.whatsapp}
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/[+\s]/g, "")}`}
                />
                <div className="md:col-span-2">
                  <ContactItem label="Business Address" value={contactInfo.address} />
                </div>
                {contactInfo.grievanceEmail && (
                  <ContactItem
                    label="Grievance Contact"
                    value={contactInfo.grievanceEmail}
                    href={`mailto:${contactInfo.grievanceEmail}`}
                  />
                )}
                {contactInfo.grievancePhone && (
                  <ContactItem
                    label="Grievance Phone"
                    value={contactInfo.grievancePhone}
                    href={`tel:${contactInfo.grievancePhone.replace(/\s/g, "")}`}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ──── Back to Home ──── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-inter font-medium text-slate hover:text-accent transition-colors duration-300 group"
          >
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

/* ─── Helper component ────────────────────────────────── */
function ContactItem({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-inter font-medium text-accent/80 uppercase tracking-widest">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-sm font-inter text-gray-300 hover:text-white transition-colors duration-300 break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-inter text-gray-300">{value}</p>
      )}
    </div>
  );
}
