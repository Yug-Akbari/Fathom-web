"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";

export default function CategoryManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  // New category state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [displayOrder, setDisplayOrder] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    });
    return () => unsub();
  }, []);

  const handleSaveCategory = async () => {
    if (!name) return alert("Category Name is required.");
    setIsSubmitting(true);
    try {
      let imageUrl = "";

      if (imageBase64 && imageFile) {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            filename: imageFile.name
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Image upload failed");
        imageUrl = data.url;
      }

      if (editingCategory) {
        // UPDATE existing category
        await updateDoc(doc(db, "categories", editingCategory.id), {
          name,
          description,
          status,
          displayOrder: parseInt(displayOrder) || 0,
          tags: tags.split(",").map(t => t.trim()),
          image: imageUrl || editingCategory.image || "",
        });
      } else {
        // ADD new category
        await addDoc(collection(db, "categories"), {
          name,
          description,
          status,
          displayOrder: parseInt(displayOrder) || 0,
          tags: tags.split(",").map(t => t.trim()),
          productCount: 0,
          image: imageUrl,
          createdAt: new Date().toISOString()
        });
      }
      setIsSidebarOpen(false);
      setName("");
      setDescription("");
      setStatus("Active");
      setDisplayOrder("");
      setTags("");
      setImageFile(null);
      setImagePreview(null);
      setImageBase64(null);
      setEditingCategory(null);
    } catch (e) {
      console.error(e);
      alert("Error adding category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteDoc(doc(db, "categories", id));
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full overflow-hidden relative">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-2 mb-1">
            Dashboard
          </span>
          <h1 className="text-3xl font-poppins font-bold text-primary mb-2">Category Management</h1>
          <p className="text-gray-500 font-inter text-sm max-w-xl">Organize and manage your product catalog structure.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setEditingCategory(null); setName(""); setDescription(""); setStatus("Active"); setDisplayOrder(""); setTags(""); setImageFile(null); setImagePreview(null); setImageBase64(null); setIsSidebarOpen(true); }}
            className="bg-[#D4AF37] text-white font-bold text-xs uppercase tracking-[0.1em] px-6 py-3.5 rounded-lg hover:bg-[#b5952f] transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Add New Category
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {categories.length === 0 ? (
          <div className="text-center col-span-full py-12 text-gray-400">No categories found. Add one to get started.</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="h-48 bg-gray-100 relative items-center justify-center flex">
                 {cat.image ? (
                   <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                 ) : (
                   <span className="text-gray-400 font-medium">No Image</span>
                 )}
              </div>
              <div className="p-6 relative">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="font-poppins font-bold text-xl text-primary">{cat.name}</h3>
                   <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-sm ${cat.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                     {cat.status}
                   </span>
                 </div>
                 <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{cat.description || "No description provided."}</p>
                 <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {cat.productCount || 0} Products Linked
                 </div>
                 
                 <div className="border-t border-gray-100 pt-4 flex gap-4">
                    <button 
                      onClick={() => {
                        setEditingCategory(cat);
                        setName(cat.name || "");
                        setDescription(cat.description || "");
                        setStatus(cat.status || "Active");
                        setDisplayOrder(String(cat.displayOrder || ""));
                        setTags(Array.isArray(cat.tags) ? cat.tags.join(", ") : "");
                        setImagePreview(cat.image || null);
                        setIsSidebarOpen(true);
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-accent hover:text-black transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition"
                    >
                      Delete
                    </button>
                    {/* Add edit button if needed in future */}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/40 z-40" 
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-poppins font-bold text-primary">{editingCategory ? "Edit Category" : "New Category"}</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-black">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-gray-500">Category Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Smart Ovens" className="border border-gray-200 rounded-lg px-4 py-3 focus:border-accent outline-none" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-gray-500">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description for SEO and display" rows={4} className="border border-gray-200 rounded-lg px-4 py-3 focus:border-accent outline-none resize-none" />
                </div>
                
                <div 
                  className={`border ${imagePreview ? 'border-solid border-gray-200' : 'border-dashed border-gray-300'} rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden`}
                >
                  {imagePreview ? (
                    <>
                      <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview(null);
                            setImageBase64(null);
                          }}
                          className="px-4 py-2 bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded shadow-lg"
                        >
                          Remove Image
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400 mb-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <p className="text-sm font-medium"><span onClick={() => fileInputRef.current?.click()} className="text-accent cursor-pointer font-bold">Upload a file</span> or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-gray-500">Display Order</label>
                    <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} placeholder="0" className="border border-gray-200 rounded-lg px-4 py-3 focus:border-accent outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-gray-500">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-3 focus:border-accent outline-none bg-white">
                      <option>Active</option>
                      <option>Draft</option>
                      <option>Archived</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-center relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <span className="bg-white px-4 text-xs font-bold tracking-widest uppercase text-gray-400 relative">Metadata</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-gray-500">Tags</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="kitchen, electrical, luxury" className="border border-gray-200 rounded-lg px-4 py-3 focus:border-accent outline-none" />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
                <button onClick={() => setIsSidebarOpen(false)} className="flex-1 py-4 font-bold tracking-widest uppercase text-xs border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCategory}
                  disabled={isSubmitting}
                  className="flex-1 py-4 font-bold tracking-widest uppercase text-xs bg-accent text-white rounded-lg hover:bg-black transition disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
