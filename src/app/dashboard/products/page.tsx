"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, FileText } from "lucide-react"
import { getProductsWithDocuments } from "@/app/dashboard/actions/products"
import { ShareDocumentButton } from "@/components/ShareDocumentButton"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

// Type Definitions
type ProductMedia = {
  id: string
  media_url: string
  type: string
}

type Document = {
  id: string
  title: string
  category: string
  valid_regions: string[]
  file_url: string
}

type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  category: string | null
  ph_level: number | null
  usp: string | null
  features_benefits: string | null
  applications: string | null
  ingredients: string | null
  directions_to_use: string | null
  documents: Document[]
  product_media: ProductMedia[]
}

const CATEGORIES = ["Cleaning", "Polishing", "Maintenance", "Restoration", "Hardware", "Software"]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [phRange, setPhRange] = useState([0, 14])

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      const { success, data, error } = await getProductsWithDocuments()
      if (success && data) {
        setProducts(data as Product[])
      } else {
        setError(error || "Failed to load products")
      }
      setIsLoading(false)
    }

    loadProducts()
  }, [])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategories.length === 0 || (product.category && selectedCategories.includes(product.category))
    const ph = product.ph_level ?? 7 // Default to 7 if null for filtering purposes
    const matchesPh = ph >= phRange[0] && ph <= phRange[1]
    return matchesCategory && matchesPh
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Product Catalog</h2>

          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-3">Categories</h3>
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-3">
                <Checkbox
                  id={`cat-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <label
                  htmlFor={`cat-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 hidden md:block">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">pH Level</h3>
            <span className="text-xs text-muted-foreground">{phRange[0]} - {phRange[1]}</span>
          </div>
          <Slider
            defaultValue={[0, 14]}
            max={14}
            min={0}
            step={1}
            value={phRange}
            onValueChange={setPhRange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Acidic (0)</span>
            <span>Alkaline (14)</span>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="flex-1 min-w-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-24 text-muted-foreground">
            Loading products...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-24 text-red-500 font-medium">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6">
            {filteredProducts.map((product) => (
              <Dialog key={product.id}>
                <DialogTrigger asChild>
                  <Card className="w-full overflow-hidden transition-all hover:shadow-md cursor-pointer border-border-subtle flex flex-row min-h-[200px] max-h-[300px]">
                    {/* Left side: Tall Image Placeholder */}
                    <div className="relative w-[35%] min-w-[120px] max-w-[200px] bg-bg-hover flex items-center justify-center p-6 border-r border-border-subtle transition-colors shrink-0">
                      {product.product_media && product.product_media.length > 0 ? (
                        <Image
                          src={product.product_media[0].media_url}
                          alt={product.name}
                          fill
                          className="object-contain p-4"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-16 h-16 text-text-muted" strokeWidth={1} />
                      )}
                    </div>

                    {/* Right side: Product Data */}
                    <CardContent className="p-6 flex flex-col justify-center flex-1 overflow-hidden">
                      {/* Category */}
                      {product.category && (
                        <span className="text-xs font-bold tracking-widest uppercase text-primary mb-2 block truncate">
                          {product.category}
                        </span>
                      )}

                      {/* Product Name */}
                      <div className="mb-2 shrink-0">
                        <h3 className="font-extrabold text-xl md:text-2xl text-text-main leading-tight pr-2">
                          {product.name}
                        </h3>
                      </div>

                      {/* Product USP */}
                      {product.usp ? (
                        <p className="text-sm text-text-muted mt-2 line-clamp-4 leading-relaxed font-medium">
                          {product.usp}
                        </p>
                      ) : (
                        <p className="text-sm text-text-meta italic mt-2">
                          No USP detailed for this product.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-bg-card gap-0 border-border-subtle">
                  <div className="flex flex-col md:flex-row max-h-[85vh]">
                    {/* Dialog Left: Large Image */}
                    <div className="relative w-full md:w-[45%] bg-bg-hover flex items-center justify-center p-8 shrink-0 min-h-[300px] border-b md:border-b-0 md:border-r border-border-subtle">
                      {product.product_media && product.product_media.length > 0 ? (
                        <Image
                          src={product.product_media[0].media_url}
                          alt={product.name}
                          fill
                          className="object-contain p-8"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-32 h-32 text-text-muted" strokeWidth={1} />
                      )}
                    </div>

                    {/* Dialog Right: Scrollable Content */}
                    <div className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
                      <DialogHeader className="mb-8 text-left space-y-2">
                        {product.category && (
                          <span className="text-xs font-bold tracking-widest uppercase text-primary block">
                            {product.category}
                          </span>
                        )}
                        <DialogTitle className="text-3xl md:text-4xl font-extrabold text-text-main leading-tight">
                          {product.name}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          Detailed capabilities, applications, and guidelines for {product.name}
                        </DialogDescription>
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <span className="inline-block text-xs font-mono bg-bg-hover text-text-muted px-3 py-1.5 rounded-md border border-border-subtle">
                            SKU: {product.sku}
                          </span>
                          {product.ph_level !== null && (
                            <span className="inline-block text-xs font-bold font-mono bg-brand-accent/10 text-text-brand border border-brand-accent/20 px-3 py-1.5 rounded-md">
                              pH Level {product.ph_level}
                            </span>
                          )}
                        </div>
                      </DialogHeader>

                      <div className="space-y-8 text-sm text-text-main">
                        {product.description && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Description</h4>
                            <p className="leading-relaxed text-base">{product.description}</p>
                          </div>
                        )}
                        {product.features_benefits && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Features & Benefits</h4>
                            <p className="leading-relaxed whitespace-pre-wrap">{product.features_benefits}</p>
                          </div>
                        )}
                        {product.applications && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Applications</h4>
                            <p className="leading-relaxed whitespace-pre-wrap">{product.applications}</p>
                          </div>
                        )}
                        {product.directions_to_use && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Directions for Use</h4>
                            <p className="leading-relaxed whitespace-pre-wrap">{product.directions_to_use}</p>
                          </div>
                        )}
                        {product.ingredients && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 border-b border-border-subtle pb-2">Ingredients</h4>
                            <p className="leading-relaxed whitespace-pre-wrap">{product.ingredients}</p>
                          </div>
                        )}
                        {product.documents && product.documents.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 border-b border-border-subtle pb-2">Available Documents</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {product.documents.map((doc) => (
                                <div key={doc.id} className="flex flex-col gap-2 p-3 rounded-lg bg-bg-hover border border-border-subtle transition-colors">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-text-brand shrink-0" />
                                    <span className="text-sm font-medium line-clamp-1 flex-1">{doc.title}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <Badge variant="outline" className="text-[10px] leading-none py-0.5 px-1.5 font-mono border-border-subtle h-auto text-text-muted">
                                      {doc.category}
                                    </Badge>
                                    <ShareDocumentButton documentId={doc.id} title={doc.title} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <Package className="w-12 h-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No products found</h3>
            <p className="text-zinc-500 mt-1 max-w-sm">Try adjusting your filters or wait for admins to add products accessible to your region.</p>
          </div>
        )}
      </main>
    </div>
  )
}
