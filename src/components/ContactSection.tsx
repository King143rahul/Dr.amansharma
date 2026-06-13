import { motion } from 'framer-motion';
import { Mail, Send, MessageCircle, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { db } from '../lib/supabase';

const LinkedinIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
  </svg>
);

export const ContactSection = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const [contactInfo, setContactInfo] = useState({
    email: 'AmanSharmaphd@gmail.com',
    linkedin: 'https://www.linkedin.com/in/amansharmaphd/',
    orcid: 'https://orcid.org/0000-0001-5024-292X',
    whatsapp: ''
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data, error } = await db
          .from('general_settings')
          .select('contactEmail, contactLinkedIn, contactOrcid, contactWhatsApp')
          .eq('id', 'settings')
          .single();
        
        if (!error && data) {
          setContactInfo({
            email: data.contactEmail || 'AmanSharmaphd@gmail.com',
            linkedin: data.contactLinkedIn || 'https://www.linkedin.com/in/amansharmaphd/',
            orcid: data.contactOrcid || 'https://orcid.org/0000-0001-5024-292X',
            whatsapp: data.contactWhatsApp || ''
          });
        }
      } catch (err) {
        console.error("Error fetching contact settings:", err);
      }
    };

    fetchContactInfo();

    // Subscribe to real-time updates
    const contactChannel = db
      .channel('contact_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'general_settings', filter: 'id=eq.settings' },
        (payload) => {
          const data = payload.new as any;
          if (data) {
            setContactInfo({
              email: data.contactEmail || 'AmanSharmaphd@gmail.com',
              linkedin: data.contactLinkedIn || 'https://www.linkedin.com/in/amansharmaphd/',
              orcid: data.contactOrcid || 'https://orcid.org/0000-0001-5024-292X',
              whatsapp: data.contactWhatsApp || ''
            });
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(contactChannel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setStatusMsg('Please fill in all fields.');
      return;
    }
    setStatus('loading');
    try {
      const { error } = await db
        .from('contact_submissions')
        .insert([{ name: name.trim(), email: email.trim(), message: message.trim() }]);
      
      if (error) throw error;
      
      setStatus('success');
      setStatusMsg('Thank you! Your message has been sent successfully.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setStatus('error');
      setStatusMsg(err.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-8 sm:py-10 lg:py-12 bg-academic-surface relative z-10">
      <div className="max-w-5xl mx-auto px-2.5 sm:px-3 lg:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="editorial-subheading flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-academic-brand"></span>
            Inquiries
            <span className="w-8 h-px bg-academic-brand"></span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-academic-accent mb-6 leading-tight">
            Get In <span className="italic text-academic-brand">Touch</span>
          </h2>
          <p className="text-academic-muted text-base sm:text-xl font-sans font-medium">
            Open for research collaborations, consulting, and academic speaking engagements.
          </p>
        </motion.div>

        <div className="border border-academic-border bg-white p-5 sm:p-10 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            
            <div>
              <h3 className="text-2xl font-serif font-medium text-academic-accent mb-8">Contact Information</h3>
              <div className="space-y-8">
                {contactInfo.email && (
                  <a href={`mailto:${contactInfo.email}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 text-academic-muted hover:text-academic-brand transition-colors duration-500 group">
                    <div className="mt-1 flex-shrink-0 text-academic-accent group-hover:text-academic-brand transition-colors duration-500">
                      <Mail size={24} strokeWidth={1} />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-academic-accent uppercase tracking-wider text-sm mb-1">Email</p>
                      <p className="font-sans font-medium break-all">{contactInfo.email}</p>
                    </div>
                  </a>
                )}
                {contactInfo.linkedin && (
                  <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 text-academic-muted hover:text-academic-brand transition-colors duration-500 group">
                    <div className="mt-1 flex-shrink-0 text-academic-accent group-hover:text-academic-brand transition-colors duration-500">
                      <LinkedinIcon size={24} />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-academic-accent uppercase tracking-wider text-sm mb-1">LinkedIn</p>
                      <p className="font-sans font-medium">View LinkedIn Profile</p>
                    </div>
                  </a>
                )}
                {contactInfo.orcid && (
                  <a href={contactInfo.orcid} target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 text-academic-muted hover:text-academic-brand transition-colors duration-500 group">
                    <div className="mt-1 flex-shrink-0 text-academic-accent group-hover:text-academic-brand transition-colors duration-500">
                      <BookOpen size={24} strokeWidth={1} />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-academic-accent uppercase tracking-wider text-sm mb-1">ORCID</p>
                      <p className="font-sans font-medium">View ORCID Profile</p>
                    </div>
                  </a>
                )}
                {contactInfo.whatsapp && (
                  <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 text-academic-muted hover:text-academic-brand transition-colors duration-500 group">
                    <div className="mt-1 flex-shrink-0 text-academic-accent group-hover:text-academic-brand transition-colors duration-500">
                      <MessageCircle size={24} strokeWidth={1} />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-academic-accent uppercase tracking-wider text-sm mb-1">WhatsApp</p>
                      <p className="font-sans font-medium">Chat on WhatsApp</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div>
              <form className="space-y-6" onSubmit={handleSubmit}>
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
                  <textarea 
                    rows={4} 
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="w-full px-4 py-3 bg-academic-surface border border-academic-border focus:outline-none focus:border-academic-brand transition-colors duration-500 font-sans font-medium resize-none rounded-none" 
                    placeholder="I would like to collaborate on..." 
                  />
                </div>
                
                {statusMsg && (
                  <div className={`p-4 font-sans text-sm font-medium ${
                    status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {statusMsg}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full py-4 bg-academic-accent text-white font-sans text-base font-bold tracking-wider uppercase hover:bg-academic-brand transition-colors duration-500 flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
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
