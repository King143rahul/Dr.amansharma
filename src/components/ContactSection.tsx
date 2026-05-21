import { motion } from 'framer-motion';
import { Mail, Link2, Send } from 'lucide-react';
import { useState } from 'react';
import { Input } from './ui/input';

export const ContactSection = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <section id="contact" className="py-32 bg-academic-surface relative z-10">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="editorial-subheading flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-academic-brand"></span>
            Inquiries
            <span className="w-8 h-px bg-academic-brand"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-academic-accent mb-6 leading-tight">
            Get In <span className="italic text-academic-brand">Touch</span>
          </h2>
          <p className="text-academic-muted text-xl font-sans font-medium">
            Open for research collaborations, consulting, and academic speaking engagements.
          </p>
        </motion.div>

        <div className="border border-academic-border bg-white p-10 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            <div>
              <h3 className="text-2xl font-serif font-medium text-academic-accent mb-8">Contact Information</h3>
              <div className="space-y-8">
                <a href="mailto:amansharmapdh@gmail.com" className="flex items-start gap-5 text-academic-muted hover:text-academic-brand transition-colors duration-500 group">
                  <div className="mt-1 flex-shrink-0 text-academic-accent group-hover:text-academic-brand transition-colors duration-500">
                    <Mail size={24} strokeWidth={1} />
                  </div>
                  <div>
                    <p className="font-sans font-bold text-academic-accent uppercase tracking-wider text-sm mb-1">Email</p>
                    <p className="font-sans font-medium">amansharmapdh@gmail.com</p>
                  </div>
                </a>
                <a href="https://www.linkedin.com/in/amansharmaphd/" target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 text-academic-muted hover:text-academic-brand transition-colors duration-500 group">
                  <div className="mt-1 flex-shrink-0 text-academic-accent group-hover:text-academic-brand transition-colors duration-500">
                    <Link2 size={24} strokeWidth={1} />
                  </div>
                  <div>
                    <p className="font-sans font-bold text-academic-accent uppercase tracking-wider text-sm mb-1">LinkedIn</p>
                    <p className="font-sans font-medium">linkedin.com/in/amansharmaphd</p>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <Input
                  label="Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="font-sans"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="font-sans"
                />
                <div>
                  <label className="block text-sm font-sans font-bold tracking-wider uppercase text-academic-accent mb-2">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 bg-academic-surface border border-academic-border focus:outline-none focus:border-academic-brand transition-colors duration-500 font-sans font-medium resize-none rounded-none" placeholder="I would like to collaborate on..." />
                </div>
                <button type="submit" className="w-full py-4 bg-academic-accent text-white font-sans text-base font-bold tracking-wider uppercase hover:bg-academic-brand transition-colors duration-500 flex items-center justify-center gap-3 group">
                  Send Message
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" strokeWidth={1.5} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
