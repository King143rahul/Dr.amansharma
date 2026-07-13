import React, { useEffect, useState, useRef } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { auth, db, storage } from "../lib/supabase";
import publicationOrder from "../data/publicationOrder.json";
import type { User } from "@supabase/supabase-js";
import { Trash2, Plus, Save, Upload, LogOut, Image, FileUp, Bold, Italic, Palette, KeyRound, Eye, EyeOff, ChevronLeft, ChevronRight, GraduationCap, Pencil, RefreshCw } from "lucide-react";

const getPhotosStoragePath = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const marker = "/object/public/Photos/";
    const markerIndex = parsedUrl.pathname.indexOf(marker);
    if (markerIndex === -1) return "";
    return decodeURIComponent(parsedUrl.pathname.slice(markerIndex + marker.length));
  } catch {
    const marker = "/Photos/";
    const markerIndex = url.indexOf(marker);
    return markerIndex === -1 ? "" : decodeURIComponent(url.slice(markerIndex + marker.length));
  }
};

const getDeletedCount = (data: unknown) => (Array.isArray(data) ? data.length : data ? 1 : 0);

const DESIGN_STYLE_OPTIONS = [
  { value: 'classic', label: 'Classic Academic' },
  { value: 'clean', label: 'Clean Modern' },
  { value: 'editorial', label: 'Editorial Italic' },
  { value: 'noto', label: 'Noto Serif' },
];

const normalizePublicationTitle = (title: string) => {
  const stopWords = new Set(['a', 'an', 'the', 'and', 'in', 'on', 'at', 'of', 'from', 'to', 'for', 'by', 'with', 'through', 'into', 'about', 'as']);
  return title
    .replace(/<[^>]*>/g, "")
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, "-") // normalize en-dash and em-dash to hyphen
    .replace(/[\u2018\u2019]/g, "'") // normalize curly single quotes to straight
    .replace(/[\u201C\u201D]/g, '"') // normalize curly double quotes to straight
    .replace(/[^a-z0-9\s]/g, "") // strip other punctuation/special characters
    .split(/\s+/)
    .filter(word => word && !stopWords.has(word))
    .join(" ")
    .trim();
};

const convertToWebP = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/webp') {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const webpFile = new File(
              [blob],
              `${nameWithoutExt}.webp`,
              { type: 'image/webp', lastModified: Date.now() }
            );
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Simple loader component
const Loader = () => (
  <div className="flex items-center justify-center py-8">
    <svg className="animate-spin h-8 w-8 text-academic-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  </div>
);

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-xl border border-academic-border bg-white p-6 shadow-2xl">
      <h3 className="editorial-heading mb-3 text-2xl">{title}</h3>
      <p className="mb-6 text-sm font-medium leading-relaxed text-academic-muted">{message}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-academic-border px-4 py-2 font-bold text-academic-accent hover:bg-academic-surface"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

type RichTextElement = HTMLInputElement | HTMLTextAreaElement;

const applyTextFormat = (
  element: RichTextElement | null,
  value: string,
  onChange: (value: string) => void,
  openTag: string,
  closeTag: string,
) => {
  const start = element?.selectionStart ?? value.length;
  const end = element?.selectionEnd ?? start;
  const selected = value.slice(start, end);
  const nextValue = `${value.slice(0, start)}${openTag}${selected}${closeTag}${value.slice(end)}`;

  onChange(nextValue);
  window.requestAnimationFrame(() => {
    element?.focus();
    const nextStart = start + openTag.length;
    const nextEnd = nextStart + selected.length;
    element?.setSelectionRange(nextStart, nextEnd);
  });
};

const RichTextToolbar = ({
  targetRef,
  value,
  onChange,
}: {
  targetRef: React.RefObject<RichTextElement | null>;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-academic-border bg-academic-surface/60 p-2">
    <button
      type="button"
      onClick={() => applyTextFormat(targetRef.current, value, onChange, "<strong>", "</strong>")}
      className="flex h-9 w-9 items-center justify-center rounded border border-academic-border bg-white text-academic-accent hover:border-academic-brand hover:text-academic-brand"
      aria-label="Bold selected text"
      title="Bold selected text"
    >
      <Bold size={16} />
    </button>
    <button
      type="button"
      onClick={() => applyTextFormat(targetRef.current, value, onChange, "<em>", "</em>")}
      className="flex h-9 w-9 items-center justify-center rounded border border-academic-border bg-white text-academic-accent hover:border-academic-brand hover:text-academic-brand"
      aria-label="Italic selected text"
      title="Italic selected text"
    >
      <Italic size={16} />
    </button>
    <label
      className="flex h-9 items-center gap-2 rounded border border-academic-border bg-white px-3 text-sm font-bold text-academic-accent hover:border-academic-brand hover:text-academic-brand"
      title="Color selected text"
    >
      <Palette size={16} />
      <input
        type="color"
        className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
        onChange={(event) =>
          applyTextFormat(
            targetRef.current,
            value,
            onChange,
            `<span style="color: ${event.target.value}">`,
            "</span>",
          )
        }
        aria-label="Color selected text"
      />
    </label>
  </div>
);

const RichTextField = ({
  label,
  value,
  onChange,
  multiline = false,
  rows = 2,
  placeholder,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
}) => {
  const fieldRef = useRef<RichTextElement | null>(null);
  const fieldClassName = `w-full p-3 border border-academic-border rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-brand/30 focus:border-academic-brand font-medium text-academic-text ${className}`;

  return (
    <div>
      {label && <label className="block text-sm font-bold text-academic-muted mb-2">{label}</label>}
      <RichTextToolbar targetRef={fieldRef} value={value} onChange={onChange} />
      {multiline ? (
        <textarea
          ref={fieldRef as React.RefObject<HTMLTextAreaElement>}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClassName}
        />
      ) : (
        <input
          ref={fieldRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClassName}
        />
      )}
    </div>
  );
};

// Authentication guard hook
function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    // 1. Get initial session
    auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  return { user, authLoading };
}

// Navigation items
const navItems = [
  { name: "General Settings", path: "general" },
  { name: "Biography", path: "bio" },
  { name: "Research Interests", path: "research" },
  { name: "Startup", path: "startup" },
  { name: "Publications", path: "publications" },
  { name: "Media Gallery", path: "media" },
  { name: "Manage Team", path: "team" },
  { name: "Form Submissions", path: "submissions" },
  { name: "Notification Emails", path: "emails" },
  { name: "Social Links", path: "social" },
  { name: "Change Password", path: "password" },
];

