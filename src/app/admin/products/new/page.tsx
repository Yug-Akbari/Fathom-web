"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { APlusBlock } from "@/lib/data";

export default function ProductEditor() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data().name);
      setCategories(data);
      if (data.length > 0 && !category) {
        setCategory(data[0]);
      }
    });
    return () => unsub();
  }, []);
  // Image State (Multiple)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [visibility, setVisibility] = useState({
    mainPanel: false,
    bestSeller: false,
    featured: true,
    active: true
  });
  const [specs, setSpecs] = useState([
    { key: "DIMENSIONS", value: "" },
    { key: "CAPACITY", value: "" },
    { key: "FINISH", value: "" },
  ]);

  // A+ Content State
  const [aPlusContent, setAPlusContent] = useState<APlusBlock[]>([]);
  const [isUploadingAPlus, setIsUploadingAPlus] = useState(false);

  const addSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: "key" | "value", newValue: string) => {
    const updated = [...specs];
    updated[index][field] = newValue;
    setSpecs(updated);
  };

  // Compress image using canvas — ensures output is under MAX_BASE64_SIZE (3MB)
  const MAX_BASE64_SIZE = 3 * 1024 * 1024;

  const compressImage = (file: File, customMaxDim?: number, customQuality?: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = customMaxDim || 1024; // Max dimension for product images
        let { width, height } = img;

        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));

        ctx.drawImage(img, 0, 0, width, height);

        // Progressive compression: reduce quality until size is acceptable
        let quality = customQuality || 0.7;
        let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        while (compressedBase64.length > MAX_BASE64_SIZE && quality > 0.1) {
          quality -= 0.1;
          compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        }

        if (compressedBase64.length > MAX_BASE64_SIZE) {
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = Math.round(width * 0.5);
          smallCanvas.height = Math.round(height * 0.5);
          const smallCtx = smallCanvas.getContext('2d');
          if (smallCtx) {
            smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
            compressedBase64 = smallCanvas.toDataURL('image/jpeg', 0.6);
          }
        }

        console.log(`Compressed ${file.name}: ${(compressedBase64.length / 1024).toFixed(0)}KB (quality: ${quality.toFixed(1)})`);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadAPlusImage = async (file: File): Promise<string | null> => {
    setIsUploadingAPlus(true);
    try {
      const compressedBase64 = await compressImage(file, 2560, 0.95);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: compressedBase64, filename: file.name })
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error(err);
      alert("Failed to upload A+ image.");
      return null;
    } finally {
      setIsUploadingAPlus(false);
    }
  };

  // APlus Image Handler
  const handleAPlusImage = async (blockId: string, type: 'desktop' | 'mobile', e: React.ChangeEvent<HTMLInputElement>, slideIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAPlusImage(file);
    if (url) {
      setAPlusContent(prev => prev.map(block => {
        if (block.id !== blockId) return block;
        if (block.type === 'standalone') {
          return { ...block, [type === 'desktop' ? 'desktopImage' : 'mobileImage']: url };
        } else if (block.type === 'named_slide_group' || block.type === 'carousel_group') {
          const b = block as any;
          if (slideIdx === undefined || !b.slides) return block;
          const newSlides = [...b.slides];
          newSlides[slideIdx] = { ...newSlides[slideIdx], [type === 'desktop' ? 'desktopImage' : 'mobileImage']: url };
          return { ...block, slides: newSlides };
        }
        return block;
      }) as APlusBlock[]);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    for (const file of files) {
      try {
        const compressedBase64 = await compressImage(file);
        setImagesBase64(prev => [...prev, compressedBase64]);
      } catch (err) {
        console.error('Failed to compress image:', file.name, err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagesBase64(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImagesBase64(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name || !price || !sku) return alert("Please fill required fields (Name, Price, SKU)");
    setIsSaving(true);
    setUploadProgress("");
    
    try {
      let imageUrls: string[] = [];
      const failedUploads: string[] = [];

      // 1. Upload Images to GitHub (sequentially to avoid SHA conflicts)
      if (imagesBase64.length > 0 && imageFiles.length > 0) {
        for (let idx = 0; idx < imagesBase64.length; idx++) {
          const file = imageFiles[idx];
          setUploadProgress(`Uploading image ${idx + 1} of ${imagesBase64.length}...`);
          
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: imagesBase64[idx],
                filename: file.name
              })
            });

            if (!res.ok) {
              const errorText = await res.text();
              let errorMsg: string;
              try {
                const errorData = JSON.parse(errorText);
                errorMsg = errorData.error || 'Upload failed';
              } catch {
                errorMsg = errorText || `HTTP ${res.status}`;
              }
              console.error(`Failed to upload ${file.name}:`, errorMsg);
              failedUploads.push(file.name);
              continue;
            }

            const data = await res.json();
            imageUrls.push(data.url);
          } catch (uploadErr) {
            console.error(`Network error uploading ${file.name}:`, uploadErr);
            failedUploads.push(file.name);
            continue;
          }
        }
      }

      setUploadProgress("Saving product...");

      // 2. Save Product to Firebase
      await addDoc(collection(db, "products"), {
        name,
        description,
        price: parseFloat(price),
        sku,
        category,
        specs: specs.filter(s => s.key && s.value),
        isFeatured: visibility.featured,
        isActive: visibility.active,
        isBestSeller: visibility.bestSeller,
        isMainPanel: visibility.mainPanel,
        desc: visibility.mainPanel ? desc : "",
        image: imageUrls.length > 0 ? imageUrls[0] : "", // Cover image
        images: imageUrls, // Array of all uploaded images
        stockStatus: "In Stock",
        stockCount: 10,
        aPlusContent,
        createdAt: new Date().toISOString()
      });

      if (failedUploads.length > 0) {
        alert(`Product saved, but ${failedUploads.length} image(s) failed to upload: ${failedUploads.join(', ')}. The successfully uploaded images were saved.`);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Reset Form
      setName("");
      setDescription("");
      setDesc("");
      setPrice("");
      setSku("");
      setImageFiles([]);
      setImagePreviews([]);
      setImagesBase64([]);
      setAPlusContent([]);
      
    } catch (error) {
      console.error(error);
      alert("Failed to save product. Check console.");
    } finally {
      setIsSaving(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="flex flex-col max-w-7xl mx-auto h-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 flex items-center gap-2 mb-2">
            <span>Dashboard</span>
            <span className="text-gray-300">-</span>
            <span>Products</span>
            <span className="text-gray-300">-</span>
            <span className="text-primary">Edit Product</span>
          </div>
          <h1 className="text-3xl font-poppins font-bold text-primary">Obsidian Series Refrigerator</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-3.5 bg-white border border-gray-200 text-primary font-bold text-xs uppercase tracking-[0.1em] rounded-lg hover:border-gray-800 transition-colors shadow-sm">
            Preview
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={`w-48 py-3.5 rounded-lg font-bold text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-sm relative overflow-hidden ${
              saveSuccess ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-black'
            }`}
          >
            {isSaving ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : saveSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Saved!
              </motion.div>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Save Changes
              </>
            )}
            
            {/* Shimmer effect inside button on load */}
            <motion.div 
               animate={{ x: ["-100%", "200%"] }}
               transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 hidden group-hover:block"
            />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto pb-24">
        
        {/* Left Column (Main Form) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Product Details Block */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <h2 className="font-poppins font-bold text-lg mb-8 flex items-center gap-3">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
               Product Details
            </h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 relative group focus-within:text-primary">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">Product Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Obsidian Series French Door Refrigerator"
                  className="w-full bg-transparent border border-gray-200 rounded-lg p-4 text-base font-inter text-primary focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2 relative group focus-within:text-primary">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">
                  Short Description
                </label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A masterpiece of cooling technology...&#10;- Bullet point 1&#10;- Bullet point 2 (use new lines)"
                  className="w-full bg-[#FAF9F6] border border-gray-100 rounded-lg p-4 text-sm font-inter text-gray-600 focus:bg-white focus:border-primary outline-none transition-colors resize-none"
                />
                <span className="absolute -bottom-6 right-0 text-[10px] text-gray-400">Use new lines for bullet points</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                 <div className="flex flex-col gap-2 relative group focus-within:text-primary">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">Category</label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 rounded-lg p-4 text-sm font-inter text-primary focus:border-primary outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select Category</option>
                        {categories.map((cat, i) => (
                          <option key={i} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                 </div>
                 <div className="flex flex-col gap-2 relative group focus-within:text-primary">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">Price (INR)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 italic font-serif">₹</span>
                       <input 
                         type="number" 
                         value={price}
                         onChange={(e) => setPrice(e.target.value)}
                         placeholder="4899.00"
                         className="w-full bg-transparent border border-gray-200 rounded-lg py-4 pl-10 pr-4 text-base font-bold font-inter text-primary focus:border-primary outline-none transition-colors"
                       />
                    </div>
                 </div>
                 <div className="flex flex-col gap-2 relative group focus-within:text-primary">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">SKU</label>
                    <input 
                      type="text" 
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="FTHM-OBS-REF-04"
                      className="w-full bg-transparent border border-gray-200 rounded-lg p-4 text-base font-mono text-gray-500 focus:border-primary outline-none transition-colors uppercase"
                    />
                 </div>
              </div>
            </div>
          </div>

          {/* Technical Specs Block (Dynamic Array) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-poppins font-bold text-lg flex items-center gap-3">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 Technical Specifications
              </h2>
              <button onClick={addSpec} className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent hover:text-black transition-colors flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Add Spec
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <input 
                    type="text" 
                    value={spec.key}
                    onChange={(e) => updateSpec(i, 'key', e.target.value)}
                    placeholder="KEY"
                    className="w-40 bg-white border border-gray-200 rounded-lg px-4 py-3 text-xs font-bold tracking-[0.1em] uppercase focus:border-primary outline-none transition-colors"
                  />
                  <input 
                    type="text" 
                    value={spec.value}
                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                    placeholder="Value Description"
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-inter focus:border-primary outline-none transition-colors"
                  />
                  <button onClick={() => removeSpec(i)} className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded bg-transparent transition-colors opacity-0 group-hover:opacity-100">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Controls & Media) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Visibility Controls */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col gap-8">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-2">Visibility</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-primary">Best Seller</span>
                <span className="text-xs text-gray-500">Triggers gold badge on home</span>
              </div>
              <div 
                onClick={() => setVisibility({...visibility, bestSeller: !visibility.bestSeller})}
                className={`w-12 h-6 rounded-full relative cursor-pointer flex items-center shadow-inner transition-colors ${visibility.bestSeller ? 'bg-accent' : 'bg-gray-200'}`}
              >
                <motion.div 
                  layout
                  initial={false}
                  animate={{ left: visibility.bestSeller ? 24 : 4 }}
                  className="w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm flex items-center justify-center shrink-0"
                >
                  {visibility.bestSeller && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-accent"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-primary">Featured</span>
                <span className="text-xs text-gray-500">Show in main slider</span>
              </div>
              <div 
                onClick={() => setVisibility({...visibility, featured: !visibility.featured})}
                className={`w-12 h-6 rounded-full relative cursor-pointer flex items-center shadow-inner transition-colors ${visibility.featured ? 'bg-accent' : 'bg-gray-200'}`}
              >
                <motion.div 
                  layout
                  initial={false}
                  animate={{ left: visibility.featured ? 24 : 4 }}
                  className="w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm flex items-center justify-center shrink-0"
                >
                  {visibility.featured && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-accent"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-primary">Active Status</span>
                <span className="text-xs text-gray-500">Product is live</span>
              </div>
              <div 
                onClick={() => setVisibility({...visibility, active: !visibility.active})}
                className={`w-12 h-6 rounded-full relative cursor-pointer flex items-center shadow-inner transition-colors ${visibility.active ? 'bg-accent' : 'bg-gray-200'}`}
              >
                <motion.div 
                  layout
                  initial={false}
                  animate={{ left: visibility.active ? 24 : 4 }}
                  className="w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm flex items-center justify-center shrink-0"
                >
                  {visibility.active && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-accent"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </motion.div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-primary">Main Panel Product</span>
                  <span className="text-xs text-gray-500">Show in home page main slider</span>
                </div>
                <div 
                  onClick={() => setVisibility({...visibility, mainPanel: !visibility.mainPanel})}
                  className={`w-12 h-6 rounded-full relative cursor-pointer flex items-center shadow-inner transition-colors ${visibility.mainPanel ? 'bg-accent' : 'bg-gray-200'}`}
                >
                  <motion.div 
                    layout
                    initial={false}
                    animate={{ left: visibility.mainPanel ? 24 : 4 }}
                    className="w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm flex items-center justify-center shrink-0"
                  >
                    {visibility.mainPanel && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-accent"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </motion.div>
                </div>
              </div>

              {visibility.mainPanel && (
                <div className="flex flex-col gap-2 relative group focus-within:text-primary">
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">Hero Description</label>
                  <textarea 
                    rows={2}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Brief description for the main slider..."
                    className="w-full bg-[#FAF9F6] border border-gray-100 rounded-lg p-3 text-sm font-inter text-gray-600 focus:bg-white focus:border-primary outline-none transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          </div>          {/* Media Gallery */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Media Gallery</h3>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {/* Previews */}
               {imagePreviews.map((preview, i) => (
                 <div 
                   key={i} 
                   draggable
                   onDragStart={(e) => {
                     e.dataTransfer.setData('text/plain', i.toString());
                   }}
                   onDragOver={(e) => {
                     e.preventDefault();
                   }}
                   onDrop={(e) => {
                     e.preventDefault();
                     const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'));
                     if (draggedIdx === i || isNaN(draggedIdx)) return;
                     
                     // Reorder previews
                     setImagePreviews(prev => {
                       const newPreviews = [...prev];
                       const [draggedItem] = newPreviews.splice(draggedIdx, 1);
                       newPreviews.splice(i, 0, draggedItem);
                       return newPreviews;
                     });

                     // Reorder files if we are creating new product
                     if (typeof setImageFiles !== 'undefined') {
                       setImageFiles(prev => {
                         const newFiles = [...prev];
                         const [draggedFile] = newFiles.splice(draggedIdx, 1);
                         newFiles.splice(i, 0, draggedFile);
                         return newFiles;
                       });
                     }

                     // Reorder base64 strings
                     if (typeof setImagesBase64 !== 'undefined') {
                       setImagesBase64(prev => {
                         const newBase64 = [...prev];
                         const [draggedBase64] = newBase64.splice(draggedIdx, 1);
                         newBase64.splice(i, 0, draggedBase64);
                         return newBase64;
                       });
                     }
                   }}
                   className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group cursor-move"
                 >
                    {i === 0 && <div className="absolute top-2 left-2 z-10 bg-accent text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase shadow-sm pointer-events-none">Cover</div>}
                    <Image src={preview} alt={`Preview ${i}`} fill className="object-cover pointer-events-none" />
                    
                    {/* Delete overlay */}
                    <div className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center cursor-pointer" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                 </div>
               ))}

               {/* Add Image Dropzone */}
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="relative aspect-square bg-[#FAF9F6] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer group"
               >
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2 group-hover:-translate-y-1 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 <span className="text-[10px] font-bold tracking-widest uppercase">Add Images</span>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleImageChange} 
                   accept="image/*" 
                   multiple
                   className="hidden" 
                 />
               </div>
             </div>

             <p className="text-[10px] text-gray-400 mt-6 leading-relaxed">
               Recommended: 2048x2048px JPG or PNG. Drag and drop images to rearrange them.
             </p>
          </div>

          {/* A+ Premium Content */}
          {/* A+ Premium Content (Block Builder) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">A+ Premium Content Builder</h3>
              {isUploadingAPlus && <span className="text-xs text-accent animate-pulse font-bold">Uploading...</span>}
            </div>
            <p className="text-[10px] text-gray-400 mb-8">Build your custom A+ content layout by adding blocks. Drag blocks to reorder them.</p>

            {/* Blocks List */}
            <div className="space-y-6 mb-8">
              {aPlusContent.map((block, bi) => (
                <div 
                  key={block.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('blockIdx', bi.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedIdx = parseInt(e.dataTransfer.getData('blockIdx'));
                    if (draggedIdx === bi || isNaN(draggedIdx)) return;
                    setAPlusContent(prev => {
                      const updated = [...prev];
                      const [dragged] = updated.splice(draggedIdx, 1);
                      updated.splice(bi, 0, dragged);
                      return updated;
                    });
                  }}
                  className="border-2 border-gray-100 rounded-xl p-5 bg-white relative group/block shadow-sm"
                >
                  {/* Block Header */}
                  <div className="flex items-center justify-between mb-6 cursor-move pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-300"><path d="M8 6h8M8 12h8M8 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-widest">
                        {block.type === 'standalone' ? 'Standalone Banner' : block.type === 'named_slide_group' ? 'Named Slides (Tabs)' : 'Arrow Carousel'}
                      </span>
                    </div>
                    <button onClick={() => setAPlusContent(prev => prev.filter((_, idx) => idx !== bi))} className="text-gray-300 hover:text-red-500 transition-colors w-6 h-6 rounded-full hover:bg-red-50 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>

                  {/* Block Content */}
                  {block.type === 'standalone' && (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Mobile Image Box */}
                      <div className="relative aspect-square md:aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                        <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase shadow-sm pointer-events-none">
                          Mobile
                        </div>
                        {block.mobileImage ? (
                          <Image src={block.mobileImage} alt="Mobile" fill className="object-contain pointer-events-none" />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Upload Mobile</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center gap-3">
                          <label className="text-[10px] font-bold text-white border border-white/30 bg-black/40 px-3 py-1.5 rounded cursor-pointer hover:bg-white hover:text-black transition-colors w-32 text-center">
                            {block.mobileImage ? 'Update Mobile' : 'Add Mobile'}
                            <input type="file" accept="image/*" onChange={(e) => handleAPlusImage(block.id, 'mobile', e)} className="hidden" />
                          </label>
                        </div>
                      </div>

                      {/* Desktop Image Box */}
                      <div className="relative aspect-square md:aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                        <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase shadow-sm pointer-events-none">
                          Desktop
                        </div>
                        {block.desktopImage ? (
                          <Image src={block.desktopImage} alt="Desktop" fill className="object-contain pointer-events-none" />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Upload Desktop</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center gap-3">
                          <label className="text-[10px] font-bold text-white border border-white/30 bg-black/40 px-3 py-1.5 rounded cursor-pointer hover:bg-white hover:text-black transition-colors w-32 text-center">
                            {block.desktopImage ? 'Update Desktop' : 'Add Desktop'}
                            <input type="file" accept="image/*" onChange={(e) => handleAPlusImage(block.id, 'desktop', e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {(block.type === 'named_slide_group' || block.type === 'carousel_group') && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(block as any).slides?.map((slide: any, si: number) => (
                        <div 
                          key={si}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('slideIdx', si.toString())}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const draggedIdx = parseInt(e.dataTransfer.getData('slideIdx'));
                            if (draggedIdx === si || isNaN(draggedIdx)) return;
                            setAPlusContent(prev => prev.map(b => {
                              if (b.id !== block.id || !(b as any).slides) return b;
                              const updatedSlides = [...(b as any).slides];
                              const [dragged] = updatedSlides.splice(draggedIdx, 1);
                              updatedSlides.splice(si, 0, dragged);
                              return { ...b, slides: updatedSlides };
                            }) as APlusBlock[]);
                          }}
                          className="relative flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-move"
                        >
                          {/* Slide Title Input (if named slide group) */}
                          {block.type === 'named_slide_group' && (
                            <div className="absolute top-2 left-2 right-8 z-20">
                              <input 
                                type="text" 
                                placeholder="Tab Name..." 
                                value={slide.title || ''}
                                onChange={(e) => setAPlusContent(prev => prev.map(b => b.id === block.id && b.type === 'named_slide_group' ? { ...b, slides: (b as any).slides.map((s: any, idx: number) => idx === si ? { ...s, title: e.target.value } : s) } : b) as APlusBlock[])}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-[10px] text-white placeholder-white/50 outline-none focus:bg-black/80 shadow-sm"
                              />
                            </div>
                          )}

                          <button onClick={(e) => { e.stopPropagation(); setAPlusContent(prev => prev.map(b => b.id === block.id ? { ...b, slides: (b as any).slides?.filter((_: any, idx: number) => idx !== si) } : b) as APlusBlock[]); }} className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-md z-20">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>

                          {/* Mobile Half */}
                          <div className="flex-1 relative aspect-square border-r border-gray-200 group/mobile">
                            <div className="absolute bottom-2 left-2 z-10 bg-black/50 text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase pointer-events-none">
                              Mobile
                            </div>
                            {slide.mobileImage ? (
                              <Image src={slide.mobileImage} alt="Mobile" fill className="object-contain pointer-events-none" />
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-center px-1">Upload</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/mobile:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center">
                              <label className="text-[8px] font-bold text-white border border-white/30 bg-black/40 px-2 py-1 rounded cursor-pointer hover:bg-white hover:text-black transition-colors w-24 text-center">
                                {slide.mobileImage ? 'Update' : 'Add'}
                                <input type="file" accept="image/*" onChange={(e) => handleAPlusImage(block.id, 'mobile', e, si)} className="hidden" />
                              </label>
                            </div>
                          </div>

                          {/* Desktop Half */}
                          <div className="flex-1 relative aspect-square group/desktop">
                            <div className="absolute bottom-2 left-2 z-10 bg-black/50 text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase pointer-events-none">
                              Desktop
                            </div>
                            {slide.desktopImage ? (
                              <Image src={slide.desktopImage} alt="Desktop" fill className="object-contain pointer-events-none" />
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-center px-1">Upload</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/desktop:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center">
                              <label className="text-[8px] font-bold text-white border border-white/30 bg-black/40 px-2 py-1 rounded cursor-pointer hover:bg-white hover:text-black transition-colors w-24 text-center">
                                {slide.desktopImage ? 'Update' : 'Add'}
                                <input type="file" accept="image/*" onChange={(e) => handleAPlusImage(block.id, 'desktop', e, si)} className="hidden" />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Slide Button */}
                      <div 
                        onClick={() => setAPlusContent(prev => prev.map(b => b.id === block.id ? { ...b, slides: [...((b as any).slides || []), { title: "", desktopImage: "", mobileImage: "" }] } : b) as APlusBlock[])}
                        className="relative aspect-square bg-[#FAF9F6] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2 group-hover:-translate-y-1 transition-transform"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-center px-4">Add Empty<br/>Image Slot</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {aPlusContent.length === 0 && (
                <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm font-bold text-gray-400">No A+ content blocks yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Click a button below to add your first block.</p>
                </div>
              )}
            </div>

            {/* Add Block Toolbar */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
              <button onClick={() => setAPlusContent(prev => [...prev, { id: Date.now().toString(), type: 'standalone', desktopImage: '', mobileImage: '' }])} className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-bold tracking-widest uppercase text-gray-700 transition-colors flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Add Standalone Image
              </button>
              <button onClick={() => setAPlusContent(prev => [...prev, { id: Date.now().toString() + '1', type: 'named_slide_group', slides: [] }])} className="px-4 py-3 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-lg text-[10px] font-bold tracking-widest uppercase text-accent transition-colors flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Add Named Slides
              </button>
              <button onClick={() => setAPlusContent(prev => [...prev, { id: Date.now().toString() + '2', type: 'carousel_group', slides: [] }])} className="px-4 py-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold tracking-widest uppercase text-primary transition-colors flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Add Carousel
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
