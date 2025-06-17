-- Create image_mappings table to track image status and order
CREATE TABLE IF NOT EXISTS public.image_mappings (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    google_drive_url TEXT NOT NULL,
    storage_path TEXT,
    display_order INTEGER NOT NULL,
    is_optimized BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT image_mappings_pkey PRIMARY KEY (id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_image_mappings_product_id ON public.image_mappings(product_id);
CREATE INDEX IF NOT EXISTS idx_image_mappings_display_order ON public.image_mappings(display_order);
CREATE INDEX IF NOT EXISTS idx_image_mappings_is_optimized ON public.image_mappings(is_optimized) WHERE is_optimized = false;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_image_mappings_updated_at
    BEFORE UPDATE ON public.image_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 