const Sidebar = ({ selected }: { selected: string }) => {
  const navigate = useNavigate();
  return (
    <nav className="bg-white border-r border-academic-border w-64 flex-shrink-0 hidden md:flex flex-col h-screen p-6 shadow-sm z-10">
      <h2 className="editorial-heading text-2xl mb-8 text-academic-brand">Admin Panel</h2>
      <ul className="space-y-2 flex-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <button
              onClick={() => navigate(`/admin/${item.path}`)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium ${
                selected === item.path 
                  ? "bg-academic-brand text-white shadow-sm" 
                  : "text-academic-muted hover:bg-academic-surface hover:text-academic-brand"
              }`}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => auth.signOut()}
        className="mt-4 flex items-center justify-center w-full px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
      >
        <LogOut className="mr-2" size={18} />
        Logout
      </button>
    </nav>
  );
};

const MobileTabs = ({ selected }: { selected: string }) => {
  const navigate = useNavigate();
  return (
    <div className="md:hidden bg-white border-b border-academic-border px-4 py-3 flex items-center justify-between gap-3 shadow-sm sticky top-0 z-10">
      <select
        value={selected}
        onChange={(e) => navigate(`/admin/${e.target.value}`)}
        className="min-w-0 flex-1 bg-academic-surface text-academic-text border border-academic-border rounded-lg p-2.5 text-sm font-medium focus:ring-1 focus:ring-academic-brand focus:outline-none"
      >
        {navItems.map((item) => (
          <option key={item.path} value={item.path}>
            {item.name}
          </option>
        ))}
      </select>
      <button onClick={() => auth.signOut()} className="flex min-h-11 min-w-11 items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Logout">
        <LogOut size={20} />
      </button>
    </div>
  );
};

// ----------------------- Section Editors ----------------------- //

const GeneralSettingsEditor = () => {
  const [name, setName] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroRoles, setHeroRoles] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [heroNameStyle, setHeroNameStyle] = useState("classic");
  const [footerNameStyle, setFooterNameStyle] = useState("clean");
  const [aboutSubheading, setAboutSubheading] = useState("");
  
  // Stats
  const [experienceValue, setExperienceValue] = useState("");
  const [patentsValue, setPatentsValue] = useState("");
  const [publicationsValue, setPublicationsValue] = useState("");
  const [grantsValue, setGrantsValue] = useState("");

  // Contact
  const [contactEmail, setContactEmail] = useState("");
  const [contactLinkedIn, setContactLinkedIn] = useState("");
  const [contactOrcid, setContactOrcid] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvUploading, setCvUploading] = useState(false);
  const [timelineItems, setTimelineItems] = useState<any[]>([]);

  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [profileUploading, setProfileUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await db
        .from('general_settings')
        .select('*')
        .eq('id', 'settings')
        .single();
      
      if (!error && data) {
        setName((data.name ?? "Dr Aman Sharma, MRSC").replace(/\bsharma\b/gi, 'Sharma').replace(/\bMSRC\b/g, 'MRSC'));
        setHeroSubtitle(data.heroSubtitle ?? "Sustainability Innovator & Researcher");
        setHeroRoles(data.heroRoles ?? "Assistant Professor of Chemistry in Bengaluru (Bangalore) | Materials Chemist | Founder, AMSH Endeavours");
        setHeroDesc(data.heroDesc ?? "Transforming bio-waste into advanced functional materials for sustainable water treatment and environmental remediation at the intersection of nanotechnology and green chemistry.");
        setHeroNameStyle(data.heroNameStyle ?? "classic");
        setFooterNameStyle(data.footerNameStyle ?? "clean");
        setAboutSubheading(data.aboutSubheading ?? "Pioneering the intersection of nanotechnology and green chemistry.");
        setExperienceValue(data.experienceValue ?? "4+");
        setPatentsValue(data.patentsValue ?? "4+");
        setPublicationsValue(data.publicationsValue ?? "20+");
        setGrantsValue(data.grantsValue ?? "1");
        setContactEmail(data.contactEmail ?? "AmanSharmaphd@gmail.com");
        setContactLinkedIn(data.contactLinkedIn ?? "https://www.linkedin.com/in/amansharmaphd/");
        setContactOrcid(data.contactOrcid ?? "https://orcid.org/0000-0000-0000-0000");
        setContactWhatsApp(data.contactWhatsApp ?? "");
        setCvUrl(data.cvUrl ?? "");
        setProfilePicUrl(data.profilePicUrl ?? "");
        if (data.seoDescription) {
          try {
            const parsed = JSON.parse(data.seoDescription);
            if (Array.isArray(parsed)) setTimelineItems(parsed);
          } catch (e) {
            console.error("Timeline parsing error", e);
          }
        }
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const save = async () => {
    setSaving(true);
    const capitalizedName = name.replace(/\bsharma\b/gi, 'Sharma');
    const { error } = await db.from('general_settings').upsert({
      id: 'settings',
      name: capitalizedName,
      heroSubtitle,
      heroRoles,
      heroDesc,
      heroNameStyle,
      footerNameStyle,
      aboutSubheading,
      experienceValue,
      patentsValue,
      publicationsValue,
      grantsValue,
      contactEmail,
      contactLinkedIn,
      contactOrcid,
      contactWhatsApp,
      cvUrl,
      profilePicUrl,
      seoDescription: JSON.stringify(timelineItems)
    });
    if (error) {
      console.error(error);
      alert(`Save failed: ${error.message}`);
    } else {
      alert("Settings saved successfully!");
    }
    setSaving(false);
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (10MB limit)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert("Upload failed: File size exceeds the 10MB limit.");
      return;
    }

    // Validate if it's an image
    if (!file.type.startsWith('image/')) {
      alert("Upload failed: Only image files are allowed.");
      return;
    }
    
    setProfileUploading(true);
    try {
      const webpFile = await convertToWebP(file);
      const filePath = `profile/${Date.now()}_${webpFile.name}`;
      const { error: uploadError } = await storage.upload(filePath, webpFile, {
        contentType: 'image/webp',
        upsert: true
      });
      if (uploadError) {
        throw uploadError;
      }

      const { data } = storage.getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      setProfilePicUrl(publicUrl);

      // Auto-save to database
      const { error: dbErr } = await db
        .from('general_settings')
        .update({ profilePicUrl: publicUrl })
        .eq('id', 'settings');
      
      if (dbErr) {
        console.error("Auto-save profile picture failed:", dbErr);
        alert(`Profile photo uploaded but save to settings failed: ${dbErr.message}`);
      } else {
        alert("Profile photo uploaded and saved successfully!");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setProfileUploading(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Upload failed: File size exceeds 10MB limit."); return; }
    if (file.type !== 'application/pdf') { alert("Upload failed: Only PDF files are allowed."); return; }
    
    setCvUploading(true);
    try {
      const filePath = `documents/${Date.now()}_${file.name}`;
      const { error: uploadError } = await storage.upload(filePath, file, { contentType: 'application/pdf', upsert: true });
      if (uploadError) throw uploadError;

      const { data } = storage.getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      setCvUrl(publicUrl);

      const { error: dbErr } = await db.from('general_settings').update({ cvUrl: publicUrl }).eq('id', 'settings');
      if (dbErr) alert(`CV uploaded but save failed: ${dbErr.message}`);
      else alert("CV uploaded and saved successfully!");
    } catch (err: any) { alert(`Upload failed: ${err.message}`); }
    finally { setCvUploading(false); }
  };

  const handleRemoveCv = async () => {
    setCvUrl("");
    const { error: dbErr } = await db.from('general_settings').update({ cvUrl: "" }).eq('id', 'settings');
    if (dbErr) alert(`Remove CV failed: ${dbErr.message}`);
    else alert("CV removed successfully!");
  };

  const handleRemoveProfilePic = async () => {
    setProfilePicUrl("");
    try {
      const { error: dbErr } = await db
        .from('general_settings')
        .update({ profilePicUrl: "" })
        .eq('id', 'settings');
      
      if (dbErr) {
        console.error("Auto-save remove profile picture failed:", dbErr);
        alert(`Profile photo removed from view but database update failed: ${dbErr.message}`);
      } else {
        alert("Profile photo removed and saved successfully!");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Remove failed: ${err.message}`);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5 sm:space-y-6">
          <div className="mt-8 rounded-lg border border-academic-border bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-academic-border pb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-academic-brand">Documents</p>
            <h3 className="editorial-heading text-xl sm:text-2xl">CV / Resume</h3>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {cvUrl ? (
              <div className="flex items-center gap-4">
                <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-academic-brand font-bold underline">View Current CV</a>
                <button type="button" onClick={handleRemoveCv} className="text-red-500 font-semibold hover:text-red-700">Remove</button>
              </div>
            ) : (
              <p className="text-academic-muted">No CV uploaded.</p>
            )}
            <label className="cursor-pointer flex items-center justify-center bg-academic-brand text-white px-5 py-2 rounded-lg hover:bg-emerald-800 transition">
              {cvUploading ? "Uploading..." : <><FileUp size={16} className="mr-2" /> Upload PDF</>}
              <input type="file" accept="application/pdf" onChange={handleCvUpload} className="hidden" disabled={cvUploading} />
            </label>
          </div>
        </div>
      <div className="mt-8 rounded-lg border border-academic-border bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-3 border-b border-academic-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-academic-brand">Appearance & Content</p>
            <h3 className="editorial-heading text-2xl sm:text-3xl">Hero Section & Profile</h3>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-academic-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-70"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
          <div className="space-y-4">
            <div>
              <RichTextField label="Researcher Name" value={name} onChange={setName} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-academic-muted">Home Name Font</span>
                <select
                  value={heroNameStyle}
                  onChange={(event) => setHeroNameStyle(event.target.value)}
                  className="w-full rounded-md border border-academic-border bg-white p-3 font-medium text-academic-text focus:border-academic-brand focus:outline-none focus:ring-2 focus:ring-academic-brand/20"
                >
                  {DESIGN_STYLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-academic-muted">Footer Name Font</span>
                <select
                  value={footerNameStyle}
                  onChange={(event) => setFooterNameStyle(event.target.value)}
                  className="w-full rounded-md border border-academic-border bg-white p-3 font-medium text-academic-text focus:border-academic-brand focus:outline-none focus:ring-2 focus:ring-academic-brand/20"
                >
                  {DESIGN_STYLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="rounded-lg border border-academic-border bg-academic-surface/50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-academic-muted">Live Font Preview</p>
              <div className={`${`name-display-${heroNameStyle}`} text-4xl leading-none text-academic-accent`}>
                {name || "Dr Aman Sharma, MRSC"}
              </div>
              <div className={`${`name-display-${footerNameStyle}`} mt-4 border-t border-academic-border pt-4 text-2xl leading-none text-academic-accent`}>
                {name || "Dr Aman Sharma, MRSC"}
              </div>
            </div>
            <div>
              <RichTextField label="Subtitle" value={heroSubtitle} onChange={setHeroSubtitle} />
            </div>
            <div>
              <RichTextField label="Roles / Titles" value={heroRoles} onChange={setHeroRoles} multiline rows={2} />
            </div>
            <div>
              <RichTextField label="Hero Description" value={heroDesc} onChange={setHeroDesc} multiline rows={3} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-start border border-dashed border-academic-border p-6 rounded-xl bg-academic-surface/30">
            <label className="block text-sm font-bold text-academic-muted mb-4 text-center">Profile Photo</label>
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-white shadow-md bg-white mb-4 group flex items-center justify-center">
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="Dr. Aman Sharma" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-academic-surface text-academic-muted">
                  <Image size={32} className="opacity-50 mb-1" />
                  <span className="text-xs">Default Photo</span>
                </div>
              )}
              {profileUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full">
              <label className="flex-1 cursor-pointer flex items-center justify-center bg-academic-brand text-white px-3 py-2 rounded text-xs font-bold hover:bg-academic-brand/90 transition shadow-sm text-center">
                Upload
                <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
              </label>
              {profilePicUrl && (
                <button
                  type="button"
                  onClick={handleRemoveProfilePic}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition"
                >
                  Reset
                </button>
              )}
            </div>
            <p className="text-[10px] text-academic-muted mt-2 text-center">Max size: 10MB. JPG, PNG, WEBP.</p>
          </div>
        </div>
      </div>

      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <h3 className="editorial-heading text-2xl sm:text-3xl mb-6">About Section Text</h3>
        <div>
          <RichTextField label="About Subheadline" value={aboutSubheading} onChange={setAboutSubheading} multiline rows={2} />
        </div>
      </div>

      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <h3 className="editorial-heading text-2xl sm:text-3xl mb-6">Home Page Stats</h3>
        <p className="text-academic-muted text-sm mb-4">Edit the key metric values shown in the stats circles on the Home page.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-2">Years Experience</label>
            <RichTextField value={experienceValue} onChange={setExperienceValue} />
          </div>
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-2">Filed Patents</label>
            <RichTextField value={patentsValue} onChange={setPatentsValue} />
          </div>
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-2">Publications</label>
            <RichTextField value={publicationsValue} onChange={setPublicationsValue} />
          </div>
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-2">Startup Govt Grant</label>
            <RichTextField value={grantsValue} onChange={setGrantsValue} />
          </div>
        </div>
      </div>

      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="editorial-heading text-2xl sm:text-3xl">Professional Timeline</h3>
          <button 
            type="button"
            onClick={() => setTimelineItems([...timelineItems, { id: Date.now(), year: "", title: "", organization: "", description: "", iconName: "Calendar" }])}
            className="flex items-center justify-center gap-2 bg-academic-surface text-academic-brand px-4 py-2 rounded-lg font-bold border border-academic-border hover:bg-academic-brand hover:text-white transition"
          >
            <Plus size={16} /> Add Entry
          </button>
        </div>
        <div className="space-y-4">
          {timelineItems.map((item, index) => (
            <div key={item.id} className="p-4 border border-academic-border rounded-xl bg-academic-surface/50 relative">
              <button 
                type="button"
                onClick={() => setTimelineItems(timelineItems.filter((_, i) => i !== index))}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mr-8">
                <div>
                  <label className="block text-xs font-bold text-academic-muted mb-1">Year</label>
                  <input type="text" value={item.year} onChange={(e) => {
                    const newItems = [...timelineItems];
                    newItems[index].year = e.target.value;
                    setTimelineItems(newItems);
                  }} className="w-full p-2 border border-academic-border rounded text-sm font-medium focus:ring-1 focus:ring-academic-brand focus:outline-none" placeholder="e.g. 2025" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-academic-muted mb-1">Icon</label>
                  <select value={item.iconName} onChange={(e) => {
                    const newItems = [...timelineItems];
                    newItems[index].iconName = e.target.value;
                    setTimelineItems(newItems);
                  }} className="w-full p-2 border border-academic-border rounded text-sm font-medium focus:ring-1 focus:ring-academic-brand focus:outline-none">
                    <option value="Calendar">Calendar</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Microscope">Microscope</option>
                    <option value="GraduationCap">Graduation Cap</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-academic-muted mb-1">Title / Role</label>
                  <input type="text" value={item.title} onChange={(e) => {
                    const newItems = [...timelineItems];
                    newItems[index].title = e.target.value;
                    setTimelineItems(newItems);
                  }} className="w-full p-2 border border-academic-border rounded text-sm font-medium focus:ring-1 focus:ring-academic-brand focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-academic-muted mb-1">Organization</label>
                  <input type="text" value={item.organization} onChange={(e) => {
                    const newItems = [...timelineItems];
                    newItems[index].organization = e.target.value;
                    setTimelineItems(newItems);
                  }} className="w-full p-2 border border-academic-border rounded text-sm font-medium focus:ring-1 focus:ring-academic-brand focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-academic-muted mb-1">Description</label>
                  <textarea value={item.description} onChange={(e) => {
                    const newItems = [...timelineItems];
                    newItems[index].description = e.target.value;
                    setTimelineItems(newItems);
                  }} className="w-full p-2 border border-academic-border rounded text-sm font-medium focus:ring-1 focus:ring-academic-brand focus:outline-none" rows={2}></textarea>
                </div>
              </div>
            </div>
          ))}
          {timelineItems.length === 0 && (
            <p className="text-academic-muted text-sm text-center py-4">No timeline items added. Defaults will be used if empty.</p>
          )}
        </div>
      </div>

      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <h3 className="editorial-heading text-2xl sm:text-3xl mb-6">Contact & Social Options</h3>
        <p className="text-academic-muted text-sm mb-4">Edit details displayed on the Contact section and administrative links.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-2">Contact Email</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full p-3 border border-academic-border rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-brand/30 focus:border-academic-brand font-medium text-academic-text" />
          </div>
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-2">LinkedIn URL</label>
            <input type="url" value={contactLinkedIn} onChange={(e) => setContactLinkedIn(e.target.value)} className="w-full p-3 border border-academic-border rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-brand/30 focus:border-academic-brand font-medium text-academic-text" />
          </div>
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-2">ORCID URL</label>
            <input type="url" value={contactOrcid} onChange={(e) => setContactOrcid(e.target.value)} className="w-full p-3 border border-academic-border rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-brand/30 focus:border-academic-brand font-medium text-academic-text" />
          </div>
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-2">WhatsApp Number (e.g. +919876543210)</label>
            <input type="text" value={contactWhatsApp} onChange={(e) => setContactWhatsApp(e.target.value)} className="w-full p-3 border border-academic-border rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-brand/30 focus:border-academic-brand font-medium text-academic-text" placeholder="+91..." />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={save} disabled={saving} className="flex w-full sm:w-auto items-center justify-center bg-academic-brand text-white px-6 py-2.5 rounded-lg hover:bg-academic-brand/90 transition shadow-sm font-medium disabled:opacity-70">
            {saving ? <Loader /> : <><Save className="mr-2" size={18} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const BioEditor = () => {
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBio = async () => {
      const { data, error } = await db
        .from('biography')
        .select('text')
        .eq('id', 'about')
        .single();
      
      if (!error && data) {
        setBio(data.text ?? "");
      }
      setLoading(false);
    };

    fetchBio();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await db.from('biography').upsert({
      id: 'about',
      text: bio
    });
    if (error) console.error(error);
    setSaving(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <h3 className="editorial-heading text-2xl sm:text-3xl mb-6">Edit Biography</h3>
        <p className="text-academic-muted mb-4 font-sans text-sm">Write your detailed biography here. This text will be displayed in the About section.</p>
        <RichTextField value={bio} onChange={setBio} multiline rows={10} className="bg-academic-surface/30 leading-relaxed" />
        <div className="mt-6 flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="flex w-full sm:w-auto items-center justify-center bg-academic-brand text-white px-6 py-2.5 rounded-lg hover:bg-academic-brand/90 transition shadow-sm font-medium disabled:opacity-70"
          >
            {saving ? <Loader /> : <><Save className="mr-2" size={18} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResearchInterestsEditor = () => {
  const [interests, setInterests] = useState<any[]>([]);
  const [newInterest, setNewInterest] = useState("");

  const fetchInterests = async () => {
    const { data, error } = await db
      .from('research_interests')
      .select('*');
    if (!error && data) {
      setInterests(data);
    }
  };

  useEffect(() => {
    fetchInterests();

    // Subscribe to real-time changes
    const channel = db
      .channel('admin_interests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'research_interests' },
        () => {
          fetchInterests();
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const addInterest = async () => {
    if (!newInterest.trim()) return;
    const { error } = await db.from('research_interests').insert({ text: newInterest.trim() });
    if (error) console.error(error);
    setNewInterest("");
  };

  const deleteInterest = async (id: string) => {
    const previousInterests = interests;
    setInterests((current) => current.filter((item) => item.id !== id));

    const { data, error } = await db
      .from('research_interests')
      .delete()
      .eq('id', id)
      .select('id');

    if (error || getDeletedCount(data) === 0) {
      console.error(error ?? `No research interest was deleted for id ${id}`);
      setInterests(previousInterests);
      alert(error ? `Delete failed: ${error.message}` : "Delete failed: no matching research interest was deleted.");
      return;
    }

    await fetchInterests();
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <h3 className="editorial-heading text-2xl sm:text-3xl mb-6">Research Interests</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1">
            <RichTextField
              value={newInterest}
              onChange={setNewInterest}
              placeholder="Add new research interest..."
              className="w-full"
            />
          </div>
          <button
            onClick={addInterest}
            className="flex items-center justify-center bg-academic-brand text-white px-5 py-3 rounded-lg hover:bg-academic-brand/90 transition shadow-sm font-medium"
          >
            <Plus className="mr-2" size={18} /> Add
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {interests.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-4 bg-academic-surface border border-academic-border/50 rounded-xl hover:border-academic-brand/30 transition-colors">
              <span className="min-w-0 break-words font-medium text-academic-text">{item.text}</span>
              <button onClick={() => deleteInterest(item.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StartupEditor = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [extendedDesc, setExtendedDesc] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [links, setLinks] = useState<Array<{ id: string; label: string; url: string }>>([]);
  const [newLink, setNewLink] = useState({ label: "", url: "" });
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStartup = async () => {
      const { data, error } = await db
        .from('startup')
        .select('*')
        .eq('id', 'section')
        .single();
      
      if (!error && data) {
        setTitle(data.title ?? "");
        setDesc(data.description ?? "");
        setExtendedDesc(data.extended_description ?? "");
        setFeatures(data.features ?? []);
        setLinks(data.externalLinks?.map((l: any, i: number) => ({ id: `${i}`, ...l })) ?? []);
        setPhotoUrl(data.photoUrl ?? "");
      }
    };

    fetchStartup();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await db.from('startup').upsert({
        id: 'section',
        title,
        description: desc,
        extended_description: extendedDesc,
        features,
        photoUrl,
        externalLinks: links.map(({ label, url }) => ({ label, url })),
      });
      if (error) {
        console.error(error);
        alert(`Save failed: ${error.message}`);
      } else {
        alert("Startup settings saved successfully!");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (10MB limit)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert("Upload failed: File size exceeds the 10MB limit.");
      return;
    }

    // Validate if it's an image
    if (!file.type.startsWith('image/')) {
      alert("Upload failed: Only image files are allowed.");
      return;
    }
    
    setUploading(true);
    try {
      const webpFile = await convertToWebP(file);
      const filePath = `startup/${Date.now()}_${webpFile.name}`;
      const { error: uploadError } = await storage.upload(filePath, webpFile, {
        contentType: 'image/webp',
        upsert: true
      });
      if (uploadError) {
        throw uploadError;
      }

      const { data } = storage.getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      setPhotoUrl(publicUrl);

      // Auto-save to database
      const { error: dbErr } = await db
        .from('startup')
        .update({ photoUrl: publicUrl })
        .eq('id', 'section');
      
      if (dbErr) {
        console.error("Auto-save startup photo failed:", dbErr);
        alert(`Startup photo uploaded but save to settings failed: ${dbErr.message}`);
      } else {
        alert("Startup photo uploaded and saved successfully!");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoUrl("");
    try {
      const { error: dbErr } = await db
        .from('startup')
        .update({ photoUrl: "" })
        .eq('id', 'section');
      
      if (dbErr) {
        console.error("Auto-save remove startup photo failed:", dbErr);
        alert(`Startup photo removed from view but database update failed: ${dbErr.message}`);
      } else {
        alert("Startup photo removed and saved successfully!");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Remove failed: ${err.message}`);
    }
  };

  const addLink = () => {
    if (!newLink.label.trim() || !newLink.url.trim()) return;
    setLinks([...links, { id: `${Date.now()}`, ...newLink }]);
    setNewLink({ label: "", url: "" });
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFeatures([...features, newFeature.trim()]);
    setNewFeature("");
  };

  const deleteFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <h3 className="editorial-heading text-2xl sm:text-3xl mb-6">Startup Section</h3>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8 mb-8">
          <div className="space-y-4">
            <RichTextField label="Section Title" value={title} onChange={setTitle} />
            <RichTextField label="Description" value={desc} onChange={setDesc} multiline rows={4} />
            <RichTextField label="Extended Description" value={extendedDesc} onChange={setExtendedDesc} multiline rows={6} />
          </div>
          <div className="flex flex-col items-center justify-start border border-dashed border-academic-border p-6 rounded-xl bg-academic-surface/30">
            <label className="block text-sm font-bold text-academic-muted mb-4 text-center">Startup Photo</label>
            <div className="relative w-full aspect-square border border-academic-border overflow-hidden bg-white mb-4 rounded-lg flex items-center justify-center shadow-sm">
              {photoUrl ? (
                <img src={photoUrl} alt="Startup Photo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-academic-muted p-4 text-center bg-academic-surface">
                  <Image size={32} className="opacity-50 mb-2" />
                  <span className="text-xs">No Custom Photo (uses fallback cards)</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full">
              <label className="flex-1 cursor-pointer flex items-center justify-center bg-academic-brand text-white px-3 py-2 rounded text-xs font-bold hover:bg-academic-brand/90 transition shadow-sm text-center">
                Upload
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[10px] text-academic-muted mt-2 text-center">Max size: 10MB. JPG, PNG, WEBP.</p>
          </div>
        </div>

        <h4 className="editorial-subheading text-lg mb-4 text-academic-brand">Features & Highlights</h4>
        <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-academic-surface p-4 rounded-xl border border-academic-border/50">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="E.g., Sustainable Wastewater Treatment"
            className="flex-1 p-3 border border-academic-border rounded-lg focus:outline-none focus:border-academic-brand"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFeature();
              }
            }}
          />
          <button
            onClick={addFeature}
            className="flex items-center justify-center bg-academic-text text-white px-5 py-3 rounded-lg hover:bg-black transition shadow-sm font-medium"
          >
            <Plus size={16} className="mr-2" /> Add Feature
          </button>
        </div>
        
        <ul className="space-y-3 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-academic-border p-4 rounded-xl shadow-sm">
              <span className="font-bold text-academic-accent mr-2">{feature}</span>
              <button onClick={() => deleteFeature(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>

        <h4 className="editorial-subheading text-lg mb-4 text-academic-brand">External Links</h4>
        <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-academic-surface p-4 rounded-xl border border-academic-border/50">
          <div className="flex-1">
            <RichTextField
              value={newLink.label}
              onChange={(value) => setNewLink({ ...newLink, label: value })}
              placeholder="Label (e.g. Website)"
            />
          </div>
          <input
            type="url"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="URL (https://...)"
            className="flex-1 p-3 border border-academic-border rounded-lg focus:outline-none focus:border-academic-brand"
          />
          <button
            onClick={addLink}
            className="flex items-center justify-center bg-academic-text text-white px-5 py-3 rounded-lg hover:bg-black transition shadow-sm font-medium"
          >
            <Plus size={16} className="mr-2" /> Add Link
          </button>
        </div>
        
        <ul className="space-y-3 mb-8">
          {links.map((l) => (
            <li key={l.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-academic-border p-4 rounded-xl shadow-sm">
              <div className="min-w-0">
                <span className="font-bold text-academic-accent mr-2">{l.label}</span>
                <span className="break-all text-academic-muted text-sm">{l.url}</span>
              </div>
              <button onClick={() => deleteLink(l.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex justify-end pt-4 border-t border-academic-border">
          <button
            onClick={save}
            disabled={saving}
            className="flex w-full sm:w-auto items-center justify-center bg-academic-brand text-white px-6 py-2.5 rounded-lg hover:bg-academic-brand/90 transition shadow-sm font-medium"
          >
            {saving ? <Loader /> : <><Save size={18} className="mr-2" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const FormSubmissionsViewer = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchSubmissions = async () => {
    const { data, error } = await db
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setSubmissions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();

    // Subscribe to real-time changes
    const channel = db
      .channel('admin_submissions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_submissions' },
        () => {
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const deleteSubmission = async (id: string) => {
    const { data, error } = await db
      .from('contact_submissions')
      .delete()
      .eq('id', id)
      .select('id');

    if (error || getDeletedCount(data) === 0) {
      console.error(error ?? `No contact submission was deleted for id ${id}`);
      alert(error ? `Delete failed: ${error.message}` : "Delete failed: no matching contact submission was deleted.");
      return;
    }

    await fetchSubmissions();
  };

  const requestDeleteSubmission = (id: string) => {
    setConfirmAction({
      title: "Delete submission?",
      message: "Do you want to delete this contact form submission?",
      confirmLabel: "Delete",
      onConfirm: () => {
        setConfirmAction(null);
        void deleteSubmission(id);
      },
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <h3 className="editorial-heading text-2xl sm:text-3xl mb-6">Contact Form Submissions</h3>
        <p className="text-academic-muted text-sm mb-6">View and manage messages sent through the Contact section on the website.</p>
        <div className="space-y-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="border border-academic-border p-6 rounded-xl bg-white shadow-sm hover:border-academic-brand/30 transition-all flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-bold text-academic-accent text-lg">{sub.name}</span>
                  <a href={`mailto:${sub.email}`} className="text-academic-brand hover:underline font-sans text-sm">{sub.email}</a>
                  <span className="text-xs text-academic-muted">{new Date(sub.created_at).toLocaleString()}</span>
                </div>
                <p className="text-academic-text whitespace-pre-wrap font-sans text-base leading-relaxed bg-academic-surface/30 p-4 rounded-lg border border-academic-border/50">{sub.message}</p>
              </div>
              <div className="flex items-start justify-end">
                <button
                  onClick={() => requestDeleteSubmission(sub.id)}
                  className="flex w-full md:w-auto items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100"
                >
                  <Trash2 size={16} className="mr-1.5" /> Delete
                </button>
              </div>
            </div>
          ))}
          {submissions.length === 0 && (
            <div className="text-center py-12 text-academic-muted bg-academic-surface/50 rounded-xl border border-dashed border-academic-border">
              <p className="font-medium">No contact submissions received yet.</p>
            </div>
          )}
        </div>
      </div>
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  );
};

// Publications editor
interface Publication {
  id: string;
  title: string;
  link: string;
  authors: string;
  venue: string;
  year: string;
  summary?: string;
}

const PublicationsEditor = () => {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [newPub, setNewPub] = useState<Omit<Publication, "id">>({ title: "", link: "", authors: "", venue: "", year: "", summary: "" });
  const [importing, setImporting] = useState(false);
  const [deletingPubIds, setDeletingPubIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);
  const [orcidId, setOrcidId] = useState("0000-0001-5024-292X");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPubs = async () => {
    const { data, error } = await db
      .from('publications')
      .select('*');

    if (error) {
      console.error(error);
      alert(`Failed to fetch publications: ${error.message}`);
    } else if (data) {
      // Sort by the Google Scholar exact order using publicationOrder.json
      data.sort((a, b) => {
        const indexA = publicationOrder.indexOf(a.title);
        const indexB = publicationOrder.indexOf(b.title);
        
        // If both are found in the array, sort by array index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // If only a is found, it comes first
        if (indexA !== -1) return -1;
        // If only b is found, it comes first
        if (indexB !== -1) return 1;
        
        // Fallback for new unmapped publications: sort by year descending
        return (b.year || '').localeCompare(a.year || '');
      });
      setPubs(data);
    }
  };

  useEffect(() => {
    fetchPubs();

    // Subscribe to real-time changes
    const channel = db
      .channel('admin_publications_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'publications' },
        () => {
          fetchPubs();
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const runOneTimeSync = async () => {
    try {
      const module = await import('../data/publications_with_abstracts.json');
      const allPubs = module.default;
      
      const { data: existing } = await db.from('publications').select('title');
      const existingTitles = new Set(existing?.map(e => e.title.trim().toLowerCase()) || []);
      
      const toInsert = allPubs.filter((p: any) => !existingTitles.has(p.title.trim().toLowerCase())).map((p: any) => ({
        title: p.title,
        authors: p.authors,
        venue: p.venue,
        year: p.year,
        link: p.link,
        summary: p.summary || ''
      }));

      if (toInsert.length > 0) {
        const { error } = await db.from('publications').insert(toInsert);
        if (error) throw error;
        alert('Synced ' + toInsert.length + ' publications to database!');
        fetchPubs();
      } else {
        alert('Database is already up to date with Google Scholar!');
      }
    } catch(err: any) {
      alert('Sync error: ' + err.message);
    }
  };

  const addPub = async () => {
    if (!newPub.title.trim()) return;

    const newTitleKey = normalizePublicationTitle(newPub.title);
    const isDuplicate = pubs.some((p) => normalizePublicationTitle(p.title) === newTitleKey);
    if (isDuplicate) {
      alert("A publication with this title already exists in your database!");
      return;
    }

    const { error } = await db.from('publications').insert(newPub);
    if (error) {
      console.error(error);
      alert(`Save failed: ${error.message}`);
      return;
    }
    setNewPub({ title: "", link: "", authors: "", venue: "", year: "", summary: "" });
    await fetchPubs();
  };

  const deletePub = async (id: string) => {
    const previousPubs = pubs;
    setDeletingPubIds((ids) => new Set(ids).add(id));
    setPubs((current) => current.filter((pub) => pub.id !== id));

    const { data, error } = await db
      .from('publications')
      .delete()
      .eq('id', id)
      .select('id');

    if (error || getDeletedCount(data) === 0) {
      console.error(error ?? `No publication was deleted for id ${id}`);
      setPubs(previousPubs);
      alert(error ? `Delete failed: ${error.message}` : "Delete failed: no matching publication was deleted.");
    } else {
      await fetchPubs();
    }

    setDeletingPubIds((ids) => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
  };

  const requestDeletePub = (id: string) => {
    setConfirmAction({
      title: "Delete publication?",
      message: "Do you want to delete this publication from the admin panel and public website?",
      confirmLabel: "Delete",
      onConfirm: () => {
        setConfirmAction(null);
        void deletePub(id);
      },
    });
  };

  const getDuplicatePublicationIds = () => {
    const seenTitles = new Set<string>();
    const duplicateIds: string[] = [];

    pubs.forEach((pub) => {
      const key = normalizePublicationTitle(pub.title);
      if (!key) return;
      if (seenTitles.has(key)) {
        duplicateIds.push(pub.id);
      } else {
        seenTitles.add(key);
      }
    });

    return duplicateIds;
  };

  const removeDuplicatePublications = async () => {
    const duplicateIds = getDuplicatePublicationIds();
    if (duplicateIds.length === 0) {
      alert("No duplicate publications found.");
      return;
    }

    const previousPubs = pubs;
    setPubs((current) => current.filter((pub) => !duplicateIds.includes(pub.id)));
    const { data, error } = await db
      .from('publications')
      .delete()
      .in('id', duplicateIds)
      .select('id');

    const deletedCount = getDeletedCount(data);
    if (error || deletedCount === 0) {
      console.error(error ?? "No duplicate publications were deleted.");
      setPubs(previousPubs);
      alert(error ? `Duplicate removal failed: ${error.message}` : "Duplicate removal failed: no matching duplicate publications were deleted.");
      return;
    }

    await fetchPubs();
  };

  const requestRemoveDuplicates = () => {
    const duplicateIds = getDuplicatePublicationIds();
    setConfirmAction({
      title: duplicateIds.length ? "Remove duplicate publications?" : "No duplicates found",
      message: duplicateIds.length
        ? `Found ${duplicateIds.length} duplicate publication${duplicateIds.length === 1 ? "" : "s"}. This will keep the first copy and remove the extra copies.`
        : "There are no duplicate publication titles to remove.",
      confirmLabel: duplicateIds.length ? "Remove Duplicates" : "OK",
      onConfirm: () => {
        setConfirmAction(null);
        if (duplicateIds.length > 0) {
          void removeDuplicatePublications();
        }
      },
    });
  };

  const updatePub = async (id: string, updates: Partial<Publication>) => {
    setPubs((current) => current.map((pub) => (pub.id === id ? { ...pub, ...updates } : pub)));
    const { error } = await db.from('publications').update(updates).eq('id', id);
    if (error) {
      console.error(error);
      alert(`Update failed: ${error.message}`);
      await fetchPubs();
    }
  };

  const parseBibTeX = (bibtex: string) => {
    const entries: Omit<Publication, "id">[] = [];
    const entryRegex = /@(\w+)\s*{\s*([^,]+),([^@]*)}/gs;
    let match;
    while ((match = entryRegex.exec(bibtex)) !== null) {
      const fieldsStr = match[3];
      const fields: any = {};
      const fieldRegex = /(\w+)\s*=\s*(?:{([^}]*)}|"([^"]*)"|([^,\s]+))/g;
      let fieldMatch;
      while ((fieldMatch = fieldRegex.exec(fieldsStr)) !== null) {
        const key = fieldMatch[1].toLowerCase();
        const val = fieldMatch[2] || fieldMatch[3] || fieldMatch[4];
        fields[key] = val ? val.replace(/[\n\r]+/g, ' ').trim() : "";
      }
      
      entries.push({
        title: fields.title || "Untitled",
        authors: fields.author ? fields.author.replace(/ and /g, ', ') : "Unknown",
        venue: fields.journal || fields.booktitle || fields.publisher || "",
        year: fields.year || new Date().getFullYear().toString(),
        link: fields.url || (fields.doi ? `https://doi.org/${fields.doi}` : ""),
        summary: fields.abstract || "",
      });
    }
    return entries;
  };

  const handleBibtexImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    const text = await file.text();
    const parsedPubs = parseBibTeX(text);
    
    // Filter duplicates
    const existingTitles = new Set(pubs.map((p) => normalizePublicationTitle(p.title)));
    const nonDuplicates = parsedPubs.filter(
      (p) => !existingTitles.has(normalizePublicationTitle(p.title))
    );

    if (nonDuplicates.length === 0) {
      alert("Import complete: All publications in the BibTeX file already exist in your database!");
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    const { error } = await db.from('publications').insert(nonDuplicates);
    if (error) console.error(error);
    
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    alert(`Successfully imported ${nonDuplicates.length} new publications! (Skipped ${parsedPubs.length - nonDuplicates.length} duplicates)`);
  };

  const handleOrcidImport = async () => {
    if (!orcidId.trim()) {
      alert("Please enter your ORCID iD.");
      return;
    }

    setImporting(true);
    try {
      // Fetch Works list summary first
      const worksRes = await fetch(`https://pub.orcid.org/v3.0/${orcidId.trim()}/works`, {
        headers: {
          "Accept": "application/json"
        }
      });

      if (!worksRes.ok) throw new Error("Failed to fetch works list from ORCID. Ensure your ORCID iD is correct.");
      const worksData = await worksRes.json();

      const groups = worksData.group || [];
      const putCodes = groups
        .map((g: any) => g["work-summary"]?.[0]?.["put-code"])
        .filter(Boolean);

      const existingTitles = new Set(pubs.map((p) => normalizePublicationTitle(p.title)));
      const newPubsToImport = [];

      // Fetch works details in chunks of 50
      const batchSize = 50;
      const fetchedBulk: any[] = [];
      for (let i = 0; i < putCodes.length; i += batchSize) {
        const chunk = putCodes.slice(i, i + batchSize);
        const batchRes = await fetch(`https://pub.orcid.org/v3.0/${orcidId.trim()}/works/${chunk.join(',')}`, {
          headers: {
            "Accept": "application/json"
          }
        });
        if (batchRes.ok) {
          const batchData = await batchRes.json();
          if (batchData.bulk) {
            fetchedBulk.push(...batchData.bulk);
          }
        }
      }

      for (const bulkItem of fetchedBulk) {
        const work = bulkItem.work;
        if (!work) continue;

        const title = work.title?.title?.value || "Untitled";
        const cleanedTitle = normalizePublicationTitle(title);
        if (existingTitles.has(cleanedTitle)) continue;

        const year = work["publication-date"]?.year?.value || new Date().getFullYear().toString();
        const venue = work["journal-title"]?.value || "";
        const link = work.url?.value || (work["external-ids"]?.["external-id"]?.[0]?.["external-id-url"]?.value) || "";
        
        // Parse authors from contributors list
        const contributorList = work.contributors?.contributor || [];
        const authorsList = contributorList
          .map((c: any) => c["credit-name"]?.value)
          .filter(Boolean);
        const authors = authorsList.length > 0 ? authorsList.join(", ") : "Aman Sharma";

        newPubsToImport.push({
          title,
          year,
          venue,
          link,
          authors,
          summary: ""
        });

        existingTitles.add(cleanedTitle); // avoid duplicates in the same session
      }

      if (newPubsToImport.length > 0) {
        const { error } = await db.from('publications').insert(newPubsToImport);
        if (error) throw error;
        alert(`Successfully imported ${newPubsToImport.length} new publications from ORCID!`);
      } else {
        alert("Import complete: No new publications found. All works are already up-to-date!");
      }
    } catch (err: any) {
      console.error(err);
      alert(`ORCID Import Error: ${err.message}`);
    } finally {
      setImporting(false);
      await fetchPubs();
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="editorial-card p-5 sm:p-8 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="editorial-heading text-2xl sm:text-3xl">Publications</h3>
              <span className="bg-academic-brand/10 text-academic-brand px-3 py-1 rounded-full text-xs font-bold border border-academic-brand/20">
                {pubs.length} Total
              </span>
            </div>
            <p className="text-academic-muted text-sm mt-1">Manage publications or import from Google Scholar/ORCID.</p>
          </div>
          
          <div className="flex w-full flex-col sm:flex-row gap-4 md:w-auto">
            <button
              type="button"
              onClick={requestRemoveDuplicates}
              className="flex items-center justify-center rounded-lg border border-academic-brand bg-white px-4 py-2 text-sm font-bold text-academic-brand shadow-sm transition hover:bg-academic-brand hover:text-white"
            >
              Remove Duplicates
            </button>
            {/* Google Scholar JSON Sync */}
            <div className="w-full bg-academic-surface p-3 rounded-lg border border-blue-500/20 flex flex-col items-center sm:w-auto">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Google Scholar Sync</span>
              <button
                onClick={runOneTimeSync}
                className="flex w-full items-center justify-center bg-white text-blue-500 border border-blue-500 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition shadow-sm font-medium text-sm"
              >
                <RefreshCw size={16} className="mr-2" /> Sync Missing
              </button>
            </div>
            {/* BibTeX Import */}
            <div className="w-full bg-academic-surface p-3 rounded-lg border border-academic-brand/20 flex flex-col items-center sm:w-auto">
              <span className="text-xs font-bold text-academic-brand uppercase tracking-wider mb-2">BibTeX Import</span>
              <input 
                type="file" 
                accept=".bib" 
                ref={fileInputRef}
                onChange={handleBibtexImport}
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex w-full items-center justify-center bg-white text-academic-brand border border-academic-brand px-4 py-2 rounded-lg hover:bg-academic-brand hover:text-white transition shadow-sm font-medium text-sm disabled:opacity-50"
              >
                {importing ? <Loader /> : <><FileUp size={16} className="mr-2" /> Upload .bib File</>}
              </button>
            </div>

            {/* ORCID Import */}
            <div className="w-full bg-academic-surface p-3 rounded-lg border border-academic-brand/20 flex flex-col items-center sm:w-auto">
              <span className="text-xs font-bold text-academic-brand uppercase tracking-wider mb-2">ORCID Auto-Import</span>
              <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
                <input
                  type="text"
                  placeholder="Your ORCID iD"
                  value={orcidId}
                  onChange={(e) => setOrcidId(e.target.value)}
                  className="p-2 text-sm border border-academic-border rounded focus:outline-none focus:border-academic-brand"
                />
                <button
                  onClick={handleOrcidImport}
                  disabled={importing}
                  className="flex justify-center items-center bg-academic-brand text-white border border-academic-brand px-4 py-2 rounded hover:bg-academic-brand/90 transition shadow-sm font-medium text-sm disabled:opacity-50"
                >
                  {importing ? <Loader /> : "Sync from ORCID"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-academic-surface p-6 rounded-xl border border-academic-border mb-8">
          <h4 className="font-bold text-academic-accent mb-4 flex items-center">
            <Plus size={18} className="mr-2 text-academic-brand" /> Add Manually
          </h4>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <RichTextField placeholder="Title" value={newPub.title} onChange={(value) => setNewPub({...newPub, title: value})} />
            <RichTextField placeholder="Authors (comma separated)" value={newPub.authors} onChange={(value) => setNewPub({...newPub, authors: value})} />
            <RichTextField placeholder="Venue / Journal" value={newPub.venue} onChange={(value) => setNewPub({...newPub, venue: value})} />
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <RichTextField placeholder="Year" value={newPub.year} onChange={(value) => setNewPub({...newPub, year: value})} />
              </div>
              <input type="url" placeholder="Link (URL/DOI)" value={newPub.link} onChange={(e) => setNewPub({...newPub, link: e.target.value})} className="flex-1 p-3 border border-academic-border rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-brand/30" />
            </div>
            <div className="md:col-span-2">
              <RichTextField placeholder="Research Summary / Abstract" value={newPub.summary || ""} onChange={(value) => setNewPub({...newPub, summary: value})} multiline rows={3} />
            </div>
          </div>
          <button onClick={addPub} className="w-full sm:w-auto bg-academic-text text-white px-5 py-2.5 rounded-lg hover:bg-black transition font-medium">
            Save Publication
          </button>
        </div>

        <div className="space-y-4">
          {pubs.map((p) => (
            <div key={p.id} className="border border-academic-border p-5 rounded-xl bg-white shadow-sm transition-all hover:border-academic-brand/30">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-2">
                  <RichTextField value={p.year} onChange={(value) => updatePub(p.id, { year: value })} placeholder="Year" className="font-bold text-xl text-academic-brand" />
                </div>
                <div className="md:col-span-10 space-y-2">
                  <RichTextField value={p.title} onChange={(value) => updatePub(p.id, { title: value })} placeholder="Title" className="font-bold text-lg text-academic-accent" />
                  <RichTextField value={p.authors} onChange={(value) => updatePub(p.id, { authors: value })} placeholder="Authors" className="text-academic-muted text-sm" />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <RichTextField value={p.venue} onChange={(value) => updatePub(p.id, { venue: value })} placeholder="Venue" className="text-academic-muted text-sm italic" />
                    </div>
                    <input type="url" value={p.link} onChange={(e) => updatePub(p.id, { link: e.target.value })} className="flex-1 p-1 border border-transparent hover:border-academic-border focus:border-academic-brand focus:outline-none text-blue-600 text-sm transition-colors rounded" placeholder="Link URL" />
                  </div>
                  <div>
                    <RichTextField value={p.summary || ""} onChange={(value) => updatePub(p.id, { summary: value })} placeholder="Research Summary" multiline rows={3} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-academic-border/50">
                <button onClick={() => requestDeletePub(p.id)} disabled={deletingPubIds.has(p.id)} className="flex w-full sm:w-auto items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded transition-colors text-sm font-medium disabled:opacity-60">
                  <Trash2 size={16} className="mr-1.5" /> {deletingPubIds.has(p.id) ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
          {pubs.length === 0 && (
            <div className="text-center py-10 text-academic-muted">
              No publications added yet. Import a BibTeX file or add one manually above.
            </div>
          )}
        </div>
      </div>
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  );
};

const MediaGallery = () => {
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingImageIds, setDeletingImageIds] = useState<Set<string>>(new Set());
  const [captionStatus, setCaptionStatus] = useState<{[id: string]: 'idle' | 'saving' | 'saved'}>({});
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchImages = async () => {
    const { data, error } = await db
      .from('media_gallery')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (!error && data) {
      setImages(data);
    }
  };

  useEffect(() => {
    fetchImages();

    // Subscribe to real-time changes
    const channel = db
      .channel('admin_media_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'media_gallery' },
        () => {
          fetchImages();
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (10MB limit = 10 * 1024 * 1024 bytes)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert("Upload failed: File size exceeds the 10MB limit.");
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert("Upload failed: Only image files are allowed.");
      return;
    }
    
    setUploading(true);
    try {
      const webpFile = await convertToWebP(file);
      const filePath = `media/${Date.now()}_${webpFile.name}`;
      const { error: uploadError } = await storage.upload(filePath, webpFile, {
        contentType: 'image/webp',
        upsert: true
      });
      if (uploadError) {
        throw uploadError;
      }

      const { data } = storage.getPublicUrl(filePath);
      const { error: dbError } = await db.from('media_gallery').insert({ url: data.publicUrl, display_order: -Math.floor(Date.now() / 1000) });
      if (dbError) {
        throw dbError;
      }
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (docId: string, url: string) => {
    const previousImages = images;
    setDeletingImageIds((ids) => new Set(ids).add(docId));
    setImages((current) => current.filter((image) => image.id !== docId));

    const { data, error } = await db
      .from('media_gallery')
      .delete()
      .eq('id', docId)
      .select('id');

    if (error || getDeletedCount(data) === 0) {
      console.error(error ?? `No gallery image was deleted for id ${docId}`);
      setImages(previousImages);
      alert(error ? `Delete failed: ${error.message}` : "Delete failed: no matching gallery image was deleted.");
    } else {
      const filePath = getPhotosStoragePath(url);
      if (filePath) {
        const { error: storageError } = await storage.remove([filePath]);
        if (storageError) {
          console.error(storageError);
        }
      }
      await fetchImages();
    }

    setDeletingImageIds((ids) => {
      const next = new Set(ids);
      next.delete(docId);
      return next;
    });
  };

  const requestDeleteImage = (docId: string, url: string) => {
    setConfirmAction({
      title: "Delete image?",
      message: "Do you want to delete this image from the gallery?",
      confirmLabel: "Delete",
      onConfirm: () => {
        setConfirmAction(null);
        void deleteImage(docId, url);
      },
    });
  };

  const updateCaption = async (id: string, caption: string) => {
    setCaptionStatus((prev) => ({ ...prev, [id]: 'saving' }));
    const { error } = await db
      .from('media_gallery')
      .update({ caption })
      .eq('id', id);
    if (error) {
      console.error(error);
      alert(`Failed to update caption: ${error.message}`);
      setCaptionStatus((prev) => ({ ...prev, [id]: 'idle' }));
    } else {
      setCaptionStatus((prev) => ({ ...prev, [id]: 'saved' }));
      setTimeout(() => {
        setCaptionStatus((prev) => ({ ...prev, [id]: 'idle' }));
      }, 2000);
      await fetchImages();
    }
  };
    const reorderImage = async (currentIndex: number, newPosition: number) => {
    const targetIndex = Math.max(0, Math.min(images.length - 1, newPosition - 1));
    if (currentIndex === targetIndex) return;

    const newOrder = [...images];
    const [movedItem] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    // Update display_order sequentially
    const updates = newOrder.map((img, i) => ({ ...img, display_order: i + 1 }));
    setImages(updates);

    // Persist to DB
    for (const u of updates) {
      await db.from('media_gallery').update({ display_order: u.display_order }).eq('id', u.id);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto relative">
      {uploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white transition-opacity duration-300">
          <svg className="animate-spin h-16 w-16 text-academic-brand mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <h2 className="font-sans font-bold text-xl uppercase tracking-widest text-academic-brand mb-2">Uploading Photo</h2>
          <p className="font-serif italic text-sm text-academic-muted/80">Please wait while the image is uploaded to academic archive...</p>
        </div>
      )}
      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8">
          <h3 className="editorial-heading text-2xl sm:text-3xl">Media Gallery</h3>
          <label className="cursor-pointer flex items-center justify-center bg-academic-brand text-white px-5 py-2.5 rounded-lg hover:bg-academic-brand/90 transition shadow-sm font-medium">
            <Upload size={18} className="mr-2" /> Upload Image
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {images.map((img, index) => (
            <div key={img.id} className="flex flex-col bg-white border border-academic-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-academic-surface flex items-center justify-center group">
                <img src={img.url} alt="gallery" className="object-cover w-full h-full" />
                
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 p-1.5 rounded-lg backdrop-blur-sm z-10" onClick={e => e.stopPropagation()}>
                  <label className="text-[10px] font-bold text-white/90 uppercase ml-1">Order</label>
                  <select
                    value={index + 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val !== index + 1) {
                        reorderImage(index, val);
                      }
                    }}
                    className="bg-white text-academic-text font-bold text-xs px-1.5 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-academic-brand cursor-pointer"
                  >
                    {images.map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => requestDeleteImage(img.id, img.url)}
                    disabled={deletingImageIds.has(img.id)}
                    className="bg-red-500 text-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-lg"
                    aria-label="Delete image"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-3 border-t border-academic-border bg-academic-surface/30 space-y-2">
                <input
                  type="text"
                  placeholder="Add caption..."
                  defaultValue={img.caption || ""}
                  onBlur={async (e) => {
                    const newCaption = e.target.value;
                    if (newCaption !== (img.caption || "")) {
                      await updateCaption(img.id, newCaption);
                    }
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      target.blur();
                    }
                  }}
                  className="w-full text-xs p-2 border border-academic-border rounded bg-white text-academic-text focus:outline-none focus:border-academic-brand"
                />
                <div className="flex justify-between items-center text-[10px] px-0.5">
                  <span className="text-academic-muted/50 font-sans">Press Enter or blur to save</span>
                  {captionStatus[img.id] === 'saving' && (
                    <span className="text-academic-brand font-bold animate-pulse font-sans">Saving...</span>
                  )}
                  {captionStatus[img.id] === 'saved' && (
                    <span className="text-emerald-600 font-bold font-sans">✓ Saved</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full text-center py-12 text-academic-muted bg-academic-surface/50 rounded-xl border border-dashed border-academic-border">
              <Image size={48} className="mx-auto mb-4 opacity-20" />
              <p>No images uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  );
};

const SocialLinksEditor = () => {
  const [links, setLinks] = useState<{label: string, href: string, icon: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data, error } = await db.from('general_settings').select('socialLinks').eq('id', 'settings').single();
      if (!error && data?.socialLinks) {
        setLinks(data.socialLinks);
      } else {
        // default if none
        setLinks([
          { label: 'Google Scholar', href: '#', icon: 'GraduationCap' },
          { label: 'LinkedIn', href: '#', icon: 'Linkedin' },
        ]);
      }
      setLoading(false);
    };
    fetchLinks();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await db.from('general_settings').update({ socialLinks: links }).eq('id', 'settings');
    if (error) alert(`Save failed: ${error.message}`);
    else alert('Social links saved successfully!');
    setSaving(false);
  };

  const addLink = () => setLinks([...links, { label: 'New Link', href: '#', icon: 'Link' }]);
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));
  const updateLink = (index: number, field: string, val: string) => {
    const updated = [...links];
    (updated[index] as any)[field] = val;
    setLinks(updated);
  };
  const moveLink = (index: number, dir: 'up'|'down') => {
    if (dir === 'up' && index === 0) return;
    if (dir === 'down' && index === links.length - 1) return;
    const target = dir === 'up' ? index - 1 : index + 1;
    const updated = [...links];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setLinks(updated);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-academic-border pb-4">
          <h3 className="editorial-heading text-2xl sm:text-3xl">Social Links</h3>
          <button onClick={save} disabled={saving} className="bg-academic-brand text-white px-5 py-2 rounded-lg font-bold hover:bg-emerald-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <div className="space-y-4">
          {links.map((link, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 items-center bg-academic-surface p-4 rounded-xl border border-academic-border">
              <div className="flex flex-col gap-2 w-full">
                <input type="text" value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} className="p-2 border rounded-md" placeholder="Label (e.g. LinkedIn)" />
                <input type="text" value={link.href} onChange={e => updateLink(i, 'href', e.target.value)} className="p-2 border rounded-md" placeholder="URL" />
                <input type="text" value={link.icon} onChange={e => updateLink(i, 'icon', e.target.value)} className="p-2 border rounded-md" placeholder="Lucide Icon Name (e.g. Linkedin, Twitter, Mail)" />
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => moveLink(i, 'up')} disabled={i===0} className="p-2 bg-white rounded-md border shadow-sm disabled:opacity-30"><ChevronLeft size={16} className="rotate-90" /></button>
                <button onClick={() => moveLink(i, 'down')} disabled={i===links.length-1} className="p-2 bg-white rounded-md border shadow-sm disabled:opacity-30"><ChevronRight size={16} className="rotate-90" /></button>
                <button onClick={() => removeLink(i)} className="p-2 bg-red-500 text-white rounded-md"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addLink} className="mt-6 flex items-center gap-2 text-academic-brand font-bold hover:underline">
          <Plus size={18} /> Add Link
        </button>
      </div>
    </div>
  );
};



const NotificationEmailsEditor = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      const { data, error } = await db.from('general_settings').select('notificationEmails').eq('id', 'settings').single();
      if (!error && data?.notificationEmails) {
        setEmails(data.notificationEmails);
      } else {
        setEmails(['AmanSharmaphd@gmail.com']);
      }
      setLoading(false);
    };
    fetchEmails();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await db.from('general_settings').update({ notificationEmails: emails }).eq('id', 'settings');
    if (error) alert(`Save failed: ${error.message}`);
    else alert('Notification emails saved successfully!');
    setSaving(false);
  };

  const addEmail = () => setEmails([...emails, '']);
  const removeEmail = (index: number) => setEmails(emails.filter((_, i) => i !== index));
  const updateEmail = (index: number, val: string) => {
    const updated = [...emails];
    updated[index] = val;
    setEmails(updated);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="editorial-card p-5 sm:p-8 rounded-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-academic-border pb-4">
          <h3 className="editorial-heading text-2xl sm:text-3xl">Form Notification Emails</h3>
          <button onClick={save} disabled={saving} className="bg-academic-brand text-white px-5 py-2 rounded-lg font-bold hover:bg-emerald-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        <p className="text-academic-muted text-sm mb-6 font-sans">
          Add or remove the email addresses that should receive a notification when someone submits the contact form.
        </p>

        <div className="space-y-4">
          {emails.map((email, i) => (
            <div key={i} className="flex gap-4 items-center bg-academic-surface p-4 rounded-xl border border-academic-border">
              <input 
                type="email" 
                value={email} 
                onChange={e => updateEmail(i, e.target.value)} 
                className="p-2 border rounded-md w-full" 
                placeholder="Email Address (e.g. name@example.com)" 
              />
              <button onClick={() => removeEmail(i)} className="p-2 bg-red-500 text-white rounded-md shrink-0 hover:bg-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addEmail} className="mt-6 flex items-center gap-2 text-academic-brand font-bold hover:underline">
          <Plus size={18} /> Add Email Address
        </button>
      </div>
    </div>
  );
};

const ChangePasswordEditor = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await auth.updateUser({ password });
      if (updateError) throw updateError;

      setPassword("");
      setConfirmPassword("");
      setMessage("Password changed successfully.");
    } catch (err: any) {
      setError(err.message || "Password change failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <form onSubmit={savePassword} className="editorial-card p-5 sm:p-8 rounded-2xl">
        <h3 className="editorial-heading text-2xl sm:text-3xl mb-2 flex items-center">
          <KeyRound className="mr-3 text-academic-brand" size={26} />
          Change Password
        </h3>
        <p className="text-academic-muted text-sm mb-6">Update the password for the currently signed-in admin account.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-1" htmlFor="admin-new-password">
              New Password
            </label>
            <div className="relative">
              <input
                id="admin-new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className="w-full p-3 pr-10 rounded-lg bg-academic-bg border border-academic-border text-academic-text focus:outline-none focus:border-academic-brand focus:ring-1 focus:ring-academic-brand transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-academic-muted hover:text-academic-brand"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-academic-muted mb-1" htmlFor="admin-confirm-password">
              Confirm Password
            </label>
            <input
              id="admin-confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="w-full p-3 rounded-lg bg-academic-bg border border-academic-border text-academic-text focus:outline-none focus:border-academic-brand focus:ring-1 focus:ring-academic-brand transition"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-8 flex w-full items-center justify-center bg-academic-brand text-white px-6 py-3 rounded-lg hover:bg-academic-brand/90 transition shadow-sm font-medium disabled:opacity-70"
        >
          {saving ? <Loader /> : <><Save size={18} className="mr-2" /> Save New Password</>}
        </button>
      </form>
    </div>
  );
};

// ----------------------- Team/Students Editor ----------------------- //

const TeamEditor = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states for adding/editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [achievements, setAchievements] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchTeam = async () => {
    setLoading(true);
    const { data, error } = await db
      .from('media_gallery')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) {
      const studentList = data
        .filter((item: any) => {
          try {
            const parsed = JSON.parse(item.caption);
            return parsed && parsed.type === 'student';
          } catch {
            return false;
          }
        })
        .map((item: any) => {
          const parsed = JSON.parse(item.caption);
          return {
            id: item.id,
            url: item.url,
            name: parsed.name || "",
            role: parsed.role || "",
            achievements: parsed.achievements || "",
            display_order: item.display_order || 0
          };
        });
      setStudents(studentList);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setAchievements("");
    setPhotoUrl("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert("Only image files are allowed.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Student name is required.");
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUrl = photoUrl;

      // Upload image if selected
      if (selectedFile) {
        setUploading(true);
        const webpFile = await convertToWebP(selectedFile);
        const filePath = `team/${Date.now()}_${webpFile.name}`;
        const { error: uploadError } = await storage.upload(filePath, webpFile, {
          contentType: 'image/webp',
          upsert: true
        });
        if (uploadError) throw uploadError;

        const { data } = storage.getPublicUrl(filePath);
        finalPhotoUrl = data.publicUrl;
        setUploading(false);
      }

      const captionObj = {
        type: 'student',
        name: name.trim(),
        role: role.trim(),
        achievements: achievements.trim()
      };

      const captionStr = JSON.stringify(captionObj);

      if (editingId) {
        // Update
        const { error } = await db
          .from('media_gallery')
          .update({
            url: finalPhotoUrl,
            caption: captionStr
          })
          .eq('id', editingId);
        if (error) throw error;
        alert("Student updated successfully!");
      } else {
        // Insert
        const { error } = await db
          .from('media_gallery')
          .insert({
            url: finalPhotoUrl,
            caption: captionStr,
            display_order: -Math.floor(Date.now() / 1000)
          });
        if (error) throw error;
        alert("Student added successfully!");
      }

      resetForm();
      await fetchTeam();
    } catch (err: any) {
      console.error(err);
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleEdit = (student: any) => {
    setEditingId(student.id);
    setName(student.name);
    setRole(student.role);
    setAchievements(student.achievements);
    setPhotoUrl(student.url);
    setSelectedFile(null);
  };

  const handleDelete = async (docId: string, url: string) => {
    const { data, error } = await db
      .from('media_gallery')
      .delete()
      .eq('id', docId)
      .select('id');

    if (error || getDeletedCount(data) === 0) {
      console.error(error);
      alert(error ? `Delete failed: ${error.message}` : "Delete failed.");
    } else {
      const filePath = getPhotosStoragePath(url);
      if (filePath) {
        await storage.remove([filePath]).catch(console.error);
      }
      alert("Student deleted successfully!");
      await fetchTeam();
      if (editingId === docId) {
        resetForm();
      }
    }
  };

  const requestDelete = (docId: string, url: string) => {
    setConfirmAction({
      title: "Delete Student?",
      message: "Do you want to remove this student from your group list?",
      confirmLabel: "Delete",
      onConfirm: () => {
        setConfirmAction(null);
        void handleDelete(docId, url);
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h2 className="editorial-heading text-3xl sm:text-4xl mb-6 font-serif">Manage Students & Team</h2>
      
      {/* Edit Form */}
      <form onSubmit={handleSave} className="editorial-card p-6 sm:p-8 rounded-2xl mb-8 space-y-6">
        <h3 className="editorial-heading text-xl sm:text-2xl">
          {editingId ? "Edit Student Profile" : "Add New Student"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-academic-muted mb-2">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. John Doe"
                className="w-full p-3 border border-academic-border rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-brand/30 focus:border-academic-brand font-medium text-academic-text"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-academic-muted mb-2">Role / Designation</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. PhD Scholar, Postdoc, Master's Student"
                className="w-full p-3 border border-academic-border rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-brand/30 focus:border-academic-brand font-medium text-academic-text"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-academic-muted mb-2">Achievements / Project Info</label>
              <textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="e.g. Won Best Poster Award at RSC 2026. Researching functional polymer nanomaterials."
                rows={3}
                className="w-full p-3 border border-academic-border rounded-lg focus:outline-none focus:ring-2 focus:ring-academic-brand/30 focus:border-academic-brand font-medium text-academic-text"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border border-dashed border-academic-border rounded-xl p-4 bg-academic-surface/30">
            {photoUrl ? (
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-academic-brand mb-4">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-40 h-40 rounded-full bg-academic-border/30 flex items-center justify-center text-academic-muted mb-4">
                <GraduationCap size={48} />
              </div>
            )}
            
            <label className="cursor-pointer bg-white border border-academic-border hover:border-academic-brand text-academic-brand hover:text-white hover:bg-academic-brand font-bold py-2 px-4 rounded-lg transition text-sm flex items-center gap-2">
              <Upload size={16} />
              {photoUrl ? "Change Photo" : "Upload Photo"}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <p className="text-[10px] text-academic-muted mt-2">Max size: 10MB. Formats: PNG, JPG, WEBP.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end pt-4 border-t border-academic-border/60">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-academic-border px-4 py-2.5 font-bold text-academic-accent hover:bg-academic-surface"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-academic-brand text-white font-bold py-2.5 px-6 rounded-lg hover:bg-academic-brand/90 transition flex items-center gap-2 disabled:opacity-75"
          >
            {saving || uploading ? <Loader /> : <><Plus size={18} /> {editingId ? "Update Student" : "Add Student"}</>}
          </button>
        </div>
      </form>

      {/* List of current students */}
      <div className="editorial-card p-6 sm:p-8 rounded-2xl">
        <h3 className="editorial-heading text-xl sm:text-2xl mb-6 font-serif">Current Students List</h3>
        
        {loading ? (
          <Loader />
        ) : students.length === 0 ? (
          <p className="text-academic-muted text-sm font-medium text-center py-6">No students added yet.</p>
        ) : (
          <div className="divide-y divide-academic-border/60">
            {students.map((student) => (
              <div key={student.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-academic-surface/60 border border-academic-border shrink-0">
                    {student.url ? (
                      <img src={student.url} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-full h-full p-2 text-academic-muted/50" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-academic-accent text-lg leading-tight">{student.name}</h4>
                    <p className="text-xs text-academic-brand font-semibold font-sans tracking-wide uppercase mt-0.5">{student.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(student)}
                    className="p-2 text-academic-brand hover:bg-academic-surface rounded-lg transition"
                    title="Edit profile"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => requestDelete(student.id, student.url)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete profile"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  );
};

// ----------------------- Main Admin Dashboard ----------------------- //

export default function AdminDashboard() {
  const { user, authLoading } = useCurrentUser();
  const location = useLocation();
  const selected = location.pathname.split("/admin/")[1]?.split("/")[0] || "general";

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-academic-bg">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-academic-bg chemistry-grid">
      <Sidebar selected={selected} />
      <div className="min-w-0 flex-1 flex flex-col md:max-h-screen md:overflow-hidden">
        <MobileTabs selected={selected} />
        <main className="flex-1 overflow-y-auto pb-24">
          <Routes>
            <Route path="general" element={<GeneralSettingsEditor />} />
            <Route path="bio" element={<BioEditor />} />
            <Route path="research" element={<ResearchInterestsEditor />} />
            <Route path="startup" element={<StartupEditor />} />
            <Route path="publications" element={<PublicationsEditor />} />
            <Route path="media" element={<MediaGallery />} />
            <Route path="team" element={<TeamEditor />} />
            <Route path="submissions" element={<FormSubmissionsViewer />} />
            <Route path="emails" element={<NotificationEmailsEditor />} />
            <Route path="social" element={<SocialLinksEditor />} />
            <Route path="password" element={<ChangePasswordEditor />} />
            <Route path="*" element={<Navigate to="general" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
