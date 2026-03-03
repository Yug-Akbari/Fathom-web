"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProductEditor({ params }: { params: { id: string } }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Refrigeration");
  // Image State (Multiple)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [visibility, setVisibility] = useState({
    bestSeller: false,
    featured: true,
    active: true
  });
  const [specs, setSpecs] = useState([
    { key: "DIMENSIONS", value: "" },
    { key: "CAPACITY", value: "" },
    { key: "FINISH", value: "" },
  ]);

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
  // Uses progressive quality reduction: starts at 70%, drops by 10% each pass
  const MAX_BASE64_SIZE = 3 * 1024 * 1024; // 3MB - safe margin under Vercel's 4.5MB limit

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1024; // Max dimension for product images
        let { width, height } = img;

        // Scale down if needed, maintaining aspect ratio
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
        let quality = 0.7;
        let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        while (compressedBase64.length > MAX_BASE64_SIZE && quality > 0.1) {
          quality -= 0.1;
          compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        }

        // If still too large even at minimum quality, reduce dimensions further
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const d = docSnap.data();
          setName(d.name || "");
          setDescription(d.description || "");
          setPrice(d.price?.toString() || "");
          setSku(d.sku || "");
          setCategory(d.category || "Refrigeration");
          setVisibility({
             bestSeller: !!d.isBestSeller,
             featured: !!d.isFeatured,
             active: !!d.isActive
          });
          
          if (d.specs?.length > 0) {
             setSpecs(d.specs);
          }
          
          if (d.images?.length > 0) {
             setImagePreviews(d.images);
             // We don't hydrate File/Base64 states for existing URLs, 
             // but we will send these existing URLs back up during save
          } else if (d.image) {
             setImagePreviews([d.image]);
          }
        }
      } catch (e) {
        console.error("Error loading product", e);
      } finally {
        setIsInitializing(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Compress and read Base64 for each file
    for (const file of files) {
      try {
        const compressedBase64 = await compressImage(file);
        setImagesBase64(prev => [...prev, compressedBase64]);
      } catch (err) {
        console.error('Failed to compress image:', file.name, err);
        // Fallback to uncompressed if compression fails
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
              continue; // Skip this image but continue with others
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

      // Capture existing image URLs that haven't been deleted
      const existingUrls = imagePreviews.filter(p => p.startsWith('http'));

      // 2. Update Product in Firebase
      await updateDoc(doc(db, "products", params.id), {
        name,
        description,
        price: parseFloat(price),
        sku,
        category,
        specs: specs.filter(s => s.key && s.value),
        isFeatured: visibility.featured,
        isActive: visibility.active,
        isBestSeller: visibility.bestSeller,
        image: [...existingUrls, ...imageUrls].length > 0 ? [...existingUrls, ...imageUrls][0] : "", // Cover image
        images: [...existingUrls, ...imageUrls], // Array of all appended images
      });

      if (failedUploads.length > 0) {
        alert(`Product saved, but ${failedUploads.length} image(s) failed to upload: ${failedUploads.join(', ')}. The successfully uploaded images were saved.`);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Don't reset form since we're still editing, just clear upload states
      setImageFiles([]);
      setImagesBase64([]);
      
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
              {isInitializing ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin ml-2" />
              ) : (
                <span className="text-primary">{name || "Unnamed Product"}</span>
              )}
            </div>
            <h1 className="text-3xl font-poppins font-bold text-primary">{name || "Edit Product"}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {uploadProgress && (
            <span className="text-xs text-gray-500 animate-pulse">{uploadProgress}</span>
          )}
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
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">Short Description</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A masterpiece of cooling technology..."
                  className="w-full bg-[#FAF9F6] border border-gray-100 rounded-lg p-4 text-sm font-inter text-gray-600 focus:bg-white focus:border-primary outline-none transition-colors resize-none"
                />
                <span className="absolute -bottom-6 right-0 text-[10px] text-gray-400">104/160 characters</span>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-4">
                 <div className="flex flex-col gap-2 relative group focus-within:text-primary">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 group-focus-within:text-accent transition-colors">Price (USD)</label>
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
          </div>

          {/* Media Gallery */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
             <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-6">Media Gallery</h3>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {/* Previews */}
               {imagePreviews.map((preview, i) => (
                 <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                    {i === 0 && <div className="absolute top-2 left-2 z-10 bg-accent text-white px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase shadow-sm">Cover</div>}
                    <Image src={preview} alt={`Preview ${i}`} fill className="object-cover" />
                    
                    {/* Delete overlay */}
                    <div className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center cursor-pointer" onClick={() => removeImage(i)}>
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
               Recommended: 2048x2048px JPG or PNG.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
